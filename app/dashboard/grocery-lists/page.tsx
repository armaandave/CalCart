'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, List } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function GroceryListsPage() {
  const { groceryLists, fetchGroceryLists, isLoading } = useGroceryStore()

  useEffect(() => {
    fetchGroceryLists()
  }, [fetchGroceryLists])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Loading grocery lists...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Grocery Lists</h1>
          <p className="text-gray-600">Manage your shopping lists</p>
        </div>
        <Link href="/dashboard/grocery-lists/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </Link>
      </div>

      {groceryLists.length === 0 ? (
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <List className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No grocery lists yet</h3>
              <p className="text-gray-600 mb-6">
                Create a grocery list from your optimized recipes
              </p>
              <Link href="/dashboard/grocery-lists/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groceryLists.map((list) => (
            <Link key={list.id} href={`/dashboard/grocery-lists/${list.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>
                    Created {formatDate(list.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{list.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priced:</span>
                      <span className="font-medium">
                        {list.items.filter(item => item.priceComparisons.length > 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

