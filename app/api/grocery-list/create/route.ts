import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { consolidateUnits, convertUnit } from '@/lib/utils'

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
    const { name, recipeIds = [], customItems = [], weekStartDate } = body

    if (!name || (recipeIds.length === 0 && customItems.length === 0)) {
      return NextResponse.json(
        { error: 'Name and at least one recipe or custom item are required' },
        { status: 400 }
      )
    }

    // Get recipes with ingredients
    const recipes = recipeIds.length > 0 ? await prisma.recipe.findMany({
      where: {
        id: { in: recipeIds },
        userId: session.userId
      },
      include: {
        optimizedIngredients: true,
        originalIngredients: true
      }
    }) : []

    // Consolidate ingredients
    const ingredientMap = new Map<string, {
      name: string
      quantity: number
      unit: string
      category: string
      recipeIds: string[]
    }>()

    // Add recipe ingredients
    for (const recipe of recipes) {
      const ingredients = recipe.isOptimized
        ? recipe.optimizedIngredients
        : recipe.originalIngredients

      for (const ingredient of ingredients) {
        const normalizedUnit = consolidateUnits(ingredient.unit)
        const key = `${ingredient.name.toLowerCase()}-${normalizedUnit}`

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!
          existing.quantity += ingredient.quantity
          existing.recipeIds.push(recipe.id)
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: normalizedUnit,
            category: ingredient.category,
            recipeIds: [recipe.id]
          })
        }
      }
    }

    // Add custom items
    for (const item of customItems) {
      const normalizedUnit = consolidateUnits(item.unit)
      const key = `${item.name.toLowerCase()}-${normalizedUnit}`

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        existing.quantity += item.quantity
      } else {
        ingredientMap.set(key, {
          name: item.name,
          quantity: item.quantity,
          unit: normalizedUnit,
          category: item.category || 'Other',
          recipeIds: []
        })
      }
    }

    // Create grocery list
    const groceryList = await prisma.groceryList.create({
      data: {
        userId: session.userId,
        name,
        weekStartDate: weekStartDate ? new Date(weekStartDate) : null,
        items: {
          create: Array.from(ingredientMap.values()).map(item => ({
            name: item.name,
            quantity: Math.ceil(item.quantity * 100) / 100, // Round to 2 decimals
            unit: item.unit,
            category: item.category,
            recipeId: item.recipeIds.length > 0 ? item.recipeIds[0] : null // Associate with first recipe if available
          }))
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({
      groceryList,
      consolidatedItems: groceryList.items
    })
  } catch (error) {
    console.error('Create grocery list error:', error)
    return NextResponse.json(
      { error: 'Failed to create grocery list' },
      { status: 500 }
    )
  }
}

