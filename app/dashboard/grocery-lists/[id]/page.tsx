'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { useCartStore } from '@/lib/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, DollarSign, ShoppingCart, Trash2 } from 'lucide-react'
import { mockStores } from '@/mocks/data/stores'
import { formatCurrency } from '@/lib/utils'

export default function GroceryListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { currentList, fetchGroceryList, fetchPrices, priceComparisons, recommendations, isLoadingPrices } = useGroceryStore()
  const { generateCart, isGenerating } = useCartStore()
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [hasFetchedPrices, setHasFetchedPrices] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchGroceryList(params.id as string)
      // Auto-select first 3 stores for price comparison
      const defaultStores = mockStores.slice(0, 3).map(s => s.id)
      setSelectedStores(defaultStores)
    }
  }, [params.id, fetchGroceryList])

  const handleComparePrices = async () => {
    if (!currentList || selectedStores.length === 0) return

    try {
      await fetchPrices(currentList.id, selectedStores)
      setHasFetchedPrices(true)
      toast({
        title: 'Prices updated!',
        description: 'Price comparison completed successfully.'
      })
    } catch (error) {
      toast({
        title: 'Failed to fetch prices',
        description: 'Please try again',
        variant: 'destructive'
      })
    }
  }

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

      // Open the deep link
      window.open(result.webLink, '_blank')
    } catch (error) {
      toast({
        title: 'Failed to create cart',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    // TODO: Add API call to delete item from grocery list
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your list.'
    })
  }

  if (!currentList) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Loading grocery list...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleComparePrices} disabled={isLoadingPrices || selectedStores.length === 0}>
          <DollarSign className="h-4 w-4 mr-2" />
          {isLoadingPrices ? 'Comparing...' : 'Compare Prices'}
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{currentList.name}</h1>
        <p className="text-gray-600">{currentList.items.length} items</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>Consolidated ingredients from your recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentList.items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-base">{item.name}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasFetchedPrices && priceComparisons.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
              <CardDescription>Compare prices across different stores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Item</th>
                      {selectedStores.map(storeId => {
                        const store = mockStores.find(s => s.id === storeId)
                        return (
                          <th key={storeId} className="text-right py-2 px-2">
                            {store?.name}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {priceComparisons.map((item) => (
                      <tr key={item.itemId} className="border-b">
                        <td className="py-2 px-2 font-medium">{item.itemName}</td>
                        {selectedStores.map(storeId => {
                          const comparison = item.comparisons.find(c => c.storeId === storeId)
                          return (
                            <td key={storeId} className="text-right py-2 px-2">
                              {comparison?.available ? (
                                <span className={comparison.savings > 0 ? 'text-green-600 font-medium' : ''}>
                                  {formatCurrency(comparison.price)}
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {recommendations && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Best Shopping Option</CardTitle>
                <CardDescription>Based on total cost and savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Single Store:</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{recommendations.singleStore.storeName}</span>
                    <span className="text-2xl font-bold text-green-900">
                      {formatCurrency(recommendations.singleStore.total)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleCreateCart(recommendations.singleStore.storeId)}
                    disabled={isGenerating}
                    className="w-full mt-3"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Creating Cart...' : 'Shop at ' + recommendations.singleStore.storeName}
                  </Button>
                </div>

                {recommendations.multiStore && recommendations.potentialSavings > 5 && (
                  <div className="pt-4 border-t border-green-300">
                    <h4 className="font-semibold mb-2">
                      Multi-Store Option (Save {formatCurrency(recommendations.potentialSavings)})
                    </h4>
                    <div className="space-y-2">
                      {recommendations.multiStore.map((store) => (
                        <div key={store.storeId} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>{store.storeName}</span>
                            <span className="font-medium">{formatCurrency(store.subtotal)}</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {store.items.length} items: {store.items.slice(0, 3).join(', ')}
                            {store.items.length > 3 && ` +${store.items.length - 3} more`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

