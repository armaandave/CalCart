'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
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
  const [addItemInput, setAddItemInput] = useState('')
  const [customItems, setCustomItems] = useState<Array<{ id: string, name: string, unit: string, quantity: number, category?: string }>>([])
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())

  const hasSyncedSelectedIds = useRef(false)
  const hasSyncedCustomItems = useRef(false)
  const hasSyncedRemovedKeys = useRef(false)

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  // Persist and restore master list selections across navigation
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('newList:selectedRecipeIds')
      const savedCustom = localStorage.getItem('newList:customItems')
      const savedRemoved = localStorage.getItem('newList:removedKeys')
      if (savedIds) setSelectedRecipeIds(JSON.parse(savedIds))
      if (savedCustom) setCustomItems(JSON.parse(savedCustom))
      if (savedRemoved) setRemovedKeys(new Set(JSON.parse(savedRemoved)))
    } catch {}
  }, [])

  useEffect(() => {
    if (!hasSyncedSelectedIds.current) {
      hasSyncedSelectedIds.current = true
      return
    }
    try {
      localStorage.setItem('newList:selectedRecipeIds', JSON.stringify(selectedRecipeIds))
    } catch {}
  }, [selectedRecipeIds])

  useEffect(() => {
    if (!hasSyncedCustomItems.current) {
      hasSyncedCustomItems.current = true
      return
    }
    try {
      localStorage.setItem('newList:customItems', JSON.stringify(customItems))
    } catch {}
  }, [customItems])

  useEffect(() => {
    if (!hasSyncedRemovedKeys.current) {
      hasSyncedRemovedKeys.current = true
      return
    }
    try {
      localStorage.setItem('newList:removedKeys', JSON.stringify(Array.from(removedKeys)))
    } catch {}
  }, [removedKeys])

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  const selectedRecipes = useMemo(() => {
    const idSet = new Set(selectedRecipeIds)
    return recipes.filter(r => idSet.has(r.id))
  }, [recipes, selectedRecipeIds])

  const aggregatedItems = useMemo(() => {
    type Aggregated = {
      id: string
      name: string
      unit: string
      quantity: number
      category?: string
    }

    // Group by name only (ignore units/measurements)
    const mergeKey = (name?: string) => `${(name || '').trim().toLowerCase()}`

    const map = new Map<string, Aggregated>()

    for (const recipe of selectedRecipes) {
      const ingredients = (Array.isArray((recipe as any).optimizedIngredients) && (recipe as any).optimizedIngredients.length > 0)
        ? (recipe as any).optimizedIngredients
        : (recipe as any).originalIngredients || []

      for (const ing of ingredients) {
        const name = (ing?.name ?? '').toString()
        const unit = (ing?.unit ?? '').toString()
        const qty = Number(ing?.quantity ?? 0) || 0
        const key = mergeKey(name)
        const existing = map.get(key)
        if (existing) {
          existing.quantity += qty
        } else {
          map.set(key, {
            id: key,
            name,
            unit: '',
            quantity: qty,
            category: ing?.category,
          })
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedRecipes])

  const allItems = useMemo(() => {
    const items = [...aggregatedItems, ...customItems]
    return items.filter(item => !removedKeys.has(`${item.name.toLowerCase()}`))
  }, [aggregatedItems, customItems, removedKeys])

  const parseQuantityUnitName = (raw: string): { quantity: number, unit: string, name: string } => {
    let input = raw.trim()
    if (!input) return { quantity: 1, unit: '', name: '' }

    // Support mixed numbers like "1 1/2" and fractions like "1/2"
    const fractionToNumber = (s: string): number => {
      if (/^\d+\s+\d+\/\d+$/.test(s)) {
        const [whole, frac] = s.split(/\s+/)
        const [n, d] = frac.split('/').map(Number)
        return Number(whole) + (d ? n / d : 0)
      }
      if (/^\d+\/\d+$/.test(s)) {
        const [n, d] = s.split('/').map(Number)
        return d ? n / d : Number(s)
      }
      return Number(s)
    }

    const tokens = input.split(/\s+/)
    let quantity = 1
    let unit = ''
    let startIdx = 0

    // Parse leading quantity token(s)
    if (tokens.length > 0) {
      const q = fractionToNumber(tokens[0])
      if (!isNaN(q) && q > 0) {
        quantity = q
        startIdx = 1
        // Check for mixed number like: 1 1/2
        if (tokens[1] && /^(\d+\/\d+)$/.test(tokens[1])) {
          const q2 = fractionToNumber(tokens[1])
          if (!isNaN(q2) && q2 > 0) {
            quantity += q2
            startIdx = 2
          }
        }
      }
    }

    // Common units (basic set)
    const unitSet = new Set([
      'g','gram','grams','kg','kilogram','kilograms',
      'ml','milliliter','milliliters','l','liter','liters',
      'tsp','teaspoon','teaspoons','tbsp','tablespoon','tablespoons',
      'cup','cups','oz','ounce','ounces','lb','pound','pounds',
      'clove','cloves','slice','slices','pinch','dash',
      'piece','pieces','can','cans','pack','packs'
    ])

    if (tokens[startIdx] && unitSet.has(tokens[startIdx].toLowerCase())) {
      unit = tokens[startIdx]
      startIdx += 1
    }

    const name = tokens.slice(startIdx).join(' ').trim()
    return { quantity: quantity || 1, unit, name }
  }

  const addCustomItem = () => {
    const raw = addItemInput.trim()
    if (!raw) return
    const { name } = parseQuantityUnitName(raw)
    if (!name) return
    const key = `${name.toLowerCase()}`
    setCustomItems((prev) => {
      const existing = prev.find(p => `${p.name.toLowerCase()}` === key)
      if (existing) {
        return prev
      }
      return [...prev, { id: key, name, unit: '', quantity: 1 }]
    })
    setRemovedKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setAddItemInput('')
  }

  const removeItem = (name: string) => {
    const key = `${name.toLowerCase()}`
    setRemovedKeys((prev) => new Set(prev).add(key))
    setCustomItems((prev) => prev.filter(p => `${p.name.toLowerCase()}` !== key))
  }

  const clearMasterList = () => {
    setSelectedRecipeIds([])
    setCustomItems([])
    setRemovedKeys(new Set())
    try {
      localStorage.removeItem('newList:selectedRecipeIds')
      localStorage.removeItem('newList:customItems')
      localStorage.removeItem('newList:removedKeys')
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (allItems.length === 0) {
      toast({
        title: 'Nothing to compare',
        description: 'Add items or select at least one recipe',
        variant: 'destructive'
      })
      return
    }
    router.push('/dashboard/stores')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Grocery List</h1>
          <p className="text-gray-600">Toggle recipes on the left to build your master list or add custom items below.</p>
        </div>
        <Link href="/dashboard/grocery-lists/manage" className="md:mt-1">
          <Button variant="outline">Manage Lists</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Left: Recipe toggles sidebar */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>Select recipes to include</CardDescription>
          </CardHeader>
          <CardContent>
            {recipes.length === 0 ? (
              <p className="text-sm text-gray-600">No recipes yet. Create a recipe first.</p>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => {
                  const checked = selectedRecipeIds.includes(recipe.id)
                  return (
                    <div
                      key={recipe.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${checked ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleRecipe(recipe.id)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRecipe(recipe.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium truncate">{recipe.name}</h4>
                        <p className="text-xs text-gray-600">
                          {recipe.servings} servings • {(recipe as any).originalIngredients?.length ?? 0} ingredients
                          {recipe.isOptimized && (
                            <span className="ml-2 text-green-600">• Optimized</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Add Items + Master Grocery List */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
              <CardDescription>Type an item name to include it in your list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="add-item">Add Item</Label>
                <div className="flex gap-2">
                  <Input
                    id="add-item"
                    placeholder="Type an item and press Enter (e.g., Eggs)"
                    value={addItemInput}
                    onChange={(e) => setAddItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomItem()
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addCustomItem}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Master Grocery List</CardTitle>
              <CardDescription>
                Auto-built from toggled recipes. Quantities are summed by item and unit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allItems.length === 0 ? (
                <p className="text-sm text-gray-600">Add items above or toggle recipes to populate the list.</p>
              ) : (
                <ul className="divide-y">
                  {allItems.map(item => (
                    <li key={`${item.name}`} className="py-2 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {item.name}
                        </div>
                        {item.category ? (
                          <div className="text-xs text-gray-500">{item.category}</div>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 px-2 text-gray-600"
                        onClick={() => removeItem(item.name)}
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" disabled={allItems.length === 0} onClick={clearMasterList}>
              Clear
            </Button>
            <Button type="submit" disabled={isLoading || allItems.length === 0} className="flex-1">
              {isLoading ? 'Continuing...' : 'Continue to Price Comparison'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
