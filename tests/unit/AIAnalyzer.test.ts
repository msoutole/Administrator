/**
 * Tests for AIAnalyzer
 */

import { AIAnalyzer } from '../../src/analyzers/AIAnalyzer';

describe('AIAnalyzer', () => {
  describe('without AI configuration', () => {
    it('should indicate AI is not available', () => {
      const analyzer = new AIAnalyzer();
      expect(analyzer.isAIAvailable()).toBe(false);
    });

    it('should throw error when trying to analyze without AI', async () => {
      const analyzer = new AIAnalyzer();
      await expect(analyzer.analyzeReadme('test')).rejects.toThrow(
        'AI provider not configured'
      );
    });
  });

  describe('with AI configuration', () => {
    it('should indicate AI is available', () => {
      const analyzer = new AIAnalyzer({
        provider: 'openai',
        apiKey: 'test-key',
      });
      expect(analyzer.isAIAvailable()).toBe(true);
    });

    // Note: Testing actual AI fallback requires mocking fetch
    // This test is skipped to avoid making real API calls
    it.skip('should fallback to basic scoring if AI fails', async () => {
      const analyzer = new AIAnalyzer({
        provider: 'openai',
        apiKey: 'invalid-key',
      });

      const result = await analyzer.analyzeReadme('# Test README\n\nSome content here.');
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('generateModernizationRoadmap', () => {
    it('should generate basic roadmap without AI', async () => {
      const analyzer = new AIAnalyzer();

      const roadmap = await analyzer.generateModernizationRoadmap({
        technologies: ['javascript', 'node'],
        lastUpdate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
        hasTests: false,
        hasCICD: false,
      });

      expect(roadmap.length).toBeGreaterThan(0);
      expect(roadmap.some((item) => item.includes('test'))).toBe(true);
      expect(roadmap.some((item) => item.includes('CI/CD'))).toBe(true);
    });

    it('should include dependency update if old', async () => {
      const analyzer = new AIAnalyzer();

      const roadmap = await analyzer.generateModernizationRoadmap({
        technologies: ['javascript'],
        lastUpdate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        hasTests: true,
        hasCICD: true,
      });

      expect(roadmap.some((item) => item.includes('dependencies'))).toBe(true);
    });

    it('should not suggest tests if already present', async () => {
      const analyzer = new AIAnalyzer();

      const roadmap = await analyzer.generateModernizationRoadmap({
        technologies: ['typescript'],
        lastUpdate: new Date(),
        hasTests: true,
        hasCICD: true,
      });

      expect(roadmap.some((item) => /immediate.*test/i.test(item))).toBe(false);
    });
  });
});
