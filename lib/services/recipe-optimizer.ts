import { GoogleGenAI } from '@google/genai'
import { OptimizationResult } from '@/lib/types'
import { Recipe, UserProfile } from '@prisma/client'



export class RecipeOptimizerService {
  private client: GoogleGenAI | null = null

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set')
      }
      this.client = new GoogleGenAI({ apiKey })
    }
    return this.client
  }

  async optimizeRecipe(
    recipe: Recipe & { originalIngredients: any[] },
    userProfile: UserProfile
  ): Promise<OptimizationResult> {
    const prompt = this.buildPrompt(recipe, userProfile)

    try {
      const systemInstruction = 'You are a professional nutritionist and chef. Provide responses in valid JSON format only, with no additional text or markdown formatting.'
      const response = await this.getClient().models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          `${systemInstruction}\n\n${prompt}`
        ]
      })
      
      const content = (response as any).text
      if (!content) {
        throw new Error('No response from Gemini')
      }
      return this.parseResponse(content)
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

  async createRecipeFromNaturalLanguage(
    foodDescription: string,
    profile: UserProfile
  ): Promise<{
    name: string
    description: string
    servings: number
    ingredients: any[]
    instructions: string[]
    nutrition: any
    notes: string[]
  }> {
    // Detect if input is a URL or natural language
    const isUrl = this.isUrl(foodDescription)
    
    // Use appropriate prompt based on input type
    const userPrompt = isUrl 
      ? this.buildUrlPrompt(foodDescription, profile)
      : this.buildNaturalLanguagePrompt(foodDescription, profile)
    
    // System prompt for Gemini
    const systemPrompt = isUrl
      ? 'You are a professional nutritionist and chef. When given a recipe URL, use the URL Context and Google Search tools to retrieve and read the exact page. Prefer the provided URL\'s content. If available, extract schema.org Recipe (JSON-LD). Otherwise parse the page\'s text to obtain name, servings, ingredients (with quantities/units), instructions, and nutrition. If the page is unavailable, fall back to reputable sources. Provide responses in valid JSON only, with no extra text or markdown.'
      : "You are a professional nutritionist and chef. Create complete, realistic recipes optimized for users' health goals. Provide responses in valid JSON format only, with no additional text or markdown formatting."

    // Debug: which path and prompt are used
    // Note: Avoid logging full prompts in production to prevent leaking PII
    console.debug('[RecipeOptimizer] createRecipeFromNaturalLanguage', {
      isUrl,
      inputPreview: foodDescription.slice(0, 200)
    })
    console.debug('[RecipeOptimizer] Using system prompt mode:', isUrl ? 'URL' : 'NL')

    try {
      if (isUrl) {
        // Use URL Context (and optionally Google Search) tools so Gemini fetches page content itself
        console.debug('[RecipeOptimizer] Tools enabled: urlContext + googleSearch')
        const response = await this.getClient().models.generateContent({
          model: 'gemini-2.5-pro',
          contents: [
            `${systemPrompt}\n\n${userPrompt}`
          ],
          config: {
            tools: [
              { urlContext: {} },
              { googleSearch: {} }
            ]
          }
        })
        // Debug: log URL context metadata if present
        try {
          const meta = (response as any).candidates?.[0]?.urlContextMetadata || (response as any).candidates?.[0]?.url_context_metadata
          if (meta) console.debug('[RecipeOptimizer] urlContextMetadata:', meta)
        } catch {}
        const content = (response as any).text
        console.debug('[RecipeOptimizer] Response text length:', typeof content === 'string' ? content.length : 'n/a')
        if (!content) {
          throw new Error('No response from Gemini')
        }
        return this.parseNaturalLanguageResponse(content)
      } else {
        // NL only - no tools needed
        console.debug('[RecipeOptimizer] Tools disabled for NL input')
        const response = await this.getClient().models.generateContent({
          model: 'gemini-2.5-pro',
          contents: [
            `${systemPrompt}\n\n${userPrompt}`
          ]
        })
        const content = (response as any).text
        console.debug('[RecipeOptimizer] Response text length:', typeof content === 'string' ? content.length : 'n/a')
        if (!content) {
          throw new Error('No response from Gemini')
        }
        return this.parseNaturalLanguageResponse(content)
      }
    } catch (error) {
      console.error('Error creating recipe from natural language:', error)
      // Preserve the original error message for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to create recipe from description: ${errorMessage}`)
    }
  }

  /**
   * Detect if input is a URL
   */
  private isUrl(input: string): boolean {
    try {
      const url = new URL(input.trim())
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Build prompt specifically for URL inputs
   * Since AI cannot fetch URLs, it infers recipe from URL structure
   */
  private buildUrlPrompt(
    url: string,
    profile: UserProfile
  ): string {
    const goalDescriptions: Record<string, string> = {
      LOSE_WEIGHT: 'weight loss (reduce calories, increase protein, reduce fats)',
      BUILD_MUSCLE: 'muscle building (high protein, moderate carbs, healthy fats)',
      MAINTAIN: 'maintenance (balanced macros)',
      CUSTOM: `custom macros (${profile.targetProtein}g protein, ${profile.targetCarbs}g carbs, ${profile.targetFats}g fats)`
    }

    return `You are a professional nutritionist and chef. A user has provided this recipe URL: ${url}
 
IMPORTANT CONTEXT:
- Use web tools to fetch and read the exact page at this URL
- Prefer the provided URL's content; extract schema.org Recipe (JSON-LD) when present
- If JSON-LD is missing, parse visible content to extract name, servings, ingredients (quantities/units), instructions, and nutrition
- Optimize it for ${goalDescriptions[profile.goalType]}
 


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
1. Infer the dish name and type from the URL path
2. Create a complete, realistic recipe for that dish
3. Respect all dietary restrictions and allergies
4. Calculate accurate nutrition facts for the entire recipe (all servings)
5. Provide clear, step-by-step instructions
6. Use healthy ingredients that align with the user's goals
7. Make it authentic to the dish type while optimizing for health

Return your response in the following JSON format (no other text):
{
  "name": "Recipe name (inferred from URL)",
  "description": "Brief description of the dish",
  "servings": number_of_servings,
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit",
      "category": "produce|dairy|meat|grains|other",
      "notes": "any special notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
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
    "cooking tip or health benefit",
    "serving suggestion"
  ]
}`
  }

  private buildNaturalLanguagePrompt(
    foodDescription: string,
    profile: UserProfile
  ): string {
    const goalDescriptions: Record<string, string> = {
      LOSE_WEIGHT: 'weight loss (reduce calories, increase protein, reduce fats)',
      BUILD_MUSCLE: 'muscle building (high protein, moderate carbs, healthy fats)',
      MAINTAIN: 'maintenance (balanced macros)',
      CUSTOM: `custom macros (${profile.targetProtein}g protein, ${profile.targetCarbs}g carbs, ${profile.targetFats}g fats)`
    }

    return `You are a professional nutritionist and chef. Create a complete recipe for "${foodDescription}" optimized for ${goalDescriptions[profile.goalType]}.

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
1. Create a complete, realistic recipe with proper measurements
2. Respect all dietary restrictions and allergies
3. Calculate accurate nutrition facts for the entire recipe (all servings)
4. Provide clear, step-by-step instructions
5. Use healthy ingredients that align with the user's goals

Return your response in the following JSON format (no other text):
{
  "name": "Recipe name",
  "description": "Brief description of the dish",
  "servings": number_of_servings,
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit",
      "category": "produce|dairy|meat|grains|other",
      "notes": "any special notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
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
    "cooking tip or health benefit",
    "serving suggestion"
  ]
}`
  }

  private parseNaturalLanguageResponse(responseText: string): {
    name: string
    description: string
    servings: number
    ingredients: any[]
    instructions: string[]
    nutrition: any
    notes: string[]
  } {
    try {
      // Extract JSON from response (Claude might add text before/after)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      if (!parsed.name || !parsed.ingredients || !parsed.instructions || !parsed.nutrition) {
        throw new Error('Missing required fields in recipe creation response')
      }

      return parsed
    } catch (error) {
      console.error('Error parsing natural language response:', error)
      console.error('Response text:', responseText)
      throw new Error('Failed to parse recipe creation result')
    }
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
