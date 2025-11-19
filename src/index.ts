/**
 * Main entry point for Administrator library
 */

export { RepositoryAnalyzer } from './analyzers/RepositoryAnalyzer';
export { DocumentationAnalyzer } from './analyzers/DocumentationAnalyzer';
export { ScoringEngine } from './analyzers/ScoringEngine';
export { AIAnalyzer } from './analyzers/AIAnalyzer';
export { ReportGenerator } from './reporters/ReportGenerator';
export { ConfigManager } from './config/ConfigManager';
export { GitHubClient } from './utils/GitHubClient';

// AI Provider exports
export * from './ai';

export * from './types';
export { configSchema } from './schemas/config-schema';
