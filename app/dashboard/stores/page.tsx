'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockStores } from '@/mocks/data/stores'

export default function StoresPage() {
  const [stores] = useState(mockStores)
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Available Stores</h1>
          <p className="text-gray-600">Browse stores in your area</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/grocery-lists/new')}>Back</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stores.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">
                    {store.deliveryFee === 0 ? 'Free' : `$${store.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Order:</span>
                  <span className="font-medium">${store.minOrder}</span>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

