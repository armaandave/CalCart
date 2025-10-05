import Anthropic from '@anthropic-ai/sdk'
import { OptimizationResult } from '@/lib/types'
import { Recipe, UserProfile } from '@prisma/client'

export class RecipeOptimizerService {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }
    this.client = new Anthropic({ apiKey })
  }

  async optimizeRecipe(
    recipe: Recipe & { originalIngredients: any[] },
    userProfile: UserProfile
  ): Promise<OptimizationResult> {
    const prompt = this.buildPrompt(recipe, userProfile)

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      return this.parseResponse(content.text)
    } catch (error) {
      console.error('Error optimizing recipe:', error)
      throw new Error('Failed to optimize recipe')
    }
  }

  private buildPrompt(
    recipe: Recipe & { originalIngredients: any[] },
    profile: UserProfile
  ): string {
    const goalDescriptions: Record<string, string> = {
      LOSE_WEIGHT: 'weight loss (reduce calories, increase protein, reduce fats)',
      BUILD_MUSCLE: 'muscle building (high protein, moderate carbs, healthy fats)',
      MAINTAIN: 'maintenance (balanced macros)',
      CUSTOM: `custom macros (${profile.targetProtein}g protein, ${profile.targetCarbs}g carbs, ${profile.targetFats}g fats)`
    }

    return `You are a professional nutritionist and chef. Optimize this recipe for ${goalDescriptions[profile.goalType]} while maintaining its core identity and taste.

Recipe: ${recipe.name}
${recipe.description ? `Description: ${recipe.description}` : ''}
Servings: ${recipe.servings}

Original Ingredients:
${recipe.originalIngredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n')}

Instructions:
${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

User Constraints:
- Dietary Restrictions: ${profile.restrictions.join(', ') || 'None'}
- Allergies: ${profile.allergies.join(', ') || 'None'}
- Preferences: ${profile.preferences.join(', ') || 'None'}
- Goal: ${profile.goalType}
${profile.targetCalories ? `- Target Calories per Serving: ${profile.targetCalories}` : ''}
${profile.targetProtein ? `- Target Protein per Serving: ${profile.targetProtein}g` : ''}
${profile.targetCarbs ? `- Target Carbs per Serving: ${profile.targetCarbs}g` : ''}
${profile.targetFats ? `- Target Fats per Serving: ${profile.targetFats}g` : ''}

IMPORTANT RULES:
1. Keep the same dish type (don't turn mac and cheese into a salad)
2. Provide specific, realistic substitutions
3. Respect all dietary restrictions and allergies
4. Calculate accurate nutrition facts for the entire recipe (all servings)
5. Explain each substitution clearly
6. Maintain flavor and cooking techniques as much as possible

Return your response in the following JSON format (no other text):
{
  "optimizedIngredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit",
      "category": "produce|dairy|meat|grains|other",
      "notes": "any special notes",
      "isSubstitution": true/false,
      "originalIngredient": "original ingredient name if substitution"
    }
  ],
  "substitutions": [
    {
      "original": "original ingredient",
      "replacement": "new ingredient",
      "reason": "why this substitution helps"
    }
  ],
  "nutrition": {
    "calories": total_calories_for_all_servings,
    "protein": total_protein_in_grams,
    "carbs": total_carbs_in_grams,
    "fats": total_fats_in_grams,
    "fiber": total_fiber_in_grams,
    "sugar": total_sugar_in_grams,
    "sodium": total_sodium_in_mg
  },
  "notes": [
    "note about optimization",
    "cooking tips",
    "taste expectations"
  ]
}`
  }

  private parseResponse(responseText: string): OptimizationResult {
    try {
      // Extract JSON from response (Claude might add text before/after)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      if (!parsed.optimizedIngredients || !parsed.nutrition || !parsed.substitutions) {
        throw new Error('Missing required fields in optimization response')
      }

      return parsed as OptimizationResult
    } catch (error) {
      console.error('Error parsing optimization response:', error)
      console.error('Response text:', responseText)
      throw new Error('Failed to parse optimization result')
    }
  }
}

export const recipeOptimizer = new RecipeOptimizerService()

