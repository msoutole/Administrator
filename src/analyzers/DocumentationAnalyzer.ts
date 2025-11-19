/**
 * Documentation analyzer with optional AI enhancement
 */

import { DocumentationMetrics } from '../types';
import { GitHubClient } from '../utils/GitHubClient';
import { AIAnalyzer } from './AIAnalyzer';
import { Config } from '../types';

export class DocumentationAnalyzer {
  private aiAnalyzer?: AIAnalyzer;

  constructor(
    private githubClient: GitHubClient,
    aiConfig?: Config['ai']
  ) {
    if (aiConfig?.apiKey) {
      this.aiAnalyzer = new AIAnalyzer(aiConfig);
    }
  }

  async analyze(owner: string, repo: string): Promise<DocumentationMetrics> {
    const hasReadme = await this.githubClient.hasFile(owner, repo, 'README.md');
    const readmeContent = await this.githubClient.getFileContent(owner, repo, 'README.md');

    // Use AI for README quality if available, otherwise use basic scoring
    let readmeQuality = 0;
    if (readmeContent && this.aiAnalyzer?.isAIAvailable()) {
      try {
        const aiResult = await this.aiAnalyzer.analyzeReadme(readmeContent);
        readmeQuality = aiResult.qualityScore;
      } catch (error) {
        // Fallback to basic scoring if AI fails
        readmeQuality = this.calculateReadmeQuality(readmeContent);
      }
    } else {
      readmeQuality = this.calculateReadmeQuality(readmeContent);
    }

    const hasContributing = await this.githubClient.hasFile(owner, repo, 'CONTRIBUTING.md');
    const hasLicense = await this.hasLicense(owner, repo);
    const hasChangelog = await this.hasChangelog(owner, repo);
    const apiDocumentation = await this.hasApiDocs(owner, repo);

    return {
      hasReadme,
      readmeQuality,
      hasContributing,
      hasLicense,
      hasChangelog,
      apiDocumentation,
    };
  }

  private calculateReadmeQuality(content: string | null): number {
    if (!content) return 0;

    let score = 0;
    const maxScore = 100;

    // Length check (min 500 chars for good README)
    if (content.length >= 500) score += 20;
    else if (content.length >= 200) score += 10;

    // Has title
    if (/^#\s+.+/m.test(content)) score += 10;

    // Has description
    if (content.length > 100) score += 10;

    // Has installation section
    if (/##\s+(Installation|Install|Setup)/i.test(content)) score += 15;

    // Has usage section
    if (/##\s+(Usage|Example|Quick\s+Start)/i.test(content)) score += 15;

    // Has code examples
    if (/```[\s\S]*?```/.test(content)) score += 10;

    // Has links
    if (/\[.+\]\(.+\)/.test(content)) score += 10;

    // Has badges
    if (/!\[.*\]\(.*\)/.test(content)) score += 10;

    return Math.min(score, maxScore);
  }

  private async hasLicense(owner: string, repo: string): Promise<boolean> {
    const licensePaths = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'];
    for (const path of licensePaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasChangelog(owner: string, repo: string): Promise<boolean> {
    const changelogPaths = ['CHANGELOG.md', 'CHANGELOG', 'HISTORY.md', 'RELEASES.md'];
    for (const path of changelogPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasApiDocs(owner: string, repo: string): Promise<boolean> {
    const docPaths = ['docs/', 'documentation/', 'API.md', 'docs/api/'];
    for (const path of docPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }
}

export default DocumentationAnalyzer;
