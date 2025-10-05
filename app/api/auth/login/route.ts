import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Login request received')
    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt for email:', email)

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    console.log('Looking up user in database...')
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('User found, verifying password...')
    // Verify password
    const isValid = await verifyPassword(password, user.hashedPassword)

    if (!isValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Password valid, creating token...')
    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email
    })

    console.log('Setting auth cookie...')
    // Set cookie
    await setAuthCookie(token)

    console.log('Login successful')
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

