import { NextRequest, NextResponse } from 'next/server'
import { instacartService } from '@/lib/services/instacart-mock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, storeId, limit } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const products = await instacartService.searchProducts(query, storeId, limit)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search products error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}

