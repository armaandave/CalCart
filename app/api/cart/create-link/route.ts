import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { instacartService } from '@/lib/services/instacart-mock'

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
    const { groceryListId, provider, storeId, items } = body

    if (!groceryListId || !provider || !storeId || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get grocery list
    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id: groceryListId,
        userId: session.userId
      }
    })

    if (!groceryList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      )
    }

    // Create deep link based on provider
    let deepLinkResponse

    if (provider === 'instacart') {
      deepLinkResponse = await instacartService.createDeepLink(
        items,
        storeId,
        session.userId
      )
    } else {
      return NextResponse.json(
        { error: 'Provider not supported yet' },
        { status: 400 }
      )
    }

    // Get store info
    const store = instacartService.getStoreById(storeId)
    const deliveryFee = store?.deliveryFee || 0

    // Save cart to database
    const cart = await prisma.shoppingCart.create({
      data: {
        userId: session.userId,
        groceryListId,
        provider,
        deepLink: deepLinkResponse.deepLink,
        estimatedTotal: deepLinkResponse.estimatedTotal,
        deliveryFee
      }
    })

    return NextResponse.json({
      deepLink: deepLinkResponse.deepLink,
      webLink: deepLinkResponse.webLink,
      cartId: cart.id,
      estimatedTotal: deepLinkResponse.estimatedTotal,
      deliveryFee,
      estimatedDeliveryTime: store?.estimatedDelivery || '1-2 hours',
      unavailableItems: deepLinkResponse.unavailableItems
    })
  } catch (error) {
    console.error('Create cart link error:', error)
    return NextResponse.json(
      { error: 'Failed to create cart link' },
      { status: 500 }
    )
  }
}

