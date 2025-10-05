'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { Plus, ChefHat, List } from 'lucide-react'

export default function DashboardPage() {
  const { recipes, fetchRecipes } = useRecipeStore()
  const { groceryLists, fetchGroceryLists } = useGroceryStore()

  useEffect(() => {
    fetchRecipes()
    fetchGroceryLists()
  }, [fetchRecipes, fetchGroceryLists])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your cooking overview.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Recipes</CardTitle>
            <CardDescription>All your saved recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{recipes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimized Recipes</CardTitle>
            <CardDescription>Health-optimized versions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {recipes.filter(r => r.isOptimized).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grocery Lists</CardTitle>
            <CardDescription>Your shopping lists</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{groceryLists.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Recipes</CardTitle>
            <CardDescription>Your latest recipe additions</CardDescription>
          </CardHeader>
          <CardContent>
            {recipes.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No recipes yet</p>
                <Link href="/dashboard/recipes/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.slice(0, 3).map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/dashboard/recipes/${recipe.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h4 className="font-medium">{recipe.name}</h4>
                    <p className="text-sm text-gray-600">
                      {recipe.servings} servings
                      {recipe.isOptimized && (
                        <span className="ml-2 text-green-600">• Optimized</span>
                      )}
                    </p>
                  </Link>
                ))}
                <Link href="/dashboard/recipes">
                  <Button variant="outline" className="w-full">
                    View All Recipes
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Grocery Lists</CardTitle>
            <CardDescription>Your latest shopping lists</CardDescription>
          </CardHeader>
          <CardContent>
            {groceryLists.length === 0 ? (
              <div className="text-center py-8">
                <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No grocery lists yet</p>
                <Link href="/dashboard/grocery-lists/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create List
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {groceryLists.slice(0, 3).map((list) => (
                  <Link
                    key={list.id}
                    href={`/dashboard/grocery-lists/${list.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h4 className="font-medium">{list.name}</h4>
                    <p className="text-sm text-gray-600">
                      {list.items.length} items
                    </p>
                  </Link>
                ))}
                <Link href="/dashboard/grocery-lists">
                  <Button variant="outline" className="w-full">
                    View All Lists
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

