'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Trash2, ArrowLeft } from 'lucide-react'
import { diffIngredients, diffNutrition } from '@/lib/utils/diff'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { currentRecipe, fetchRecipe, optimizeRecipe, deleteRecipe, isOptimizing } = useRecipeStore()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRecipe(params.id as string)
    }
  }, [params.id, fetchRecipe])

  const handleOptimize = async () => {
    if (!currentRecipe) return

    try {
      await optimizeRecipe(currentRecipe.id)
      toast({
        title: 'Recipe optimized!',
        description: 'Your recipe has been optimized for your health goals.'
      })
    } catch (error) {
      toast({
        title: 'Optimization failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!currentRecipe) return
    if (!confirm('Are you sure you want to delete this recipe?')) return

    setIsDeleting(true)
    try {
      await deleteRecipe(currentRecipe.id)
      toast({
        title: 'Recipe deleted',
        description: 'Your recipe has been removed.'
      })
      router.push('/dashboard/recipes')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Please try again',
        variant: 'destructive'
      })
      setIsDeleting(false)
    }
  }

  if (!currentRecipe) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Loading recipe...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {!currentRecipe.isOptimized && (
            <Button onClick={handleOptimize} disabled={isOptimizing}>
              <Sparkles className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Recipe'}
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{currentRecipe.name}</h1>
        {currentRecipe.description && (
          <p className="text-gray-600">{currentRecipe.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span>Servings: {currentRecipe.servings}</span>
          {currentRecipe.isOptimized && (
            <span className="text-green-600 font-medium">✓ Optimized</span>
          )}
        </div>
      </div>

      {currentRecipe.isOptimized && currentRecipe.optimizedNutrition && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Nutrition Information (Per Serving)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-green-700">Calories</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(currentRecipe.optimizedNutrition.calories / currentRecipe.servings)}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Protein</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(currentRecipe.optimizedNutrition.protein / currentRecipe.servings)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Carbs</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(currentRecipe.optimizedNutrition.carbs / currentRecipe.servings)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Fats</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(currentRecipe.optimizedNutrition.fats / currentRecipe.servings)}g
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentRecipe.isOptimized ? 'Optimized Ingredients' : 'Ingredients'}
            </CardTitle>
            <CardDescription>
              {currentRecipe.isOptimized
                ? 'Health-optimized ingredient list'
                : 'Original ingredient list'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(currentRecipe.isOptimized
                ? currentRecipe.optimizedIngredients
                : currentRecipe.originalIngredients
              ).map((ingredient: any) => (
                <li key={ingredient.id} className="flex justify-between">
                  <span>
                    {ingredient.name}
                    {ingredient.isSubstitution && (
                      <span className="ml-2 text-xs text-green-600">(substituted)</span>
                    )}
                  </span>
                  <span className="text-gray-600">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Step-by-step cooking guide</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {currentRecipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {currentRecipe.isOptimized && currentRecipe.optimizationNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Notes</CardTitle>
            <CardDescription>Why these changes were made</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentRecipe.optimizationNotes.map((note: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {currentRecipe.isOptimized && (() => {
        const ingredientChanges = diffIngredients(
          currentRecipe.originalIngredients.map((i: any) => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
          currentRecipe.optimizedIngredients.map((i: any) => ({ name: i.name, quantity: i.quantity, unit: i.unit }))
        ).filter(d => d.change !== 'unchanged')

        const nutritionChanges = currentRecipe.originalNutrition && currentRecipe.optimizedNutrition
          ? diffNutrition(currentRecipe.originalNutrition, currentRecipe.optimizedNutrition).filter(d => d.delta !== 0)
          : []

        const hasChanges = ingredientChanges.length > 0 || nutritionChanges.length > 0

        return (
          <Card>
            <CardHeader>
              <CardTitle>Changes</CardTitle>
              <CardDescription>What changed from the original</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasChanges ? (
                <p className="text-sm text-gray-600">
                  No changes - this recipe was created already optimized for your health goals.
                </p>
              ) : (
                <>
                  {ingredientChanges.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Ingredients</h3>
                      <ul className="space-y-1 text-sm">
                        {ingredientChanges.map((d, idx) => (
                          <li key={idx} className={d.change === 'added' ? 'text-green-700' : d.change === 'removed' ? 'text-red-700' : 'text-blue-700'}>
                            {d.change === 'added' && (
                              <span>+ {d.after!.name} {d.after!.quantity} {d.after!.unit}</span>
                            )}
                            {d.change === 'removed' && (
                              <span>- {d.before!.name} {d.before!.quantity} {d.before!.unit}</span>
                            )}
                            {d.change === 'modified' && (
                              <span>
                                ~ {d.before!.name}: {d.before!.quantity} {d.before!.unit} → {d.after!.quantity} {d.after!.unit}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nutritionChanges.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Nutrition (total recipe)</h3>
                      <ul className="space-y-1 text-sm">
                        {nutritionChanges.map((d, idx) => (
                          <li key={idx} className={d.delta < 0 ? 'text-green-700' : 'text-red-700'}>
                            {d.delta < 0 ? '-' : '+'} {d.key}: {Math.round(Math.abs(d.delta))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}

