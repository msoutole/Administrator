# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Administrator** is an AI-powered CLI tool for analyzing GitHub repositories. It evaluates repository quality across multiple dimensions (code quality, documentation, testing, community, security, dependencies) and generates comprehensive reports.

## Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode for development
npm run validate     # Run full validation: lint → format:check → test:coverage → build
```

### Testing
```bash
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage (70% threshold required)
npm run test:watch        # Watch mode for tests
npm test -- path/to/test  # Run specific test file
```

### Code Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
```

### CLI Usage
```bash
# After building or in development
administrator analyze owner/repo
administrator batch --file repos.txt
administrator config --show
```

## Architecture

### Core Components

The codebase follows a modular, class-based architecture:

1. **RepositoryAnalyzer** (`src/analyzers/RepositoryAnalyzer.ts`)
   - Main orchestrator for repository analysis
   - Coordinates all other analyzers and scoring
   - Entry point for both CLI and programmatic API

2. **GitHubClient** (`src/utils/GitHubClient.ts`)
   - Wraps GitHub API interactions via Octokit
   - Handles authentication and rate limiting
   - Provides helper methods for common GitHub operations

3. **DocumentationAnalyzer** (`src/analyzers/DocumentationAnalyzer.ts`)
   - Evaluates repository documentation quality
   - Checks for README, CONTRIBUTING, LICENSE, etc.
   - Calculates documentation scores

4. **ScoringEngine** (`src/analyzers/ScoringEngine.ts`)
   - Calculates weighted quality scores
   - Converts metrics into 0-100 scores
   - Assigns letter grades (A-F) based on overall score
   - Uses configurable weights for different dimensions

5. **ReportGenerator** (`src/reporters/ReportGenerator.ts`)
   - Generates Markdown and JSON reports
   - Formats analysis results for output

6. **ConfigManager** (`src/config/ConfigManager.ts`)
   - Loads and validates configuration
   - Merges environment variables, config files, and defaults
   - Uses Zod for schema validation

### Data Flow

```
CLI/API → RepositoryAnalyzer → GitHubClient (fetch data)
                              ↓
                     DocumentationAnalyzer
                     (other analyzers...)
                              ↓
                        ScoringEngine
                              ↓
                        ReportGenerator
```

### Type System

All types are centralized in `src/types/index.ts`. Key interfaces:
- `Config`: Configuration structure with GitHub, analysis, scoring, output settings
- `AnalysisResult`: Complete analysis result with repository info, scores, metrics, timestamp
- `RepositoryMetrics`: Container for all metric categories
- `QualityScore`: Overall score, breakdown by dimension, grade, and recommendations

## Configuration

The tool uses a hierarchical configuration system:

1. **Environment Variables** (`.env` file)
   - `GITHUB_TOKEN`: Required for GitHub API access
   - `OPENAI_API_KEY`: For AI-powered analysis features
   - Optional: `MIN_QUALITY_SCORE`, `MAX_REPOS_PER_BATCH`, etc.

2. **Config File** (`administrator.config.json`)
   - JSON Schema validated configuration
   - Supports variable interpolation: `"${GITHUB_TOKEN}"`

3. **CLI Arguments**
   - Override config file and env vars
   - Example: `--format json --output ./reports`

Configuration is loaded in order: defaults → config file → env vars → CLI args (last wins).

## Testing Strategy

- **Framework**: Jest with ts-jest
- **Coverage Requirement**: 70% across branches, functions, lines, statements
- **Test Organization**:
  - Unit tests in `tests/unit/` mirror `src/` structure
  - Each component has dedicated test file
  - Uses mocks for external dependencies (GitHub API)
- **CI**: Runs on Node 16.x, 18.x, 20.x

## Code Conventions

### TypeScript
- Strict mode enabled
- Target: ES2020
- All exports must have explicit types
- Use interfaces over type aliases for objects
- Prefer `async/await` over raw promises

### Error Handling
- Throw descriptive errors with context
- Catch and wrap errors in analyzers with repository context
- CLI should catch all errors and provide user-friendly messages

### Module Structure
- One class per file
- File name matches class name
- Index files (`index.ts`) export public API only
- Utils and helpers go in `src/utils/`

## Common Patterns

### Adding a New Analyzer

1. Create analyzer class in `src/analyzers/`
2. Define metrics interface in `src/types/index.ts`
3. Integrate into `RepositoryAnalyzer.analyze()`
4. Update `ScoringEngine` to include new dimension
5. Add unit tests in `tests/unit/`

### Working with GitHub API

Always use `GitHubClient` methods rather than direct Octokit calls. This ensures:
- Consistent error handling
- Rate limit management
- Authentication handling

Example:
```typescript
// Good
const hasReadme = await this.githubClient.hasFile(owner, repo, 'README.md');

// Avoid
const response = await octokit.repos.getContent(...);
```

## Build Output

- Compiled JavaScript: `dist/`
- Type declarations: `dist/**/*.d.ts`
- Source maps included for debugging
- Entry points:
  - CLI: `dist/cli.js` (executable)
  - API: `dist/index.js` (main)
