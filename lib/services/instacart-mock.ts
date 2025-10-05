import { Product, CartItem, DeepLinkResponse } from '@/lib/types'
import { mockProducts } from '@/mocks/data/products'
import { mockStores } from '@/mocks/data/stores'

export class InstacartMockService {
  private products: Product[]
  private stores: typeof mockStores

  constructor() {
    this.products = mockProducts
    this.stores = mockStores
  }

  async searchProducts(
    query: string,
    storeId?: string,
    limit: number = 10
  ): Promise<Product[]> {
    // Simulate API delay
    await this.delay(300, 800)

    // Normalize search query
    const normalizedQuery = query.toLowerCase().trim()

    // Search products
    let results = this.products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(normalizedQuery)
      const brandMatch = product.brand.toLowerCase().includes(normalizedQuery)
      const categoryMatch = product.category.toLowerCase().includes(normalizedQuery)
      
      return nameMatch || brandMatch || categoryMatch
    })

    // Filter by store if specified
    if (storeId) {
      results = results.filter(p => p.storeId === storeId)
    }

    // Add realistic price variations
    results = this.addPriceVariations(results)

    return results.slice(0, limit)
  }

  async checkAvailability(
    productIds: string[],
    storeId: string
  ): Promise<Record<string, { available: boolean; quantity: number }>> {
    await this.delay(200, 500)

    const availability: Record<string, { available: boolean; quantity: number }> = {}

    for (const productId of productIds) {
      // 95% chance of being available
      const available = Math.random() > 0.05
      availability[productId] = {
        available,
        quantity: available ? Math.floor(Math.random() * 20) + 5 : 0
      }
    }

    return availability
  }

  async createDeepLink(
    items: CartItem[],
    storeId: string,
    userId: string
  ): Promise<DeepLinkResponse> {
    await this.delay(500, 1000)

    // Match items to products
    const matchedProducts: Array<{ product: Product; quantity: number }> = []
    const unavailableItems: string[] = []

    for (const item of items) {
      const products = await this.searchProducts(item.name, storeId, 1)
      if (products.length > 0 && products[0].available) {
        matchedProducts.push({
          product: products[0],
          quantity: item.quantity
        })
      } else {
        unavailableItems.push(item.name)
      }
    }

    // Calculate total
    const subtotal = matchedProducts.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    )
    const tax = subtotal * 0.08
    const deliveryFee = subtotal > 35 ? 0 : 5.99
    const estimatedTotal = subtotal + tax + deliveryFee

    // Generate cart ID
    const cartId = this.generateCartId()

    // Build deep link
    const productParams = matchedProducts
      .map(({ product, quantity }) => `${product.id}:${quantity}`)
      .join(',')

    return {
      deepLink: `instacart://cart/${cartId}?store=${storeId}&items=${productParams}`,
      webLink: `https://www.instacart.com/store/cart/${cartId}?store=${storeId}`,
      cartId,
      estimatedTotal,
      itemCount: matchedProducts.length,
      unavailableItems
    }
  }

  async getPrice(itemName: string, storeId: string): Promise<number | null> {
    const products = await this.searchProducts(itemName, storeId, 1)
    return products.length > 0 ? products[0].price : null
  }

  private addPriceVariations(products: Product[]): Product[] {
    return products.map(product => ({
      ...product,
      // Add small random price variation (±5%)
      price: Number((product.price * (0.95 + Math.random() * 0.1)).toFixed(2))
    }))
  }

  private generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private delay(min: number, max: number): Promise<void> {
    const ms = Math.random() * (max - min) + min
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getStores() {
    return this.stores
  }

  getStoreById(storeId: string) {
    return this.stores.find(store => store.id === storeId)
  }
}

export const instacartService = new InstacartMockService()

