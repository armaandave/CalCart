import { GroceryListItem } from '@prisma/client'
import { PriceComparisonResult, StoreRecommendation } from '@/lib/types'
import { instacartService } from './instacart-mock'

interface ItemPrice {
  itemId: string
  itemName: string
  storeId: string
  storeName: string
  price: number
  available: boolean
}

export class PriceComparisonEngine {
  private cache: Map<string, { data: ItemPrice; timestamp: number }>

  constructor() {
    this.cache = new Map()
  }

  async comparePrices(
    items: GroceryListItem[],
    storeIds: string[]
  ): Promise<{
    itemPrices: PriceComparisonResult[]
    recommendations: StoreRecommendation
  }> {
    // Fetch prices for all items from all stores
    const allPrices: ItemPrice[] = []

    for (const item of items) {
      for (const storeId of storeIds) {
        const price = await this.getPriceForItem(item.name, storeId)
        if (price !== null) {
          const store = instacartService.getStoreById(storeId)
          allPrices.push({
            itemId: item.id,
            itemName: item.name,
            storeId,
            storeName: store?.name || storeId,
            price,
            available: true
          })
        }
      }
    }

    // Group by item
    const itemPrices = this.groupPricesByItem(allPrices, items)

    // Calculate recommendations
    const recommendations = this.calculateRecommendations(itemPrices, storeIds)

    return { itemPrices, recommendations }
  }

  private async getPriceForItem(
    itemName: string,
    storeId: string
  ): Promise<number | null> {
    // Check cache
    const cacheKey = `${itemName}-${storeId}`
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data.price
    }

    // Fetch from service
    const price = await instacartService.getPrice(itemName, storeId)

    if (price !== null) {
      this.cache.set(cacheKey, {
        data: {
          itemId: '',
          itemName,
          storeId,
          storeName: '',
          price,
          available: true
        },
        timestamp: Date.now()
      })
    }

    return price
  }

  private groupPricesByItem(
    prices: ItemPrice[],
    items: GroceryListItem[]
  ): PriceComparisonResult[] {
    const grouped = new Map<string, ItemPrice[]>()

    for (const price of prices) {
      if (!grouped.has(price.itemId)) {
        grouped.set(price.itemId, [])
      }
      grouped.get(price.itemId)!.push(price)
    }

    return items.map(item => {
      const itemPrices = grouped.get(item.id) || []
      const maxPrice = Math.max(...itemPrices.map(p => p.price), 0)

      return {
        itemId: item.id,
        itemName: item.name,
        comparisons: itemPrices.map(price => ({
          storeId: price.storeId,
          storeName: price.storeName,
          price: price.price,
          available: price.available,
          savings: maxPrice > 0 ? maxPrice - price.price : 0
        }))
      }
    })
  }

  private calculateRecommendations(
    itemPrices: PriceComparisonResult[],
    storeIds: string[]
  ): StoreRecommendation {
    // Calculate total for each store
    const storeTotals = new Map<string, { total: number; itemCount: number }>()

    for (const storeId of storeIds) {
      let total = 0
      let itemCount = 0

      for (const item of itemPrices) {
        const storePrice = item.comparisons.find(c => c.storeId === storeId)
        if (storePrice && storePrice.available) {
          total += storePrice.price
          itemCount++
        }
      }

      storeTotals.set(storeId, { total, itemCount })
    }

    // Find best single store
    let bestStore = { storeId: '', storeName: '', total: Infinity }
    for (const [storeId, data] of storeTotals) {
      if (data.total < bestStore.total) {
        const store = instacartService.getStoreById(storeId)
        bestStore = {
          storeId,
          storeName: store?.name || storeId,
          total: data.total
        }
      }
    }

    // Calculate optimal split (if shopping at multiple stores saves > $5)
    const optimalSplit = this.calculateOptimalSplit(itemPrices, storeIds)
    const splitTotal = optimalSplit.reduce((sum, store) => sum + store.subtotal, 0)
    const potentialSavings = Math.max(0, bestStore.total - splitTotal)

    return {
      singleStore: bestStore,
      multiStore: potentialSavings > 5 ? optimalSplit : undefined,
      potentialSavings
    }
  }

  private calculateOptimalSplit(
    itemPrices: PriceComparisonResult[],
    storeIds: string[]
  ): Array<{ storeId: string; storeName: string; items: string[]; subtotal: number }> {
    const storeAssignments = new Map<string, { items: string[]; subtotal: number }>()

    // Assign each item to the store with lowest price
    for (const item of itemPrices) {
      let lowestPrice = Infinity
      let bestStoreId = ''

      for (const comparison of item.comparisons) {
        if (comparison.available && comparison.price < lowestPrice) {
          lowestPrice = comparison.price
          bestStoreId = comparison.storeId
        }
      }

      if (bestStoreId) {
        if (!storeAssignments.has(bestStoreId)) {
          storeAssignments.set(bestStoreId, { items: [], subtotal: 0 })
        }
        const assignment = storeAssignments.get(bestStoreId)!
        assignment.items.push(item.itemName)
        assignment.subtotal += lowestPrice
      }
    }

    return Array.from(storeAssignments.entries()).map(([storeId, data]) => {
      const store = instacartService.getStoreById(storeId)
      return {
        storeId,
        storeName: store?.name || storeId,
        items: data.items,
        subtotal: data.subtotal
      }
    })
  }

  private isCacheValid(timestamp: number): boolean {
    const TWO_HOURS = 2 * 60 * 60 * 1000
    return Date.now() - timestamp < TWO_HOURS
  }
}

export const priceEngine = new PriceComparisonEngine()

