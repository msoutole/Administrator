/**
 * Base interface for AI providers
 */

export interface AIAnalysisRequest {
  content: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIAnalysisResponse {
  result: string;
  tokensUsed?: number;
  model?: string;
  provider: string;
}

export interface AIProvider {
  /**
   * Analyze content using AI
   */
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Validate API credentials
   */
  validateCredentials(): Promise<boolean>;

  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}
