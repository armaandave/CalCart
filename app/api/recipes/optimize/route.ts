import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { recipeOptimizer } from '@/lib/services/recipe-optimizer'
import { calculateNutritionDiff } from '@/lib/utils'

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
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Get recipe
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        userId: session.userId
      },
      include: {
        originalIngredients: true,
        originalNutrition: true
      }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Optimize recipe
    const optimization = await recipeOptimizer.optimizeRecipe(recipe, user.profile)

    // Delete existing optimized data
    if (recipe.originalNutrition) {
      await prisma.nutrition.deleteMany({
        where: { optimizedRecipeId: recipe.id }
      })
    }
    await prisma.recipeIngredient.deleteMany({
      where: { optimizedRecipeId: recipe.id }
    })

    // Create optimized ingredients
    await prisma.recipeIngredient.createMany({
      data: optimization.optimizedIngredients.map(ing => ({
        optimizedRecipeId: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        notes: ing.notes,
        isSubstitution: ing.isSubstitution,
        originalIngredient: ing.originalIngredient
      }))
    })

    // Create optimized nutrition
    const optimizedNutrition = await prisma.nutrition.create({
      data: {
        optimizedRecipeId: recipe.id,
        calories: optimization.nutrition.calories,
        protein: optimization.nutrition.protein,
        carbs: optimization.nutrition.carbs,
        fats: optimization.nutrition.fats,
        fiber: optimization.nutrition.fiber,
        sugar: optimization.nutrition.sugar,
        sodium: optimization.nutrition.sodium
      }
    })

    // Update recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        isOptimized: true,
        optimizationNotes: optimization.notes
      },
      include: {
        originalIngredients: true,
        optimizedIngredients: true,
        originalNutrition: true,
        optimizedNutrition: true
      }
    })

    // Calculate changes
    const changes = optimization.substitutions.map(sub => {
      const nutritionDiff = recipe.originalNutrition && optimizedNutrition
        ? calculateNutritionDiff(recipe.originalNutrition, optimizedNutrition)
        : null

      return {
        original: sub.original,
        substitution: sub.replacement,
        reason: sub.reason,
        nutritionImpact: nutritionDiff
      }
    })

    return NextResponse.json({
      optimizedRecipe: updatedRecipe,
      changes
    })
  } catch (error) {
    console.error('Optimize recipe error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize recipe: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

