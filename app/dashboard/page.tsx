'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { useUserStore } from '@/lib/stores/userStore'
import { Plus, ShoppingCart, DollarSign, TrendingUp, ChefHat } from 'lucide-react'

export default function DashboardPage() {
  const { recipes, fetchRecipes } = useRecipeStore()
  const { groceryLists, fetchGroceryLists } = useGroceryStore()
  const { user } = useUserStore()

  useEffect(() => {
    fetchRecipes()
    fetchGroceryLists()
  }, [fetchRecipes, fetchGroceryLists])

  const optimizedRecipes = recipes.filter(r => r.isOptimized).length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-500 text-lg">Here&apos;s your nutrition overview for this week</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Recipes Optimized */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-2">Recipes Optimized</p>
              <p className="text-4xl font-bold">{optimizedRecipes}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">12%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Money Saved */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-2">Money Saved</p>
              <p className="text-4xl font-bold">$0</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">0%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Grocery Lists */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-2">Grocery Lists</p>
              <p className="text-4xl font-bold">0</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm font-medium">0%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Recipe */}
          <Link href="/dashboard/recipes/new">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Add New Recipe</h3>
                  <p className="text-gray-500 text-sm">Optimize a new recipe</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Create Grocery List */}
          <Link href="/dashboard/grocery-lists/new">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Create Grocery List</h3>
                  <p className="text-gray-500 text-sm">From your recipes</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

