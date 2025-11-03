# Model Listing API Guide

This guide explains how to fetch available models for each LLM provider using your API keys.

## API Endpoint

```
GET /api/models?provider={provider_name}
```

## Supported Providers

- `openai` - Lists all available OpenAI models
- `azure-openai` - Shows configured Azure deployment info
- `anthropic` - Lists available Claude models (static list)
- `bedrock` - Lists AWS Bedrock foundation models
- `gemini` - Lists available Google Gemini models
- `cohere` - Lists available Cohere models (static list)
- `grok` - Lists available Grok/xAI models

## Usage Examples

### Using cURL

**List OpenAI models:**
```bash
curl http://localhost:3000/api/models?provider=openai
```

**List Gemini models:**
```bash
curl http://localhost:3000/api/models?provider=gemini
```

**List Bedrock models:**
```bash
curl http://localhost:3000/api/models?provider=bedrock
```

**List Grok models:**
```bash
curl http://localhost:3000/api/models?provider=grok
```

### Using JavaScript/Fetch

```javascript
// Fetch available models for a provider
async function getAvailableModels(provider) {
    const response = await fetch(`/api/models?provider=${provider}`);
    const data = await response.json();
    console.log(`Available models for ${provider}:`, data);
    return data.models;
}

// Example usage
const geminiModels = await getAvailableModels('gemini');
const grokModels = await getAvailableModels('grok');
```

### Response Format

```json
{
    "provider": "gemini",
    "models": [
        {
            "name": "models/gemini-1.5-flash",
            "displayName": "Gemini 1.5 Flash",
            "description": "Fast and versatile performance across a diverse variety of tasks",
            "supportedGenerationMethods": ["generateContent", "streamGenerateContent"]
        },
        {
            "name": "models/gemini-1.5-pro",
            "displayName": "Gemini 1.5 Pro",
            "description": "Mid-size multimodal model that supports up to 2 million tokens",
            "supportedGenerationMethods": ["generateContent", "streamGenerateContent"]
        }
    ],
    "timestamp": "2025-01-03T10:30:00.000Z"
}
```

## Provider-Specific Notes

### OpenAI
- Returns all models your API key has access to
- Includes GPT-4, GPT-3.5, and other models

### Azure OpenAI
- Azure uses deployments, not direct model names
- Shows your configured deployment from environment variables
- To list all deployments, use Azure Management API

### Anthropic
- No official API for listing models
- Returns a static list of known Claude models

### AWS Bedrock
- Requires valid AWS credentials
- Lists all foundation models available in your region
- Includes models from Anthropic, Meta, Cohere, etc.

### Google Gemini
- Lists all models available for your API key
- Includes model capabilities and supported methods
- For free tier, you'll see gemini-1.5-flash, gemini-1.5-pro, etc.

### Cohere
- No dedicated list endpoint in SDK
- Returns a static list of known Cohere models

### Grok (xAI)
- Uses OpenAI-compatible API
- Lists available Grok models

## Testing Your API Keys

You can use this endpoint to verify your API keys are working correctly. If you get an error, check:

1. Your API key is correctly set in `.env`
2. Your API key has the necessary permissions
3. Your account has access to the provider's API

## Example: Check Gemini Models

```bash
# Start your dev server
npm run dev

# In another terminal, check available Gemini models
curl http://localhost:3000/api/models?provider=gemini | jq

# Expected output will show models like:
# - gemini-1.5-flash
# - gemini-1.5-flash-8b
# - gemini-1.5-pro
# - gemini-pro (legacy)
```

## Integration with Chat UI

You can integrate this into your chat interface to dynamically populate model dropdowns or validate model selections.

```typescript
// Example: Fetch and display available models
useEffect(() => {
    async function loadModels() {
        const response = await fetch(`/api/models?provider=${selectedProvider}`);
        const data = await response.json();
        setAvailableModels(data.models);
    }
    loadModels();
}, [selectedProvider]);
```
