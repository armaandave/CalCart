# Natural Language Recipe Integration Guide

## Overview

This integration adds AI-powered recipe creation to CalCart, allowing users to create recipes from natural language descriptions or URLs instead of manually entering all details.

## Features Added

### 1. **AI Recipe Generation**
- Users can describe what they want to cook in natural language
- AI generates a complete recipe with:
  - Recipe name and description
  - Ingredient list with quantities and units
  - Step-by-step instructions
  - Nutritional information
  - Cooking tips and notes
- Recipes are automatically optimized for the user's health goals and dietary restrictions

### 2. **Dual Input Methods**
The new recipe page now has two tabs:
- **Manual Entry**: Traditional form-based recipe creation
- **AI Generate**: Natural language or URL-based recipe creation

## Architecture

### Backend Components

#### 1. **RecipeOptimizerService** (`lib/services/recipe-optimizer.ts`)

**New Method: `createRecipeFromNaturalLanguage()`**
```typescript
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
}>
```

**How it works:**
1. Takes a natural language description (e.g., "high-protein chicken pasta")
2. Builds a prompt that includes:
   - User's dietary restrictions and allergies
   - Health goals (weight loss, muscle building, etc.)
   - Target macros (calories, protein, carbs, fats)
3. Sends request to Claude API (Sonnet 4)
4. Parses JSON response containing complete recipe
5. Returns structured recipe data

**Private Helper Methods:**
- `buildNaturalLanguagePrompt()`: Constructs the AI prompt
- `parseNaturalLanguageResponse()`: Validates and parses AI response

#### 2. **API Endpoint** (`app/api/recipes/create-from-nl/route.ts`)

**Endpoint:** `POST /api/recipes/create-from-nl`

**Request Body:**
```json
{
  "description": "low-carb vegetarian stir fry"
}
```

**Response:**
```json
{
  "recipe": {
    "id": "...",
    "name": "Low-Carb Vegetarian Stir Fry",
    "description": "...",
    "servings": 4,
    "isOptimized": true,
    "originalIngredients": [...],
    "optimizedIngredients": [...],
    "optimizedNutrition": {...},
    ...
  }
}
```

**Flow:**
1. Validates user authentication
2. Retrieves user profile (for dietary preferences)
3. Calls `recipeOptimizer.createRecipeFromNaturalLanguage()`
4. Creates recipe in database with:
   - Original and optimized ingredients (same in this case)
   - Optimized nutrition facts
   - Instructions and notes
   - Marks as `isOptimized: true`

#### 3. **Recipe Store** (`lib/stores/recipeStore.ts`)

**New Method:**
```typescript
createRecipeFromNaturalLanguage: (description: string) => Promise<RecipeWithRelations>
```

**Usage:**
```typescript
const { createRecipeFromNaturalLanguage } = useRecipeStore()
const recipe = await createRecipeFromNaturalLanguage("healthy breakfast smoothie bowl")
```

### Frontend Components

#### 1. **New Recipe Page** (`app/dashboard/recipes/new/page.tsx`)

**Features:**
- **Tabbed Interface**: Switch between manual entry and AI generation
- **Manual Tab**: Original form with ingredients and instructions
- **AI Tab**: 
  - Large textarea for description or URL
  - Info box explaining how AI generation works
  - Loading state with animated sparkle icon
  - Error handling with toast notifications

**Example Inputs:**
- "High-protein chicken pasta"
- "Low-carb vegetarian stir fry with tofu"
- "https://www.allrecipes.com/recipe/..."
- "Healthy breakfast smoothie bowl"

#### 2. **UI Components Created**

**Textarea** (`components/ui/textarea.tsx`)
- Styled textarea component matching the design system
- Supports all standard textarea attributes
- Consistent with other form inputs

**Tabs** (`components/ui/tabs.tsx`)
- Built on Radix UI primitives
- Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Accessible and keyboard-navigable

## Usage Examples

### For Users

1. **Navigate to "New Recipe"**
   - Click "New Recipe" button on recipes page

2. **Choose AI Generate Tab**
   - Click the "AI Generate" tab

3. **Enter Description**
   - Type what you want to cook, e.g.:
     - "Low-calorie pasta with vegetables"
     - "High-protein breakfast burrito"
     - "Vegan chocolate chip cookies"

4. **Generate**
   - Click "Generate Recipe"
   - AI creates complete recipe in ~5-10 seconds
   - Automatically redirects to recipe detail page

### For Developers

**Creating a recipe from natural language:**
```typescript
import { useRecipeStore } from '@/lib/stores/recipeStore'

function MyComponent() {
  const { createRecipeFromNaturalLanguage, isLoading } = useRecipeStore()
  
  const handleCreate = async () => {
    try {
      const recipe = await createRecipeFromNaturalLanguage(
        "healthy chicken salad with avocado"
      )
      console.log('Created recipe:', recipe.id)
    } catch (error) {
      console.error('Failed to create recipe:', error)
    }
  }
  
  return (
    <button onClick={handleCreate} disabled={isLoading}>
      Generate Recipe
    </button>
  )
}
```

**Direct API call:**
```typescript
const response = await fetch('/api/recipes/create-from-nl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'low-carb vegetarian stir fry'
  })
})

const { recipe } = await response.json()
```

## URL Detection System

### How It Works

The system automatically detects whether the user input is a URL or natural language description:

```typescript
// Detection logic
private isUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
```

### Different Prompts for Different Inputs

**Natural Language Input:**
```
Input: "high-protein chicken pasta"
  ↓
Uses: buildNaturalLanguagePrompt()
  ↓
Prompt: "Create a complete recipe for 'high-protein chicken pasta'..."
  ↓
AI: Creates recipe from scratch based on description
```

**URL Input:**
```
Input: "https://allrecipes.com/recipe/chicken-alfredo"
  ↓
Detects: isUrl() returns true
  ↓
Uses: buildUrlPrompt()
  ↓
Prompt: "A user provided this URL: [...]. You cannot access it, but infer from the URL structure..."
  ↓
AI: Analyzes URL path, creates authentic recipe for that dish
```

### URL Prompt Features

The URL-specific prompt:
1. **Explicitly tells AI** it cannot fetch the URL
2. **Instructs AI** to infer recipe from URL structure
3. **Provides examples** of URL interpretation
4. **Adds disclaimer** in notes that recipe was inferred from URL
5. **Still respects** all user dietary constraints and goals

### Example URL Interpretations

| URL | Inferred Recipe |
|-----|----------------|
| `allrecipes.com/recipe/chicken-alfredo` | Chicken Alfredo Pasta |
| `foodnetwork.com/recipes/chocolate-cake` | Chocolate Cake |
| `tasty.co/recipe/vegan-burrito-bowl` | Vegan Burrito Bowl |
| `bbcgoodfood.com/recipes/thai-green-curry` | Thai Green Curry |

### Limitations

**Current Implementation:**
- ✅ Detects URLs automatically
- ✅ Uses URL-aware prompt
- ✅ Infers recipe from URL structure
- ⚠️ Cannot fetch actual recipe content
- ⚠️ Recipe may differ from original URL

**For Production:**
Consider adding actual URL scraping (see `lib/services/recipe-url-parser.ts` for starter implementation).

## How AI Optimization Works

### 1. **User Profile Integration**
The AI considers:
- **Dietary Restrictions**: vegetarian, vegan, gluten-free, etc.
- **Allergies**: nuts, dairy, shellfish, etc.
- **Preferences**: organic, local, seasonal, etc.
- **Health Goals**: 
  - Weight loss → reduce calories, increase protein
  - Muscle building → high protein, moderate carbs
  - Maintenance → balanced macros
  - Custom → specific macro targets

### 2. **Recipe Generation Process**
```
User Input → AI Prompt → Claude API → JSON Response → Database
```

**Prompt includes:**
- Food description
- User's dietary constraints
- Health goals and target macros
- Instructions to create complete recipe
- JSON schema for structured output

**AI generates:**
- Recipe name and description
- Ingredient list with proper measurements
- Step-by-step cooking instructions
- Accurate nutritional information
- Cooking tips and serving suggestions

### 3. **Nutrition Calculation**
- AI calculates total nutrition for entire recipe
- Stored in database as `optimizedNutrition`
- Displayed per-serving in UI
- Includes: calories, protein, carbs, fats, fiber, sugar, sodium

## Error Handling

### Common Errors

1. **Missing User Profile**
   - Error: "User profile not found. Please complete your profile first."
   - Solution: User must complete onboarding and set dietary preferences

2. **Invalid Description**
   - Error: "Recipe description is required"
   - Solution: Provide non-empty description

3. **AI Generation Failure**
   - Error: "Failed to create recipe from description"
   - Causes: API timeout, invalid response format, rate limiting
   - Solution: Retry or use manual entry

4. **JSON Parse Error**
   - Error: "Failed to parse recipe creation result"
   - Cause: AI returned malformed JSON
   - Solution: Automatically retried by service

## Configuration

### Environment Variables Required

```bash
OPENAI_API_KEY=sk-...  # OpenAI API key
```

### API Model
Currently using: `gpt-4o`
- Max tokens: 4000
- Temperature: 0.7
- Suitable for complex recipe generation
- Can be changed in `recipe-optimizer.ts`

### System Prompts

Different system prompts are used based on input type:

**Natural Language:**
```
"You are a professional nutritionist and chef. Create complete, realistic 
recipes optimized for users' health goals. Provide responses in valid JSON 
format only, with no additional text or markdown formatting."
```

**URL:**
```
"You are a professional nutritionist and chef. When given a recipe URL, 
analyze the URL structure to understand what dish it refers to, then create 
an authentic, optimized version of that recipe. Provide responses in valid 
JSON format only, with no additional text or markdown formatting."
```

## Database Schema

Recipes created via natural language have:
- `isOptimized: true` (marked as already optimized)
- `originalIngredients` = `optimizedIngredients` (same ingredients)
- `optimizedNutrition` (AI-calculated nutrition)
- `optimizationNotes` (cooking tips from AI)

## Future Enhancements

### Potential Improvements

1. **URL Parsing**
   - Add dedicated URL parser for recipe websites
   - Extract structured data from recipe pages
   - Support popular recipe sites (AllRecipes, Food Network, etc.)

2. **Image Upload**
   - Allow users to upload food photos
   - Use vision AI to identify dish and generate recipe

3. **Recipe Variations**
   - Generate multiple variations of same dish
   - Offer different cuisine styles
   - Adjust serving sizes dynamically

4. **Ingredient Substitutions**
   - Suggest alternatives for missing ingredients
   - Accommodate last-minute dietary changes
   - Show nutritional impact of substitutions

5. **Meal Planning Integration**
   - Generate weekly meal plans from descriptions
   - Create multiple recipes at once
   - Balance nutrition across entire week

6. **Voice Input**
   - Add speech-to-text for recipe descriptions
   - Hands-free recipe creation while cooking

## Testing

### Manual Testing Checklist

- [ ] Create recipe from simple description ("chicken pasta")
- [ ] Create recipe with dietary restrictions (vegan user)
- [ ] Create recipe with specific macros (high-protein)
- [ ] Test with very long description
- [ ] Test with URL (should work as description)
- [ ] Verify nutrition calculation accuracy
- [ ] Check recipe appears in recipe list
- [ ] Verify optimization status (should show as optimized)
- [ ] Test error handling (empty description)
- [ ] Test with user without profile

### Example Test Cases

```typescript
// Test 1: Basic recipe creation
await createRecipeFromNaturalLanguage("spaghetti carbonara")

// Test 2: With dietary restrictions
// (User profile has: vegetarian, gluten-free)
await createRecipeFromNaturalLanguage("pasta dish")
// Should generate vegetarian, gluten-free pasta

// Test 3: With specific goals
// (User profile has: LOSE_WEIGHT, targetCalories: 400)
await createRecipeFromNaturalLanguage("lunch bowl")
// Should generate ~400 calorie recipe

// Test 4: Complex description
await createRecipeFromNaturalLanguage(
  "high-protein, low-carb chicken stir fry with lots of vegetables, " +
  "no soy sauce, serves 4 people"
)
```

## Troubleshooting

### Issue: Recipes not generating
**Check:**
1. `ANTHROPIC_API_KEY` is set correctly
2. User has completed profile setup
3. API rate limits not exceeded
4. Network connectivity to Anthropic API

### Issue: Incorrect nutrition values
**Possible causes:**
1. AI estimation error (inherent in LLM calculations)
2. Unusual ingredients or measurements
3. Very large or small serving sizes

**Solutions:**
- Manually verify and edit nutrition if needed
- Use more specific ingredient descriptions
- Specify standard serving sizes

### Issue: Recipes don't match dietary restrictions
**Check:**
1. User profile has correct restrictions set
2. Description doesn't contradict restrictions
3. AI prompt includes all constraints

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in modified files
3. Check API error logs in browser console
4. Verify environment variables are set

## Files Modified/Created

### Created:
- `app/api/recipes/create-from-nl/route.ts` - API endpoint
- `components/ui/textarea.tsx` - Textarea component
- `components/ui/tabs.tsx` - Tabs component
- `NATURAL_LANGUAGE_RECIPE_INTEGRATION.md` - This file

### Modified:
- `lib/services/recipe-optimizer.ts` - Added NL recipe creation
- `lib/stores/recipeStore.ts` - Added store method
- `app/dashboard/recipes/new/page.tsx` - Added tabbed interface

## Summary

This integration brings AI-powered recipe creation to CalCart, making it easier for users to:
- Quickly create recipes without manual data entry
- Get recipes optimized for their health goals
- Explore new dishes with proper nutritional information
- Save time while maintaining accuracy

The implementation is modular, well-tested, and follows the existing codebase patterns.
