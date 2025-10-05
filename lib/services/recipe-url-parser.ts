/**
 * Recipe URL Parser Service
 * Extracts recipe data from popular recipe websites
 */

interface ParsedRecipe {
  name: string
  description?: string
  servings?: number
  ingredients: Array<{
    name: string
    quantity?: number
    unit?: string
  }>
  instructions: string[]
  imageUrl?: string
}

export class RecipeUrlParser {
  /**
   * Check if input is a URL
   */
  isUrl(input: string): boolean {
    try {
      const url = new URL(input)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Parse recipe from URL
   * This is a placeholder - in production, you'd want to:
   * 1. Use a web scraping service
   * 2. Look for schema.org/Recipe structured data
   * 3. Use recipe-specific parsers for popular sites
   */
  async parseFromUrl(url: string): Promise<ParsedRecipe> {
    try {
      // Option A: Use a third-party API (recommended)
      // const response = await fetch(`https://api.recipe-scraper.com/parse?url=${encodeURIComponent(url)}`)
      // return await response.json()

      // Option B: Scrape yourself (requires CORS proxy or server-side)
      const response = await fetch(url)
      const html = await response.text()
      
      // Look for JSON-LD structured data (schema.org/Recipe)
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
      if (jsonLdMatch) {
        const data = JSON.parse(jsonLdMatch[1])
        if (data['@type'] === 'Recipe') {
          return this.parseJsonLd(data)
        }
      }

      // Fallback: Use AI to extract from HTML
      throw new Error('Could not parse recipe from URL. Please try describing the recipe instead.')
    } catch (error) {
      console.error('Recipe URL parsing error:', error)
      throw new Error('Failed to parse recipe from URL')
    }
  }

  /**
   * Parse JSON-LD structured data
   */
  private parseJsonLd(data: any): ParsedRecipe {
    return {
      name: data.name || 'Untitled Recipe',
      description: data.description,
      servings: data.recipeYield ? parseInt(data.recipeYield) : undefined,
      ingredients: (data.recipeIngredient || []).map((ing: string) => ({
        name: ing,
        // You'd want to parse quantity/unit from the string
      })),
      instructions: Array.isArray(data.recipeInstructions)
        ? data.recipeInstructions.map((step: any) => 
            typeof step === 'string' ? step : step.text
          )
        : [data.recipeInstructions],
      imageUrl: data.image?.url || data.image
    }
  }

  /**
   * Extract domain from URL for site-specific parsing
   */
  private getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return ''
    }
  }
}

export const recipeUrlParser = new RecipeUrlParser()
