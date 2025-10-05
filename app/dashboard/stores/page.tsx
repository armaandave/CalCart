'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockStores } from '@/mocks/data/stores'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { useCartStore } from '@/lib/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ShoppingCart, TrendingDown, Trophy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface StoreWithPricing {
  id: string
  name: string
  location: string
  address: string
  deliveryFee: number
  minOrder: number
  estimatedDelivery: string
  rating: number
  logo: string
  subtotal: number
  total: number
  itemCount: number
  unavailableItems: number
}

export default function PriceComparisonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { currentList, fetchGroceryList, fetchPrices, priceComparisons } = useGroceryStore()
  const { generateCart, isGenerating } = useCartStore()
  const [storesWithPricing, setStoresWithPricing] = useState<StoreWithPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bestStoreId, setBestStoreId] = useState<string | null>(null)

  const listId = searchParams.get('listId')

  useEffect(() => {
    const loadPriceComparison = async () => {
      if (!listId) {
        toast({
          title: 'No grocery list specified',
          description: 'Please select a grocery list to compare prices.',
          variant: 'destructive'
        })
        router.push('/dashboard/grocery-lists')
        return
      }

      try {
        setIsLoading(true)
        
        // Fetch grocery list if not already loaded
        if (!currentList || currentList.id !== listId) {
          await fetchGroceryList(listId)
        }

        // Fetch prices for all stores
        const storeIds = mockStores.map(s => s.id)
        await fetchPrices(listId, storeIds)
      } catch (error) {
        toast({
          title: 'Failed to load price comparison',
          description: 'Please try again',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPriceComparison()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId])

  useEffect(() => {
    if (priceComparisons.length > 0 && currentList) {
      // Calculate pricing for each store
      const pricing = mockStores.map(store => {
        let subtotal = 0
        let itemCount = 0
        let unavailableItems = 0

        priceComparisons.forEach(item => {
          const comparison = item.comparisons.find(c => c.storeId === store.id)
          if (comparison && comparison.available) {
            subtotal += comparison.price
            itemCount++
          } else {
            unavailableItems++
          }
        })

        const total = subtotal + store.deliveryFee

        return {
          ...store,
          subtotal,
          total,
          itemCount,
          unavailableItems
        }
      })

      // Sort by total price and find best store
      pricing.sort((a, b) => a.total - b.total)
      if (pricing.length > 0 && pricing[0].itemCount > 0) {
        setBestStoreId(pricing[0].id)
      }
      
      setStoresWithPricing(pricing)
    }
  }, [priceComparisons, currentList])

  const handleCreateCart = async (storeId: string) => {
    if (!currentList) return

    try {
      const cartItems = currentList.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      }))

      const result = await generateCart(currentList.id, 'instacart', storeId, cartItems)
      
      toast({
        title: 'Cart created!',
        description: 'Opening Instacart with your items...'
      })

      window.open(result.webLink, '_blank')
    } catch (error) {
      toast({
        title: 'Failed to create cart',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Comparing prices across stores...</p>
        </div>
      </div>
    )
  }

  if (!currentList) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Grocery list not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold mb-2">Price Comparison Results</h1>
          <p className="text-gray-600">
            {currentList.name} • {currentList.items.length} items • Downtown Boston stores
          </p>
        </div>
      </div>

      {storesWithPricing.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No pricing information available. Please try again.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {storesWithPricing.map((store) => {
            const isBestDeal = store.id === bestStoreId
            const savingsVsBest = store.id !== bestStoreId && bestStoreId 
              ? store.total - (storesWithPricing.find(s => s.id === bestStoreId)?.total || 0)
              : 0

            return (
              <Card 
                key={store.id}
                className={isBestDeal ? 'border-green-500 border-2 shadow-lg' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {store.name}
                        {isBestDeal && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-normal">
                            <Trophy className="h-4 w-4" />
                            Best Deal
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{store.location}</CardDescription>
                      <p className="text-xs text-gray-500 mt-1">{store.address}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Items Subtotal:</span>
                      <span className="font-semibold text-lg">{formatCurrency(store.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-medium">
                        {store.deliveryFee === 0 ? 'Free' : formatCurrency(store.deliveryFee)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Price:</span>
                      <span className="font-bold text-2xl text-green-700">
                        {formatCurrency(store.total)}
                      </span>
                    </div>
                    {savingsVsBest > 0 && (
                      <div className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {formatCurrency(savingsVsBest)} more than best option
                      </div>
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Items:</span>
                      <span className="font-medium">
                        {store.itemCount} of {currentList.items.length}
                      </span>
                    </div>
                    {store.unavailableItems > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Unavailable Items:</span>
                        <span className="font-medium">{store.unavailableItems}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Order:</span>
                      <span className="font-medium">{formatCurrency(store.minOrder)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Time:</span>
                      <span className="font-medium">{store.estimatedDelivery}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">⭐ {store.rating}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCreateCart(store.id)}
                    disabled={isGenerating || store.itemCount === 0}
                    className="w-full"
                    variant={isBestDeal ? 'default' : 'outline'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Creating Cart...' : `Shop at ${store.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

