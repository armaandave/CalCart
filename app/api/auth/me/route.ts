import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('GET /api/auth/me - Request received')
    const session = await getSession()

    if (!session) {
      console.log('GET /api/auth/me - No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('GET /api/auth/me - Session found for user:', session.userId)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    })

    if (!user) {
      console.log('GET /api/auth/me - User not found in database, clearing cookie')
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
      // Clear the invalid cookie
      response.cookies.delete('auth-token')
      return response
    }

    console.log('GET /api/auth/me - User found, returning data')
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('GET /api/auth/me - Error:', error)
    return NextResponse.json(
      { error: 'Failed to get user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

