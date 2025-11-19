/**
 * Factory for creating AI provider instances
 */

import { AIProvider, AIProviderConfig } from './AIProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GeminiProvider } from './providers/GeminiProvider';

export class AIProviderFactory {
  /**
   * Create an AI provider instance based on configuration
   */
  static create(config: AIProviderConfig): AIProvider {
    if (!config.apiKey) {
      throw new Error(`API key is required for ${config.provider} provider`);
    }

    switch (config.provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(config.apiKey, config.model);

      case 'anthropic':
        return new AnthropicProvider(config.apiKey, config.model);

      case 'gemini':
        return new GeminiProvider(config.apiKey, config.model);

      default:
        throw new Error(
          `Unknown AI provider: ${config.provider}. Supported providers: openai, anthropic, gemini`
        );
    }
  }

  /**
   * Create provider from environment variables
   */
  static createFromEnv(): AIProvider {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

    let apiKey: string | undefined;
    switch (provider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        break;
      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY;
        break;
      case 'gemini':
        apiKey = process.env.GEMINI_API_KEY;
        break;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }

    if (!apiKey) {
      throw new Error(`API key not found for ${provider} provider`);
    }

    return this.create({
      provider: provider as 'openai' | 'anthropic' | 'gemini',
      apiKey,
      model: process.env.AI_MODEL,
      maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : undefined,
      temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : undefined,
    });
  }

  /**
   * Get list of supported providers
   */
  static getSupportedProviders(): string[] {
    return ['openai', 'anthropic', 'gemini'];
  }

  /**
   * Validate provider configuration
   */
  static async validateProvider(config: AIProviderConfig): Promise<boolean> {
    try {
      const provider = this.create(config);
      return await provider.validateCredentials();
    } catch {
      return false;
    }
  }
}
