import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groceryLists = await prisma.groceryList.findMany({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            priceComparisons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ groceryLists })
  } catch (error) {
    console.error('List grocery lists error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grocery lists' },
      { status: 500 }
    )
  }
}

