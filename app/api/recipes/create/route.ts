import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
export const dynamic = 'force-dynamic'

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
    const { name, description, servings, ingredients, instructions } = body

    // Validate input
    if (!name || !ingredients || !instructions) {
      return NextResponse.json(
        { error: 'Name, ingredients, and instructions are required' },
        { status: 400 }
      )
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        userId: session.userId,
        name,
        description,
        servings: servings || 4,
        instructions,
        originalIngredients: {
          create: ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category || 'other',
            notes: ing.notes,
            isOptional: ing.isOptional || false
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
    console.error('Create recipe error:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}

