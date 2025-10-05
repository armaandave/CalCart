import { create } from 'zustand'
import { GroceryList, GroceryListItem, PriceComparison } from '@prisma/client'
import { PriceComparisonResult, StoreRecommendation } from '@/lib/types'

interface GroceryListWithItems extends GroceryList {
  items: (GroceryListItem & { priceComparisons: PriceComparison[] })[]
}

interface GroceryStore {
  groceryLists: GroceryListWithItems[]
  currentList: GroceryListWithItems | null
  priceComparisons: PriceComparisonResult[]
  recommendations: StoreRecommendation | null
  isLoadingPrices: boolean
  isLoading: boolean
  error: string | null
  
  fetchGroceryLists: () => Promise<void>
  fetchGroceryList: (id: string) => Promise<void>
  createList: (name: string, recipeIds: string[], weekStartDate?: string) => Promise<GroceryListWithItems>
  deleteList: (id: string) => Promise<void>
  fetchPrices: (groceryListId: string, storeIds: string[]) => Promise<void>
  setCurrentList: (list: GroceryListWithItems | null) => void
  clearError: () => void
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  groceryLists: [],
  currentList: null,
  priceComparisons: [],
  recommendations: null,
  isLoadingPrices: false,
  isLoading: false,
  error: null,

  fetchGroceryLists: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/grocery-list/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch grocery lists')
      }

      const data = await response.json()
      set({ groceryLists: data.groceryLists })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Fetch grocery lists error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchGroceryList: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/grocery-list/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch grocery list')
      }

      const data = await response.json()
      set({ currentList: data.groceryList })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Fetch grocery list error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createList: async (name, recipeIds, weekStartDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/grocery-list/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, recipeIds, weekStartDate })
      })

      if (!response.ok) {
        throw new Error('Failed to create grocery list')
      }

      const data = await response.json()
      set((state) => ({
        groceryLists: [data.groceryList, ...state.groceryLists],
        currentList: data.groceryList
      }))
      
      return data.groceryList
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Create grocery list error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteList: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/grocery-list/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete grocery list')
      }

      set((state) => ({
        groceryLists: state.groceryLists.filter(l => l.id !== id),
        currentList: state.currentList?.id === id ? null : state.currentList
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Delete grocery list error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPrices: async (groceryListId, storeIds) => {
    set({ isLoadingPrices: true, error: null })
    try {
      const response = await fetch('/api/grocery-list/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groceryListId, storeIds })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch prices')
      }

      const data = await response.json()
      set({
        priceComparisons: data.priceComparisons,
        recommendations: data.recommendations
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Fetch prices error:', error)
      throw error
    } finally {
      set({ isLoadingPrices: false })
    }
  },

  setCurrentList: (list) => set({ currentList: list }),
  
  clearError: () => set({ error: null })
}))

