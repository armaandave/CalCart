# URL vs Natural Language Detection System

## Overview

The recipe creation system automatically detects whether user input is a URL or natural language description and uses the appropriate AI prompt for each.

## Detection Logic

### Code Implementation

```typescript
// In lib/services/recipe-optimizer.ts

private isUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
```

### How It Works

1. Attempts to parse input as a URL using JavaScript's `URL` constructor
2. If successful and protocol is `http:` or `https:`, treats as URL
3. If parsing fails, treats as natural language description

### Examples

| Input | Detected As | Reason |
|-------|-------------|--------|
| `"chicken pasta"` | Natural Language | URL parsing fails |
| `"high-protein breakfast"` | Natural Language | URL parsing fails |
| `"https://allrecipes.com/recipe/123"` | URL | Valid URL with https:// |
| `"http://foodnetwork.com/recipes/cake"` | URL | Valid URL with http:// |
| `"www.allrecipes.com/recipe/123"` | Natural Language | Missing protocol |
| `"allrecipes.com/recipe/123"` | Natural Language | Missing protocol |

**Note:** URLs must include `http://` or `https://` to be detected as URLs.

## Prompt Differences

### Natural Language Prompt

**Used when:** Input is a description like "chicken pasta" or "vegan burrito bowl"

**Key characteristics:**
```
Prompt: "Create a complete recipe for '{description}' optimized for {goal}."

Focus:
- Create recipe from scratch
- Use description as creative direction
- Full creative freedom
- No source attribution needed
```

**Example:**
```
Input: "high-protein chicken pasta"

Prompt excerpt:
"Create a complete recipe for 'high-protein chicken pasta' optimized for 
muscle building (high protein, moderate carbs, healthy fats)."

Result: AI creates original recipe based on description
```

### URL Prompt

**Used when:** Input is a URL like "https://allrecipes.com/recipe/chicken-alfredo"

**Key characteristics:**
```
Prompt: "A user provided this URL: {url}. You cannot access it, but infer from URL structure."

Focus:
- Acknowledge URL cannot be fetched
- Infer dish from URL path/structure
- Create authentic version of that specific dish
- Add disclaimer in notes
```

**Example:**
```
Input: "https://allrecipes.com/recipe/chicken-alfredo"

Prompt excerpt:
"A user has provided this recipe URL: https://allrecipes.com/recipe/chicken-alfredo

IMPORTANT CONTEXT:
- You cannot access or fetch the URL directly
- Analyze the URL structure to understand what recipe it refers to
- Use your culinary knowledge to create a similar, authentic recipe

Examples of URL interpretation:
- 'allrecipes.com/recipe/chicken-alfredo' → Create a chicken alfredo recipe"

Result: AI creates authentic chicken alfredo recipe (inferred from URL)
```

## Side-by-Side Comparison

### Natural Language Flow

```
┌─────────────────────────────────────┐
│ User Input: "chicken pasta"        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ isUrl() → false                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ buildNaturalLanguagePrompt()        │
│                                     │
│ "Create a complete recipe for      │
│  'chicken pasta'..."                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Claude AI                           │
│ - Creates original recipe           │
│ - Uses description as guide         │
│ - Optimizes for user goals          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Result: "Healthy Chicken Pasta"     │
│ - Original ingredients              │
│ - Custom instructions               │
│ - Optimized nutrition               │
└─────────────────────────────────────┘
```

### URL Flow

```
┌─────────────────────────────────────┐
│ User Input:                         │
│ "https://allrecipes.com/recipe/    │
│  chicken-alfredo"                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ isUrl() → true                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ buildUrlPrompt()                    │
│                                     │
│ "User provided URL: {...}           │
│  You cannot access it, but infer    │
│  from URL structure..."             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Claude AI                           │
│ - Analyzes URL path                 │
│ - Identifies "chicken-alfredo"      │
│ - Creates authentic recipe          │
│ - Adds URL disclaimer in notes      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Result: "Chicken Alfredo"           │
│ - Traditional alfredo ingredients   │
│ - Classic preparation method        │
│ - Optimized for health goals        │
│ - Note: "Created from URL structure"│
└─────────────────────────────────────┘
```

## Prompt Content Comparison

### Both Prompts Include:
- ✅ User's dietary restrictions
- ✅ Allergies
- ✅ Preferences
- ✅ Health goals (weight loss, muscle building, etc.)
- ✅ Target macros (calories, protein, carbs, fats)
- ✅ JSON response format
- ✅ Nutrition calculation requirements

### Natural Language Prompt Only:
- 📝 "Create a complete recipe for '{description}'"
- 📝 Focus on creative interpretation
- 📝 No source attribution

### URL Prompt Only:
- 🔗 "A user has provided this recipe URL: {url}"
- 🔗 "You cannot access or fetch the URL directly"
- 🔗 "Analyze the URL structure to understand what recipe it refers to"
- 🔗 Examples of URL interpretation
- 🔗 Instruction to add disclaimer in notes
- 🔗 Emphasis on creating "authentic" version of specific dish

## Testing Examples

### Test Natural Language Detection

```typescript
// These should use Natural Language prompt
createRecipeFromNaturalLanguage("chicken pasta")
createRecipeFromNaturalLanguage("high-protein breakfast bowl")
createRecipeFromNaturalLanguage("vegan chocolate cake")
createRecipeFromNaturalLanguage("low-carb dinner")
```

### Test URL Detection

```typescript
// These should use URL prompt
createRecipeFromNaturalLanguage("https://allrecipes.com/recipe/chicken-alfredo")
createRecipeFromNaturalLanguage("http://foodnetwork.com/recipes/chocolate-cake")
createRecipeFromNaturalLanguage("https://tasty.co/recipe/vegan-burrito-bowl")
```

### Edge Cases

```typescript
// Natural Language (missing protocol)
createRecipeFromNaturalLanguage("www.allrecipes.com/recipe/123")
createRecipeFromNaturalLanguage("allrecipes.com/recipe/123")

// Natural Language (not a valid URL)
createRecipeFromNaturalLanguage("chicken from allrecipes")
createRecipeFromNaturalLanguage("recipe: chicken pasta")
```

## User Experience

### In the UI

Users see the same input field for both:

```
┌────────────────────────────────────────────────┐
│ Recipe Description or URL *                    │
│ ┌────────────────────────────────────────────┐ │
│ │ Examples:                                  │ │
│ │ • High-protein chicken pasta               │ │
│ │ • Low-carb vegetarian stir fry with tofu   │ │
│ │ • https://www.allrecipes.com/recipe/...    │ │
│ │ • Healthy breakfast smoothie bowl          │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

The system automatically:
1. Detects input type
2. Selects appropriate prompt
3. Generates recipe
4. No user action required

### Generated Recipe Differences

**Natural Language Result:**
```json
{
  "name": "High-Protein Chicken Pasta",
  "notes": [
    "Great post-workout meal",
    "Can meal prep for the week"
  ]
}
```

**URL Result:**
```json
{
  "name": "Chicken Alfredo",
  "notes": [
    "Note: This recipe was created based on the URL structure and culinary knowledge, not the actual URL content",
    "Classic Italian-American comfort food",
    "Pairs well with garlic bread"
  ]
}
```

## Limitations & Future Improvements

### Current Limitations

1. **URL must include protocol**
   - ❌ `allrecipes.com/recipe/123` → Treated as natural language
   - ✅ `https://allrecipes.com/recipe/123` → Treated as URL

2. **Cannot fetch actual URL content**
   - AI infers from URL structure only
   - Recipe may differ from original

3. **No site-specific parsing**
   - Treats all URLs the same way
   - No special handling for AllRecipes vs Food Network

### Future Enhancements

1. **Add URL scraping**
   ```typescript
   // Fetch actual recipe content
   const html = await fetch(url)
   const recipe = parseRecipeFromHtml(html)
   ```

2. **Detect URLs without protocol**
   ```typescript
   // Recognize domain patterns
   if (input.match(/^(www\.)?[a-z0-9-]+\.(com|net|org)/)) {
     return true // Treat as URL
   }
   ```

3. **Site-specific parsers**
   ```typescript
   // Different parsing for different sites
   if (url.includes('allrecipes.com')) {
     return parseAllRecipes(url)
   }
   ```

4. **Visual feedback**
   ```typescript
   // Show detected input type to user
   {isUrl(input) && (
     <Badge>🔗 URL Detected</Badge>
   )}
   ```

## Summary

| Aspect | Natural Language | URL |
|--------|-----------------|-----|
| **Detection** | URL parsing fails | URL parsing succeeds |
| **Prompt** | "Create recipe for '{description}'" | "User provided URL: {url}" |
| **AI Behavior** | Creative interpretation | Infer from URL structure |
| **Result** | Original recipe | Authentic version of dish |
| **Notes** | Cooking tips | Includes URL disclaimer |
| **Reliability** | ✅ High | ⚠️ Medium (cannot fetch URL) |

The system provides a seamless experience where users can input either natural language or URLs, and the AI automatically adapts its approach to provide the best possible recipe.
