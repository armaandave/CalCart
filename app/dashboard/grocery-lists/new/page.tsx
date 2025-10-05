'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { Checkbox } from '@/components/ui/checkbox'

export default function NewGroceryListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { recipes, fetchRecipes } = useRecipeStore()
  const createList = useGroceryStore((state) => state.createList)

  const [name, setName] = useState('')
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRecipeIds.length === 0) {
      toast({
        title: 'No recipes selected',
        description: 'Please select at least one recipe',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const list = await createList(name, selectedRecipeIds)
      toast({
        title: 'Grocery list created!',
        description: 'Your shopping list has been generated.'
      })
      router.push(`/dashboard/grocery-lists/${list.id}`)
    } catch (error) {
      toast({
        title: 'Failed to create list',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Grocery List</h1>
        <p className="text-gray-600">Select recipes to generate your shopping list</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>List Details</CardTitle>
            <CardDescription>Name your grocery list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">List Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Weekly Meal Prep"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Recipes</CardTitle>
            <CardDescription>Choose recipes to include in this list</CardDescription>
          </CardHeader>
          <CardContent>
            {recipes.length === 0 ? (
              <p className="text-center py-8 text-gray-600">
                No recipes available. Create a recipe first.
              </p>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRecipe(recipe.id)}
                  >
                    <Checkbox
                      checked={selectedRecipeIds.includes(recipe.id)}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{recipe.name}</h4>
                      <p className="text-sm text-gray-600">
                        {recipe.servings} servings • {recipe.originalIngredients.length} ingredients
                        {recipe.isOptimized && (
                          <span className="ml-2 text-green-600">• Optimized</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || selectedRecipeIds.length === 0} className="flex-1">
            {isLoading ? 'Creating...' : `Create List (${selectedRecipeIds.length} recipes)`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

