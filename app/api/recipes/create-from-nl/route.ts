import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { recipeOptimizer } from '@/lib/services/recipe-optimizer'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { description } = body

    // Validate input
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Recipe description is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    const input = description.trim()
    const isUrl = (() => { try { const u = new URL(input); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false } })()

    // Use Gemini optimizer for both URL and NL (URL Context enabled in optimizer)
    const baseRecipe = await recipeOptimizer.createRecipeFromNaturalLanguage(input, user.profile)

    // Create recipe as ORIGINAL first (not optimized)
    const created = await prisma.recipe.create({
      data: {
        userId: session.userId,
        name: baseRecipe.name,
        description: baseRecipe.description || '',
        servings: baseRecipe.servings || 4,
        instructions: baseRecipe.instructions,
        isOptimized: false,
        originalIngredients: {
          create: baseRecipe.ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity || 1,
            unit: ing.unit || 'unit',
            category: ing.category || 'other',
            notes: ing.notes,
            isOptional: false
          }))
        }
      },
      include: {
        originalIngredients: true,
        optimizedIngredients: true,
        originalNutrition: true,
        optimizedNutrition: true
      }
    })

    // Refetch to ensure correct type shape (with relations) before optimize
    const recipeForOptimize = await prisma.recipe.findFirst({
      where: { id: created.id, userId: session.userId },
      include: { originalIngredients: true, originalNutrition: true }
    })

    if (!recipeForOptimize) {
      return NextResponse.json({ error: 'Recipe not found after creation' }, { status: 500 })
    }

    // Optimize after creation so diffs are visible
    const optimized = await recipeOptimizer.optimizeRecipe(recipeForOptimize as any, user.profile)

    // Persist optimized data
    await prisma.recipeIngredient.deleteMany({ where: { optimizedRecipeId: created.id } })
    await prisma.nutrition.deleteMany({ where: { optimizedRecipeId: created.id } })
    await prisma.recipeIngredient.createMany({
      data: optimized.optimizedIngredients.map((ing: any) => ({
        optimizedRecipeId: created.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        notes: ing.notes,
        isSubstitution: ing.isSubstitution || false,
        originalIngredient: ing.originalIngredient
      }))
    })
    await prisma.nutrition.create({
      data: {
        optimizedRecipeId: created.id,
        calories: optimized.nutrition.calories,
        protein: optimized.nutrition.protein,
        carbs: optimized.nutrition.carbs,
        fats: optimized.nutrition.fats,
        fiber: optimized.nutrition.fiber,
        sugar: optimized.nutrition.sugar,
        sodium: optimized.nutrition.sodium
      }
    })

    const finalRecipe = await prisma.recipe.update({
      where: { id: created.id },
      data: {
        isOptimized: true,
        optimizationNotes: optimized.notes
      },
      include: {
        originalIngredients: true,
        optimizedIngredients: true,
        originalNutrition: true,
        optimizedNutrition: true
      }
    })

    return NextResponse.json({ recipe: finalRecipe })
  } catch (error) {
    console.error('Create recipe from natural language error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create recipe from description' },
      { status: 500 }
    )
  }
}
