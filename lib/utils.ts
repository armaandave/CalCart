import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function calculateNutritionDiff(
  original: { calories: number; protein: number; carbs: number; fats: number },
  optimized: { calories: number; protein: number; carbs: number; fats: number }
) {
  return {
    caloriesDiff: optimized.calories - original.calories,
    proteinDiff: optimized.protein - original.protein,
    carbsDiff: optimized.carbs - original.carbs,
    fatsDiff: optimized.fats - original.fats
  }
}

export function consolidateUnits(unit: string): string {
  const unitMap: Record<string, string> = {
    'cups': 'cup',
    'cup': 'cup',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'tbsp': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp',
    'tsp': 'tsp',
    'ounces': 'oz',
    'ounce': 'oz',
    'oz': 'oz',
    'pounds': 'lb',
    'pound': 'lb',
    'lb': 'lb',
    'grams': 'g',
    'gram': 'g',
    'g': 'g',
    'kilograms': 'kg',
    'kilogram': 'kg',
    'kg': 'kg',
    'liters': 'l',
    'liter': 'l',
    'l': 'l',
    'milliliters': 'ml',
    'milliliter': 'ml',
    'ml': 'ml'
  }
  
  return unitMap[unit.toLowerCase()] || unit
}

export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const normalized = consolidateUnits(fromUnit)
  const targetNormalized = consolidateUnits(toUnit)
  
  if (normalized === targetNormalized) return quantity
  
  // Simple conversion map (can be expanded)
  const conversions: Record<string, Record<string, number>> = {
    'cup': { 'tbsp': 16, 'tsp': 48, 'ml': 236.588 },
    'tbsp': { 'cup': 0.0625, 'tsp': 3, 'ml': 14.787 },
    'tsp': { 'cup': 0.0208, 'tbsp': 0.333, 'ml': 4.929 },
    'lb': { 'oz': 16, 'g': 453.592, 'kg': 0.454 },
    'oz': { 'lb': 0.0625, 'g': 28.35, 'kg': 0.028 },
    'kg': { 'g': 1000, 'lb': 2.205, 'oz': 35.274 },
    'g': { 'kg': 0.001, 'lb': 0.0022, 'oz': 0.035 },
    'l': { 'ml': 1000, 'cup': 4.227 },
    'ml': { 'l': 0.001, 'cup': 0.004 }
  }
  
  if (conversions[normalized] && conversions[normalized][targetNormalized]) {
    return quantity * conversions[normalized][targetNormalized]
  }
  
  return quantity
}

