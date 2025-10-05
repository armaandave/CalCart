'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChefHat } from 'lucide-react'

export default function RecipesPage() {
  const { recipes, fetchRecipes, isLoading } = useRecipeStore()

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Loading recipes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
          <p className="text-gray-600">Manage and optimize your recipes</p>
        </div>
        <Link href="/dashboard/recipes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first recipe to get started with health optimization
              </p>
              <Link href="/dashboard/recipes/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Recipe
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/dashboard/recipes/${recipe.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                  <CardDescription>
                    {recipe.servings} servings • {recipe.originalIngredients.length} ingredients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recipe.isOptimized ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium">Optimized</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="text-sm">Not optimized</span>
                    </div>
                  )}
                  {recipe.optimizedNutrition && (
                    <div className="mt-4 pt-4 border-t text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span className="font-medium">
                          {Math.round(recipe.optimizedNutrition.calories / recipe.servings)} per serving
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-medium">
                          {Math.round(recipe.optimizedNutrition.protein / recipe.servings)}g
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

