import { create } from 'zustand'
import { Recipe } from '@prisma/client'
import { RecipeInput } from '@/lib/types'

interface RecipeWithRelations extends Recipe {
  originalIngredients: any[]
  optimizedIngredients: any[]
  originalNutrition: any
  optimizedNutrition: any
}

interface RecipeStore {
  recipes: RecipeWithRelations[]
  currentRecipe: RecipeWithRelations | null
  isOptimizing: boolean
  isLoading: boolean
  error: string | null
  
  fetchRecipes: () => Promise<void>
  fetchRecipe: (id: string) => Promise<void>
  createRecipe: (input: RecipeInput) => Promise<RecipeWithRelations>
  optimizeRecipe: (recipeId: string) => Promise<void>
  deleteRecipe: (recipeId: string) => Promise<void>
  setCurrentRecipe: (recipe: RecipeWithRelations | null) => void
  clearError: () => void
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  isOptimizing: false,
  isLoading: false,
  error: null,

  fetchRecipes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/recipes/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      set({ recipes: data.recipes })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Fetch recipes error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRecipe: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/recipes/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe')
      }

      const data = await response.json()
      set({ currentRecipe: data.recipe })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Fetch recipe error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createRecipe: async (input) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        throw new Error('Failed to create recipe')
      }

      const data = await response.json()
      set((state) => ({
        recipes: [data.recipe, ...state.recipes],
        currentRecipe: data.recipe
      }))
      
      return data.recipe
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Create recipe error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  optimizeRecipe: async (recipeId) => {
    set({ isOptimizing: true, error: null })
    try {
      const response = await fetch('/api/recipes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to optimize recipe')
      }

      const data = await response.json()
      
      set((state) => ({
        currentRecipe: data.optimizedRecipe,
        recipes: state.recipes.map(r =>
          r.id === recipeId ? data.optimizedRecipe : r
        )
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Optimize recipe error:', error)
      throw error
    } finally {
      set({ isOptimizing: false })
    }
  },

  deleteRecipe: async (recipeId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      set((state) => ({
        recipes: state.recipes.filter(r => r.id !== recipeId),
        currentRecipe: state.currentRecipe?.id === recipeId ? null : state.currentRecipe
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Delete recipe error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  
  clearError: () => set({ error: null })
}))

