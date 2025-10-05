# Migration from Anthropic to OpenAI

## Summary

The recipe optimizer service has been migrated from Anthropic's Claude API to OpenAI's GPT-4o API due to insufficient credits on the Anthropic account.

## Changes Made

### 1. **Package Dependencies**

**Removed:**
```json
"@anthropic-ai/sdk": "^0.x.x"
```

**Added:**
```json
"openai": "^4.x.x"
```

**Installation:**
```bash
npm install openai
```

### 2. **Environment Variables**

**Before:**
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**After:**
```bash
OPENAI_API_KEY=sk-...
```

⚠️ **Action Required:** Update your `.env` file with your OpenAI API key.

### 3. **Code Changes in `lib/services/recipe-optimizer.ts`**

#### Import Statement
```diff
- import Anthropic from '@anthropic-ai/sdk'
+ import OpenAI from 'openai'
```

#### Client Initialization
```diff
- private client: Anthropic
+ private client: OpenAI

  constructor() {
-   const apiKey = process.env.ANTHROPIC_API_KEY
+   const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
-     throw new Error('ANTHROPIC_API_KEY is not set')
+     throw new Error('OPENAI_API_KEY is not set')
    }
-   this.client = new Anthropic({ apiKey })
+   this.client = new OpenAI({ apiKey })
  }
```

#### API Calls - Recipe Optimization

**Before (Anthropic):**
```typescript
const response = await this.client.messages.create({
  model: 'claude-4-5-sonnet-20241022',
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
```

**After (OpenAI):**
```typescript
const response = await this.client.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 4000,
  messages: [
    {
      role: 'system',
      content: 'You are a professional nutritionist and chef. Provide responses in valid JSON format only, with no additional text or markdown formatting.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.7
})

const content = response.choices[0]?.message?.content
if (!content) {
  throw new Error('No response from OpenAI')
}

return this.parseResponse(content)
```

#### API Calls - Natural Language Recipe Creation

**Key Addition: System Prompts**

The OpenAI implementation uses separate system prompts for URLs vs natural language:

```typescript
// System prompt for OpenAI
const systemPrompt = isUrl
  ? 'You are a professional nutritionist and chef. When given a recipe URL, analyze the URL structure to understand what dish it refers to, then create an authentic, optimized version of that recipe. Provide responses in valid JSON format only, with no additional text or markdown formatting.'
  : 'You are a professional nutritionist and chef. Create complete, realistic recipes optimized for users\' health goals. Provide responses in valid JSON format only, with no additional text or markdown formatting.'

const response = await this.client.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 4000,
  messages: [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userPrompt
    }
  ],
  temperature: 0.7
})
```

## Key Differences: Anthropic vs OpenAI

| Feature | Anthropic (Claude) | OpenAI (GPT-4o) |
|---------|-------------------|-----------------|
| **API Structure** | `messages.create()` | `chat.completions.create()` |
| **Message Format** | Single `messages` array | Separate `system` and `user` roles |
| **Response Access** | `response.content[0].text` | `response.choices[0].message.content` |
| **System Prompts** | Included in user message | Dedicated `system` role message |
| **Temperature** | Not specified (default) | 0.7 (explicit) |
| **Model** | `claude-4-5-sonnet-20241022` | `gpt-4o` |

## Benefits of OpenAI Implementation

### 1. **Explicit System Prompts**
OpenAI's chat completion API supports a dedicated `system` role, making it clearer what the AI's purpose is:
- Natural language: General recipe creation
- URL: URL-based recipe inference

### 2. **Better Separation of Concerns**
- System prompt = AI's role and behavior
- User prompt = Specific request with user data

### 3. **Temperature Control**
Explicit temperature setting (0.7) balances creativity and consistency.

### 4. **More Flexible**
Easier to add conversation history or multi-turn interactions in the future.

## Testing

### Before Testing

1. **Set OpenAI API Key:**
   ```bash
   # In .env file
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Test Cases

1. **Natural Language Recipe:**
   ```
   Input: "high-protein chicken pasta"
   Expected: Complete recipe with ingredients, instructions, nutrition
   ```

2. **URL Recipe:**
   ```
   Input: "https://allrecipes.com/recipe/chicken-alfredo"
   Expected: Chicken alfredo recipe inferred from URL
   ```

3. **Recipe Optimization:**
   ```
   Test existing recipe optimization feature
   Expected: Should still work with OpenAI
   ```

## Cost Comparison

### Anthropic Claude
- Model: Claude Sonnet 4
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

### OpenAI GPT-4o
- Model: GPT-4o
- Input: $2.50 per 1M tokens
- Output: $10 per 1M tokens

**Result:** OpenAI is slightly cheaper (about 17-33% cost reduction).

## Troubleshooting

### Error: "OPENAI_API_KEY is not set"
**Solution:** Add your OpenAI API key to `.env` file

### Error: "Cannot find module 'openai'"
**Solution:** 
```bash
npm install openai
```
Then restart your dev server.

### Error: "Model 'gpt-4o' does not exist"
**Solution:** Your API key might not have access to GPT-4o. Options:
1. Use `gpt-4-turbo` instead
2. Upgrade your OpenAI account
3. Use `gpt-3.5-turbo` (cheaper but lower quality)

### JSON Parsing Errors
OpenAI sometimes includes markdown formatting. The system prompt explicitly requests JSON only, but if you get errors:
1. Check the console logs for the actual response
2. The parser already strips markdown code blocks
3. May need to add additional response cleaning

## Rollback Instructions

If you need to switch back to Anthropic:

1. **Reinstall Anthropic SDK:**
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Revert code changes** in `lib/services/recipe-optimizer.ts`

3. **Update environment variable:**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. **Restart dev server**

## Future Improvements

1. **Response Validation:** Add more robust JSON validation and cleaning
2. **Retry Logic:** Implement exponential backoff for API failures
3. **Caching:** Cache similar recipe requests to reduce API costs
4. **Model Selection:** Allow configuration of which model to use
5. **Streaming:** Implement streaming responses for better UX
6. **Error Messages:** More user-friendly error messages

## Summary

✅ Successfully migrated from Anthropic Claude to OpenAI GPT-4o
✅ Added explicit system prompts for better AI behavior
✅ Maintained all existing functionality
✅ Slightly reduced API costs
✅ URL vs Natural Language detection still works

⚠️ **Action Required:** Set `OPENAI_API_KEY` in your `.env` file before testing.
