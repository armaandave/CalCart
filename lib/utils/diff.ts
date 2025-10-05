export type IngredientLike = {
  name: string
  quantity: number
  unit: string
}

export type NutritionLike = {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export type IngredientDiff = {
  key: string
  change: 'added' | 'removed' | 'modified' | 'unchanged'
  before?: IngredientLike
  after?: IngredientLike
}

export type NutritionDiffEntry = {
  key: keyof NutritionLike
  delta: number
  before: number
  after: number
}

export function diffIngredients(
  original: IngredientLike[],
  optimized: IngredientLike[]
): IngredientDiff[] {
  const normalizeKey = (i: IngredientLike) => `${i.name.toLowerCase()}|${i.unit.toLowerCase()}`
  const originalMap = new Map<string, IngredientLike>()
  for (const ing of original) originalMap.set(normalizeKey(ing), ing)
  const optimizedMap = new Map<string, IngredientLike>()
  for (const ing of optimized) optimizedMap.set(normalizeKey(ing), ing)

  const keys = new Set([...originalMap.keys(), ...optimizedMap.keys()])
  const diffs: IngredientDiff[] = []

  for (const key of keys) {
    const before = originalMap.get(key)
    const after = optimizedMap.get(key)
    if (before && !after) {
      diffs.push({ key, change: 'removed', before })
    } else if (!before && after) {
      diffs.push({ key, change: 'added', after })
    } else if (before && after) {
      const modified = before.quantity !== after.quantity || before.unit !== after.unit || before.name !== after.name
      diffs.push({ key, change: modified ? 'modified' : 'unchanged', before, after })
    }
  }
  return diffs
}

export function diffNutrition(
  original: NutritionLike | null | undefined,
  optimized: NutritionLike | null | undefined
): NutritionDiffEntry[] {
  if (!original || !optimized) return []
  const keys: (keyof NutritionLike)[] = ['calories', 'protein', 'carbs', 'fats', 'fiber', 'sugar', 'sodium']
  const diffs: NutritionDiffEntry[] = []
  for (const key of keys) {
    const before = (original as any)[key]
    const after = (optimized as any)[key]
    if (typeof before === 'number' && typeof after === 'number') {
      diffs.push({ key, before, after, delta: after - before })
    }
  }
  return diffs
}
