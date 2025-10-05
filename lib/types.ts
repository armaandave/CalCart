export interface RecipeInput {
  name: string
  description?: string
  servings: number
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    category?: string
  }>
  instructions: string[]
}

export interface OptimizationResult {
  optimizedIngredients: Array<{
    name: string
    quantity: number
    unit: string
    category: string
    notes?: string
    isSubstitution: boolean
    originalIngredient?: string
  }>
  substitutions: Array<{
    original: string
    replacement: string
    reason: string
  }>
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
  notes: string[]
}

export interface PriceComparisonResult {
  itemId: string
  itemName: string
  comparisons: Array<{
    storeId: string
    storeName: string
    price: number
    available: boolean
    savings: number
  }>
}

export interface StoreRecommendation {
  singleStore: {
    storeId: string
    storeName: string
    total: number
  }
  multiStore?: Array<{
    storeId: string
    storeName: string
    items: string[]
    subtotal: number
  }>
  potentialSavings: number
}

export interface CartItem {
  name: string
  quantity: number
  unit: string
  productId?: string
}

export interface DeepLinkResponse {
  deepLink: string
  cartId: string
  webLink: string
  estimatedTotal: number
  itemCount: number
  unavailableItems: string[]
}

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  unit: string
  size: string
  imageUrl: string
  available: boolean
  storeId: string
  category: string
}

