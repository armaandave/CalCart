import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { GoalType, BudgetType, Priority } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, profile } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        profile: profile
          ? {
              create: {
                location: profile.location || '',
                selectedStores: profile.selectedStores || [],
                allergies: profile.allergies || [],
                restrictions: profile.restrictions || [],
                preferences: profile.preferences || [],
                goalType: profile.goalType || GoalType.MAINTAIN,
                targetCalories: profile.targetCalories,
                targetProtein: profile.targetProtein,
                targetCarbs: profile.targetCarbs,
                targetFats: profile.targetFats,
                budgetType: profile.budgetType || BudgetType.WEEKLY,
                budgetAmount: profile.budgetAmount || 100,
                priorities: profile.priorities || [Priority.HEALTH, Priority.BUDGET, Priority.TASTE]
              }
            }
          : undefined
      },
      include: {
        profile: true
      }
    })

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      },
      token
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

