import { NextResponse } from 'next/server'
import { instacartService } from '@/lib/services/instacart-mock'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const stores = instacartService.getStores()
    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Get stores error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

