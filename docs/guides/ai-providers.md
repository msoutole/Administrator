# AI Providers Guide

Administrator supports multiple AI providers for enhanced repository analysis. This guide explains how to configure and use different AI providers.

## Supported Providers

| Provider | Models Available | Strengths |
|----------|-----------------|-----------|
| **OpenAI** | GPT-4 Turbo, GPT-4, GPT-3.5 | General-purpose, fast, widely supported |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku | Long context, excellent reasoning |
| **Google Gemini** | Gemini 1.5 Pro/Flash, Gemini 1.0 Pro | Multimodal, fast, cost-effective |

## Configuration

### Environment Variables

The simplest way to configure an AI provider is through environment variables in your `.env` file:

```env
# Choose your provider
AI_PROVIDER=openai  # Options: openai, anthropic, gemini

# Provider-specific API keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Optional: Specify model (uses provider default if not set)
AI_MODEL=gpt-4-turbo-preview

# Optional: Configure generation parameters
AI_MAX_TOKENS=2000      # Maximum response length
AI_TEMPERATURE=0.7      # Creativity (0.0-2.0)
```

### Programmatic Configuration

You can also configure AI providers programmatically:

```typescript
import { RepositoryAnalyzer, AIProviderFactory } from 'administrator';

// Option 1: Using factory with explicit config
const aiProvider = AIProviderFactory.create({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 2000,
  temperature: 0.7,
});

// Option 2: Using factory from environment
const aiProviderFromEnv = AIProviderFactory.createFromEnv();

// Option 3: Direct instantiation
import { OpenAIProvider } from 'administrator';

const openAIProvider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  'gpt-4-turbo-preview'
);

// Use with RepositoryAnalyzer
const analyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN! },
  ai: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-5-sonnet-20241022',
  },
});
```

## Provider-Specific Details

### OpenAI

**API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

**Recommended Models**:
- `gpt-4-turbo-preview` - Best quality, higher cost
- `gpt-4` - Excellent quality, balanced cost
- `gpt-3.5-turbo` - Fast, cost-effective

**Configuration**:
```typescript
{
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4-turbo-preview',
  maxTokens: 2000,
  temperature: 0.7,
}
```

### Anthropic (Claude)

**API Key**: Get from [Anthropic Console](https://console.anthropic.com/)

**Recommended Models**:
- `claude-3-5-sonnet-20241022` - Best balance of speed and quality
- `claude-3-opus-20240229` - Highest quality for complex tasks
- `claude-3-haiku-20240307` - Fastest, most cost-effective

**Configuration**:
```typescript
{
  provider: 'anthropic',
  apiKey: 'sk-ant-...',
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 2000,
  temperature: 0.7,
}
```

**Note**: Claude excels at analyzing large codebases due to its extended context window (200K+ tokens).

### Google Gemini

**API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Recommended Models**:
- `gemini-1.5-pro` - Best quality, large context
- `gemini-1.5-flash` - Fast, efficient
- `gemini-1.0-pro` - Baseline model

**Configuration**:
```typescript
{
  provider: 'gemini',
  apiKey: 'AIza...',
  model: 'gemini-1.5-pro',
  maxTokens: 2000,
  temperature: 0.7,
}
```

## Usage Examples

### Basic Analysis with AI

```typescript
import { RepositoryAnalyzer } from 'administrator';

const analyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN! },
  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
  },
});

const result = await analyzer.analyze('facebook/react');
console.log(result.score.overall);
```

### Switching Providers

```typescript
// Analyze with OpenAI
const openAIAnalyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN! },
  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
  },
});

// Analyze with Claude
const claudeAnalyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN! },
  ai: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
});

// Compare results
const openAIResult = await openAIAnalyzer.analyze('owner/repo');
const claudeResult = await claudeAnalyzer.analyze('owner/repo');
```

### Custom AI Analysis

```typescript
import { AIProviderFactory } from 'administrator';

const provider = AIProviderFactory.create({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const response = await provider.analyze({
  content: 'Repository README content...',
  prompt: 'Analyze this README for clarity and completeness',
  maxTokens: 1000,
  temperature: 0.5,
});

console.log(response.result);
console.log(`Tokens used: ${response.tokensUsed}`);
console.log(`Provider: ${response.provider}`);
```

### Validating Credentials

```typescript
import { AIProviderFactory } from 'administrator';

const isValid = await AIProviderFactory.validateProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
});

if (isValid) {
  console.log('API key is valid!');
} else {
  console.error('Invalid API key');
}
```

## Best Practices

### Choosing a Provider

1. **OpenAI (GPT-4)**: Best for general-purpose analysis, widely tested
2. **Anthropic (Claude)**: Best for large codebases, complex reasoning
3. **Google Gemini**: Best for cost-effectiveness, fast analysis

### Cost Optimization

```typescript
// Use smaller models for simple tasks
const fastAnalyzer = new RepositoryAnalyzer({
  github: { token: process.env.GITHUB_TOKEN! },
  ai: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-3.5-turbo', // Cheaper model
    maxTokens: 1000,        // Lower token limit
  },
});
```

### Error Handling

```typescript
import { AIProviderFactory } from 'administrator';

try {
  const provider = AIProviderFactory.createFromEnv();

  // Validate before heavy usage
  const isValid = await provider.validateCredentials();
  if (!isValid) {
    throw new Error('Invalid API credentials');
  }

  const result = await provider.analyze({
    content: 'Content to analyze',
    prompt: 'Analysis prompt',
  });

  console.log(result.result);
} catch (error) {
  if (error instanceof Error) {
    console.error(`AI analysis failed: ${error.message}`);
  }
}
```

### Rate Limiting

All providers implement their own rate limiting. To handle rate limits:

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeWithRetry(provider: AIProvider, request: AIAnalysisRequest) {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await provider.analyze(request);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

## Troubleshooting

### Common Issues

**"API key not found"**
- Ensure your `.env` file has the correct API key variable set
- Check that the provider name matches the API key (e.g., `AI_PROVIDER=openai` needs `OPENAI_API_KEY`)

**"Invalid API key"**
- Verify your API key is correct and active
- Check that you have sufficient credits/quota with the provider

**"Rate limit exceeded"**
- Implement exponential backoff (see example above)
- Consider upgrading your API plan
- Use a more efficient model or reduce token limits

**TypeScript errors**
- Ensure you have the latest types: `npm install --save-dev @types/node`
- Check that your `tsconfig.json` has `"lib": ["ES2020"]` or newer

## Advanced Usage

### Creating Custom Providers

You can create custom AI providers by implementing the `AIProvider` interface:

```typescript
import { AIProvider, AIAnalysisRequest, AIAnalysisResponse } from 'administrator';

export class CustomAIProvider implements AIProvider {
  constructor(private apiKey: string) {}

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Your implementation
    return {
      result: 'Analysis result',
      provider: this.getProviderName(),
    };
  }

  getProviderName(): string {
    return 'Custom Provider';
  }

  async validateCredentials(): Promise<boolean> {
    // Validation logic
    return true;
  }

  getAvailableModels(): string[] {
    return ['model-1', 'model-2'];
  }
}
```

## API Reference

See [API Documentation](../api/ai-providers.md) for detailed API reference.

## Support

If you encounter issues with AI providers:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify your API key and provider configuration
3. Open an issue on [GitHub](https://github.com/msoutole/administrator/issues)
