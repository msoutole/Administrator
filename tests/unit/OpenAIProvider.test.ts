/**
 * Tests for OpenAIProvider
 */

import { OpenAIProvider } from '../../src/ai/providers/OpenAIProvider';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-api-key');
    jest.clearAllMocks();
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      expect(provider.getProviderName()).toBe('OpenAI');
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', () => {
      const models = provider.getAvailableModels();

      expect(models).toContain('gpt-4-turbo-preview');
      expect(models).toContain('gpt-4');
      expect(models).toContain('gpt-3.5-turbo');
    });
  });

  describe('analyze', () => {
    it('should analyze content successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Analysis result',
            },
          },
        ],
        usage: {
          total_tokens: 100,
        },
        model: 'gpt-4-turbo-preview',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.analyze({
        content: 'Test content',
        prompt: 'Test prompt',
      });

      expect(result.result).toBe('Analysis result');
      expect(result.tokensUsed).toBe(100);
      expect(result.model).toBe('gpt-4-turbo-preview');
      expect(result.provider).toBe('OpenAI');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: { message: 'Invalid API key' },
        }),
      });

      await expect(
        provider.analyze({
          content: 'Test content',
          prompt: 'Test prompt',
        })
      ).rejects.toThrow('OpenAI analysis failed');
    });

    it('should use custom parameters', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Result' } }],
        model: 'gpt-4',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await provider.analyze({
        content: 'Test content',
        prompt: 'Test prompt',
        maxTokens: 500,
        temperature: 0.5,
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.max_tokens).toBe(500);
      expect(requestBody.temperature).toBe(0.5);
    });
  });

  describe('validateCredentials', () => {
    it('should return true for valid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const isValid = await provider.validateCredentials();

      expect(isValid).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const isValid = await provider.validateCredentials();

      expect(isValid).toBe(false);
    });

    it('should return false on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const isValid = await provider.validateCredentials();

      expect(isValid).toBe(false);
    });
  });
});
