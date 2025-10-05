import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { GoalType, BudgetType, Priority } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data with proper type validation
    const updateData: any = {}

    if (body.location !== undefined) updateData.location = body.location
    if (body.selectedStores !== undefined) updateData.selectedStores = body.selectedStores
    if (body.allergies !== undefined) updateData.allergies = body.allergies
    if (body.restrictions !== undefined) updateData.restrictions = body.restrictions
    if (body.preferences !== undefined) updateData.preferences = body.preferences
    if (body.goalType !== undefined) updateData.goalType = body.goalType as GoalType
    if (body.targetCalories !== undefined) updateData.targetCalories = body.targetCalories
    if (body.targetProtein !== undefined) updateData.targetProtein = body.targetProtein
    if (body.targetCarbs !== undefined) updateData.targetCarbs = body.targetCarbs
    if (body.targetFats !== undefined) updateData.targetFats = body.targetFats
    if (body.budgetType !== undefined) updateData.budgetType = body.budgetType as BudgetType
    if (body.budgetAmount !== undefined) updateData.budgetAmount = body.budgetAmount
    if (body.priorities !== undefined) updateData.priorities = body.priorities as Priority[]

    // Update or create profile
    let profile
    if (user.profile) {
      profile = await prisma.userProfile.update({
        where: { userId: session.userId },
        data: updateData
      })
    } else {
      // Create profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          userId: session.userId,
          location: updateData.location || '',
          selectedStores: updateData.selectedStores || [],
          allergies: updateData.allergies || [],
          restrictions: updateData.restrictions || [],
          preferences: updateData.preferences || [],
          goalType: updateData.goalType || GoalType.MAINTAIN,
          targetCalories: updateData.targetCalories,
          targetProtein: updateData.targetProtein,
          targetCarbs: updateData.targetCarbs,
          targetFats: updateData.targetFats,
          budgetType: updateData.budgetType || BudgetType.WEEKLY,
          budgetAmount: updateData.budgetAmount || 100,
          priorities: updateData.priorities || [Priority.HEALTH, Priority.BUDGET, Priority.TASTE]
        }
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

