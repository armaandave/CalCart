import { create } from 'zustand'
import { CartItem, DeepLinkResponse } from '@/lib/types'

interface CartStore {
  activeCart: DeepLinkResponse | null
  isGenerating: boolean
  error: string | null
  
  generateCart: (
    groceryListId: string,
    provider: string,
    storeId: string,
    items: CartItem[]
  ) => Promise<DeepLinkResponse>
  clearCart: () => void
  clearError: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  activeCart: null,
  isGenerating: false,
  error: null,

  generateCart: async (groceryListId, provider, storeId, items) => {
    set({ isGenerating: true, error: null })
    try {
      const response = await fetch('/api/cart/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groceryListId,
          provider,
          storeId,
          items
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate cart')
      }

      const data = await response.json()
      set({ activeCart: data })
      
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message })
      console.error('Generate cart error:', error)
      throw error
    } finally {
      set({ isGenerating: false })
    }
  },

  clearCart: () => set({ activeCart: null }),
  
  clearError: () => set({ error: null })
}))

