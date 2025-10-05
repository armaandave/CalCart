import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { recipeUrlParser } from '@/lib/services/recipe-url-parser'

/**
 * Create recipe from URL
 * Parses recipe websites and extracts structured data
 */
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
    const { url } = body

    // Validate input
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Recipe URL is required' },
        { status: 400 }
      )
    }

    // Validate it's actually a URL
    if (!recipeUrlParser.isUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Parse recipe from URL
    const parsedRecipe = await recipeUrlParser.parseFromUrl(url)

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        userId: session.userId,
        name: parsedRecipe.name,
        description: parsedRecipe.description || '',
        servings: parsedRecipe.servings || 4,
        instructions: parsedRecipe.instructions,
        originalIngredients: {
          create: parsedRecipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity || 1,
            unit: ing.unit || 'unit',
            category: 'other',
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

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Create recipe from URL error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to create recipe from URL. Try describing the recipe instead.' 
      },
      { status: 500 }
    )
  }
}
