'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useRecipeStore } from '@/lib/stores/recipeStore'
import { Plus, Minus, Sparkles, Link as LinkIcon } from 'lucide-react'

export default function NewRecipePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { createRecipe, createRecipeFromNaturalLanguage } = useRecipeStore()

  // Manual entry state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [servings, setServings] = useState(4)
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: 1, unit: '', category: 'other' }
  ])
  const [instructions, setInstructions] = useState([''])
  
  // Natural language / URL state
  const [nlDescription, setNlDescription] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('manual')

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: '', category: 'other' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ''])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const recipe = await createRecipe({
        name,
        description,
        servings,
        ingredients: ingredients.filter(ing => ing.name && ing.unit),
        instructions: instructions.filter(inst => inst.trim())
      })

      toast({
        title: 'Recipe created!',
        description: 'Your recipe has been saved successfully.'
      })

      router.push(`/dashboard/recipes/${recipe.id}`)
    } catch (error) {
      toast({
        title: 'Failed to create recipe',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const recipe = await createRecipeFromNaturalLanguage(nlDescription)

      toast({
        title: 'Recipe created with AI!',
        description: 'Your recipe has been generated and optimized for your health goals.'
      })

      router.push(`/dashboard/recipes/${recipe.id}`)
    } catch (error) {
      toast({
        title: 'Failed to create recipe',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Recipe</h1>
        <p className="text-gray-600">Add your recipe manually or describe what you want to cook</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your recipe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Spaghetti Carbonara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="A brief description of your dish"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings *</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>List all ingredients with quantities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="col-span-5"
                      required
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                      className="col-span-2"
                      required
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="col-span-4"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      className="col-span-1"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>Step-by-step cooking instructions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center font-medium text-gray-600">
                      {index + 1}.
                    </div>
                    <Input
                      placeholder="Describe this step"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      disabled={instructions.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating...' : 'Create Recipe'}
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
        </TabsContent>

        <TabsContent value="ai">
          <form onSubmit={handleNaturalLanguageSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Sparkles className="h-5 w-5 inline mr-2" />
                  AI-Powered Recipe Generation
                </CardTitle>
                <CardDescription>
                  Describe what you want to cook, paste a recipe URL, or just name a dish. 
                  Our AI will create a complete recipe optimized for your health goals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nl-description">Recipe Description or URL *</Label>
                  <Textarea
                    id="nl-description"
                    placeholder="Examples:&#10;• High-protein chicken pasta&#10;• Low-carb vegetarian stir fry with tofu&#10;• https://www.allrecipes.com/recipe/...&#10;• Healthy breakfast smoothie bowl"
                    value={nlDescription}
                    onChange={(e) => setNlDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-900 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    How it works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                    <li>AI generates a complete recipe with ingredients and instructions</li>
                    <li>Automatically optimized for your dietary goals and restrictions</li>
                    <li>Includes nutritional information per serving</li>
                    <li>Can parse recipe URLs or create from descriptions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Recipe
                  </>
                )}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}