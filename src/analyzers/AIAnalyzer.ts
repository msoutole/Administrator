/**
 * AI-powered repository analyzer
 */

import { AIProvider, AIAnalysisRequest } from '../ai/AIProvider';
import { AIProviderFactory } from '../ai/AIProviderFactory';
import { Config } from '../types';

export interface AIAnalysisResult {
  readmeQuality: number;
  codeQualityInsights: string[];
  securityConcerns: string[];
  architectureRecommendations: string[];
  modernizationSuggestions: string[];
}

export class AIAnalyzer {
  private aiProvider?: AIProvider;

  constructor(aiConfig?: Config['ai']) {
    if (aiConfig?.apiKey) {
      this.aiProvider = AIProviderFactory.create({
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        maxTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      });
    }
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return !!this.aiProvider;
  }

  /**
   * Analyze README quality using AI
   */
  async analyzeReadme(readmeContent: string): Promise<{
    qualityScore: number;
    suggestions: string[];
  }> {
    if (!this.aiProvider) {
      throw new Error('AI provider not configured');
    }

    const prompt = `You are a technical documentation expert. Analyze this README.md and provide:
1. A quality score from 0-100
2. 3-5 specific suggestions for improvement

Focus on: clarity, completeness, installation instructions, usage examples, and project description.

Return ONLY a JSON object with this structure:
{
  "score": <number>,
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;

    try {
      const response = await this.aiProvider.analyze({
        content: readmeContent,
        prompt,
        maxTokens: 1000,
        temperature: 0.5,
      });

      const result = JSON.parse(response.result);
      return {
        qualityScore: result.score || 50,
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      // Fallback to basic scoring if AI fails
      return {
        qualityScore: this.calculateBasicReadmeScore(readmeContent),
        suggestions: [],
      };
    }
  }

  /**
   * Analyze code quality and architecture
   */
  async analyzeCodeQuality(files: { path: string; content: string }[]): Promise<{
    insights: string[];
    architectureScore: number;
  }> {
    if (!this.aiProvider) {
      throw new Error('AI provider not configured');
    }

    const codeSnapshot = files
      .slice(0, 5) // Analyze first 5 files
      .map((f) => `// ${f.path}\n${f.content.slice(0, 500)}`)
      .join('\n\n---\n\n');

    const prompt = `You are a senior software architect. Analyze this code snapshot and provide:
1. An architecture quality score from 0-100
2. 3-5 key insights about code quality, patterns, and architecture

Return ONLY a JSON object:
{
  "score": <number>,
  "insights": ["insight 1", "insight 2", ...]
}`;

    try {
      const response = await this.aiProvider.analyze({
        content: codeSnapshot,
        prompt,
        maxTokens: 800,
        temperature: 0.3,
      });

      const result = JSON.parse(response.result);
      return {
        insights: result.insights || [],
        architectureScore: result.score || 70,
      };
    } catch (error) {
      return {
        insights: [],
        architectureScore: 70,
      };
    }
  }

  /**
   * Detect security concerns using AI
   */
  async analyzeSecurityConcerns(codeSnippets: string[]): Promise<string[]> {
    if (!this.aiProvider) {
      return [];
    }

    const codeSnapshot = codeSnippets.slice(0, 3).join('\n\n---\n\n');

    const prompt = `You are a security expert. Review this code for potential security issues.
List 3-5 security concerns (or "None found" if code looks secure).

Return ONLY a JSON array of strings:
["concern 1", "concern 2", ...]`;

    try {
      const response = await this.aiProvider.analyze({
        content: codeSnapshot,
        prompt,
        maxTokens: 500,
        temperature: 0.2,
      });

      const concerns = JSON.parse(response.result);
      return Array.isArray(concerns) ? concerns : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate modernization roadmap using AI
   */
  async generateModernizationRoadmap(context: {
    technologies: string[];
    lastUpdate: Date;
    hasTests: boolean;
    hasCICD: boolean;
  }): Promise<string[]> {
    if (!this.aiProvider) {
      return this.generateBasicRoadmap(context);
    }

    const contextStr = JSON.stringify(context, null, 2);

    const prompt = `You are a technology modernization consultant. Based on this project context:
${contextStr}

Provide 3-5 prioritized modernization steps (immediate, short-term, long-term).

Return ONLY a JSON array of strings:
["step 1", "step 2", ...]`;

    try {
      const response = await this.aiProvider.analyze({
        content: contextStr,
        prompt,
        maxTokens: 600,
        temperature: 0.6,
      });

      const roadmap = JSON.parse(response.result);
      return Array.isArray(roadmap) ? roadmap : this.generateBasicRoadmap(context);
    } catch (error) {
      return this.generateBasicRoadmap(context);
    }
  }

  /**
   * Fallback: Calculate basic README score without AI
   */
  private calculateBasicReadmeScore(content: string): number {
    let score = 0;

    // Length check
    if (content.length > 500) score += 20;
    if (content.length > 1500) score += 10;

    // Sections check
    if (/installation/i.test(content)) score += 15;
    if (/usage/i.test(content)) score += 15;
    if (/example/i.test(content)) score += 10;
    if (/api|reference/i.test(content)) score += 10;
    if (/contributing/i.test(content)) score += 10;
    if (/license/i.test(content)) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Fallback: Generate basic modernization roadmap
   */
  private generateBasicRoadmap(context: {
    technologies: string[];
    lastUpdate: Date;
    hasTests: boolean;
    hasCICD: boolean;
  }): string[] {
    const roadmap: string[] = [];

    if (!context.hasTests) {
      roadmap.push('Immediate: Add automated testing (Jest/Mocha)');
    }

    if (!context.hasCICD) {
      roadmap.push('Immediate: Set up CI/CD with GitHub Actions');
    }

    const daysSinceUpdate = Math.floor(
      (Date.now() - context.lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > 180) {
      roadmap.push('Short-term: Update dependencies to latest versions');
    }

    roadmap.push('Long-term: Implement comprehensive documentation');
    roadmap.push('Long-term: Increase test coverage to 80%+');

    return roadmap;
  }
}

export default AIAnalyzer;
