import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groceryList = await prisma.groceryList.findFirst({
      where: {
        id: params.id,
        userId: session.userId
      },
      include: {
        items: {
          include: {
            priceComparisons: true
          }
        }
      }
    })

    if (!groceryList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ groceryList })
  } catch (error) {
    console.error('Get grocery list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.groceryList.delete({
      where: {
        id: params.id,
        userId: session.userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete grocery list error:', error)
    return NextResponse.json(
      { error: 'Failed to delete grocery list' },
      { status: 500 }
    )
  }
}

