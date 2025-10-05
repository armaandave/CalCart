import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { priceEngine } from '@/lib/services/price-engine'

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
    const { groceryListId, storeIds } = body

    if (!groceryListId || !storeIds || storeIds.length === 0) {
      return NextResponse.json(
        { error: 'Grocery list ID and store IDs are required' },
        { status: 400 }
      )
    }

    // Get grocery list
    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id: groceryListId,
        userId: session.userId
      },
      include: {
        items: true
      }
    })

    if (!groceryList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      )
    }

    // Get price comparisons
    const { itemPrices, recommendations } = await priceEngine.comparePrices(
      groceryList.items,
      storeIds
    )

    // Save price comparisons to database
    for (const itemPrice of itemPrices) {
      // Delete old comparisons
      await prisma.priceComparison.deleteMany({
        where: { itemId: itemPrice.itemId }
      })

      // Create new comparisons
      await prisma.priceComparison.createMany({
        data: itemPrice.comparisons.map(comparison => ({
          itemId: itemPrice.itemId,
          storeId: comparison.storeId,
          storeName: comparison.storeName,
          price: comparison.price,
          available: comparison.available
        }))
      })
    }

    return NextResponse.json({
      priceComparisons: itemPrices,
      recommendations
    })
  } catch (error) {
    console.error('Price comparison error:', error)
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    )
  }
}

