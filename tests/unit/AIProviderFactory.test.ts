/**
 * Tests for AIProviderFactory
 */

import { AIProviderFactory } from '../../src/ai/AIProviderFactory';
import { OpenAIProvider } from '../../src/ai/providers/OpenAIProvider';
import { AnthropicProvider } from '../../src/ai/providers/AnthropicProvider';
import { GeminiProvider } from '../../src/ai/providers/GeminiProvider';

describe('AIProviderFactory', () => {
  describe('create', () => {
    it('should create OpenAI provider', () => {
      const provider = AIProviderFactory.create({
        provider: 'openai',
        apiKey: 'test-key',
      });

      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.getProviderName()).toBe('OpenAI');
    });

    it('should create Anthropic provider', () => {
      const provider = AIProviderFactory.create({
        provider: 'anthropic',
        apiKey: 'test-key',
      });

      expect(provider).toBeInstanceOf(AnthropicProvider);
      expect(provider.getProviderName()).toBe('Anthropic');
    });

    it('should create Gemini provider', () => {
      const provider = AIProviderFactory.create({
        provider: 'gemini',
        apiKey: 'test-key',
      });

      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.getProviderName()).toBe('Google Gemini');
    });

    it('should create provider with custom model', () => {
      const provider = AIProviderFactory.create({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      });

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should throw error for unknown provider', () => {
      expect(() => {
        AIProviderFactory.create({
          provider: 'unknown' as any,
          apiKey: 'test-key',
        });
      }).toThrow('Unknown AI provider: unknown');
    });

    it('should throw error for missing API key', () => {
      expect(() => {
        AIProviderFactory.create({
          provider: 'openai',
          apiKey: '',
        });
      }).toThrow('API key is required');
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = AIProviderFactory.getSupportedProviders();

      expect(providers).toEqual(['openai', 'anthropic', 'gemini']);
    });
  });

  describe('createFromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should create OpenAI provider from env vars', () => {
      process.env.AI_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const provider = AIProviderFactory.createFromEnv();

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create Anthropic provider from env vars', () => {
      process.env.AI_PROVIDER = 'anthropic';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const provider = AIProviderFactory.createFromEnv();

      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should create Gemini provider from env vars', () => {
      process.env.AI_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const provider = AIProviderFactory.createFromEnv();

      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('should use openai as default provider', () => {
      delete process.env.AI_PROVIDER;
      process.env.OPENAI_API_KEY = 'test-key';

      const provider = AIProviderFactory.createFromEnv();

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should throw error if API key not found', () => {
      process.env.AI_PROVIDER = 'openai';
      delete process.env.OPENAI_API_KEY;

      expect(() => {
        AIProviderFactory.createFromEnv();
      }).toThrow('API key not found for openai provider');
    });

    it('should use custom model from env', () => {
      process.env.AI_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.AI_MODEL = 'gpt-4';

      const provider = AIProviderFactory.createFromEnv();

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });
  });
});
