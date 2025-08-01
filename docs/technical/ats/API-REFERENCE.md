---
path: docs/technical/ats/API-REFERENCE.md
type: technical
category: ats-api
maintainer: system
last_updated: 2025-08-01
related_files:
  - packages/ats/src/analyzer/base-analyzer.ts
  - packages/ats/src/scoring/index.ts
  - packages/ats/src/taxonomies/skills.ts
  - packages/ats/src/engine/index.ts
---

# ATS API Reference

## Overview

This document provides comprehensive API documentation for all ATS system interfaces, classes, and methods introduced in the refactored architecture.

## Table of Contents

- [Core Interfaces](#core-interfaces)
- [Abstract Base Classes](#abstract-base-classes)
- [Analyzer Classes](#analyzer-classes)
- [Scoring System](#scoring-system)
- [Skill Matching](#skill-matching)
- [Engine Components](#engine-components)
- [Factory Functions](#factory-functions)

---

## Core Interfaces

### BaseAnalysisResult

The fundamental result interface returned by all CV analyzers.

```typescript
interface BaseAnalysisResult {
  /** Overall compatibility score (0-1) */
  score: number;
  
  /** Keywords successfully matched between CV and job posting */
  keywordMatches: string[];
  
  /** Required keywords missing from the CV */
  missingKeywords: string[];
  
  /** Actionable suggestions for improving CV match */
  suggestions: string[];
  
  /** Issues related to CV formatting that may affect ATS parsing */
  formattingIssues: string[];
}
```

### AnalyzerOptions

Configuration options for CV analyzers.

```typescript
interface AnalyzerOptions {
  /** Weight given to keyword matching (default: 0.5) */
  keywordWeight?: number;
  
  /** Weight given to experience matching (default: 0.3) */
  experienceWeight?: number;
  
  /** Weight given to education matching (default: 0.2) */
  educationWeight?: number;
  
  /** Enable TF-IDF analysis (default: false) */
  enableTfIdf?: boolean;
  
  /** Additional stop words to filter out (default: []) */
  customStopWords?: string[];
}
```

### ScoringCriteria

Weighting configuration for the scoring engine.

```typescript
interface ScoringCriteria {
  /** Weight for keyword matching (default: 0.3) */
  keywordWeight?: number;
  
  /** Weight for experience matching (default: 0.3) */
  experienceWeight?: number;
  
  /** Weight for education matching (default: 0.2) */
  educationWeight?: number;
  
  /** Weight for skills matching (default: 0.2) */
  skillsWeight?: number;
}
```

### ExtendedScoringCriteria

Enhanced scoring criteria with fuzzy matching support.

```typescript
interface ExtendedScoringCriteria extends ScoringCriteria {
  /** Fuzzy matching configuration */
  fuzzyMatch?: FuzzyMatchConfig;
}
```

### FuzzyMatchConfig

Configuration for fuzzy matching algorithms.

```typescript
interface FuzzyMatchConfig {
  /** Enable fuzzy matching (default: true) */
  enabled?: boolean;
  
  /** Minimum similarity score (0-1, default: 0.8) */
  threshold?: number;
}
```

### SectionScore

Detailed scoring information for a specific CV section.

```typescript
interface SectionScore {
  /** Normalized score for this section (0-1) */
  score: number;
  
  /** Successfully matched items */
  matches: string[];
  
  /** Missing required items */
  missing: string[];
  
  /** Specific suggestions for this section */
  suggestions: string[];
}
```

### CVScore

Comprehensive scoring result from the scoring engine.

```typescript
interface CVScore {
  /** Overall weighted score (0-1) */
  overall: number;
  
  /** Keyword matching results */
  keywords: SectionScore;
  
  /** Experience matching results */
  experience: SectionScore;
  
  /** Education matching results */
  education: SectionScore;
  
  /** Skills matching results */
  skills: SectionScore;
}
```

---

## Abstract Base Classes

### BaseCVAnalyzer

Abstract base class providing shared functionality for all CV analyzers.

```typescript
abstract class BaseCVAnalyzer {
  protected readonly stopWords: Set<string>;
  protected readonly options: Required<AnalyzerOptions>;

  constructor(options?: AnalyzerOptions);
  
  /** Main analysis method to be implemented by subclasses */
  public abstract analyze(cv: CVData, posting: JobPosting): BaseAnalysisResult;
  
  /** Validates input data and returns early result if invalid */
  protected validateInputs(cv: CVData, posting: JobPosting): BaseAnalysisResult | null;
  
  /** Extracts text content from a job posting */
  protected extractJobText(posting: JobPosting): string;
  
  /** Extracts text content from a CV */
  protected extractCVText(cv: CVData): string;
  
  /** Calculates overall score based on component scores */
  protected calculateOverallScore(
    keywordScore: number,
    experienceScore: number,
    educationScore: number
  ): number;
  
  /** Performs keyword matching between CV and job posting */
  protected performKeywordMatching(
    cvText: string,
    jobText: string
  ): { matches: string[]; missing: string[] };
  
  /** Calculates experience and education scores */
  protected calculateComponentScores(
    cv: CVData,
    posting: JobPosting
  ): { experienceScore: number; educationScore: number };
}
```

**Methods:**

#### `constructor(options?: AnalyzerOptions)`
Creates a new analyzer instance with optional configuration.

**Parameters:**
- `options` - Configuration options for the analyzer

#### `analyze(cv: CVData, posting: JobPosting): BaseAnalysisResult`
**Abstract method** that must be implemented by subclasses to perform CV analysis.

**Parameters:**
- `cv` - CV data to analyze
- `posting` - Job posting to compare against

**Returns:** Analysis result with score, matches, and suggestions

#### `validateInputs(cv: CVData, posting: JobPosting): BaseAnalysisResult | null`
**Protected method** that validates input data and handles edge cases.

**Returns:** Early result if inputs are invalid, null if validation passes

#### `performKeywordMatching(cvText: string, jobText: string)`
**Protected method** that performs keyword matching between texts.

**Returns:** Object with matched and missing keywords arrays

---

## Analyzer Classes

### CVAnalyzer (Classic)

Traditional keyword-based CV analyzer extending `BaseCVAnalyzer`.

```typescript
class CVAnalyzer extends BaseCVAnalyzer {
  constructor();
  
  public analyze(cv: CVData, posting: JobPosting): ATSAnalysis;
}
```

**Features:**
- Fast keyword-based analysis
- Simple scoring algorithm
- Suitable for most use cases
- Backward compatible with existing code

**Usage:**
```typescript
const analyzer = new CVAnalyzer();
const result = analyzer.analyze(cvData, jobPosting);
```

### TFIDFCVAnalyzer

Advanced TF-IDF-based CV analyzer for enhanced accuracy.

```typescript
class TFIDFCVAnalyzer extends BaseCVAnalyzer {
  constructor();
  
  public analyze(cv: CVData, posting: JobPosting): AnalysisResult;
}
```

**Features:**
- TF-IDF-based keyword weighting
- Natural language processing with tokenization
- Enhanced accuracy for complex documents
- Better handling of keyword importance

**Usage:**
```typescript
const analyzer = new TFIDFCVAnalyzer();
const result = analyzer.analyze(cvData, jobPosting);
```

**Backward Compatibility Exports:**
```typescript
// These exports maintain compatibility with existing code
export const CVAnalyzer = TFIDFCVAnalyzer;
export const createAnalyzer = createTFIDFAnalyzer;
```

---

## Scoring System

### ScoringEngine

Enhanced scoring engine with configurable weights and detailed analysis.

```typescript
class ScoringEngine {
  constructor(criteria?: ScoringCriteria);
  
  /** Score a CV against a job posting */
  public score(cv: CVData, posting: JobPosting): CVScore;
  
  private scoreKeywords(cv: CVData, posting: JobPosting): SectionScore;
  private scoreExperience(cv: CVData, posting: JobPosting): SectionScore;
  private scoreEducation(cv: CVData, posting: JobPosting): SectionScore;
  private scoreSkills(cv: CVData, posting: JobPosting): SectionScore;
}
```

**Methods:**

#### `constructor(criteria?: ScoringCriteria)`
Creates a scoring engine with optional custom weighting criteria.

#### `score(cv: CVData, posting: JobPosting): CVScore`
Performs comprehensive scoring analysis.

**Returns:** Detailed scoring results including overall score and section breakdowns

**Usage:**
```typescript
const scoringEngine = new ScoringEngine({
  keywordWeight: 0.4,
  skillsWeight: 0.3,
  experienceWeight: 0.2,
  educationWeight: 0.1
});

const score = scoringEngine.score(cvData, jobPosting);
console.log(`Overall Score: ${score.overall}`);
console.log(`Keywords: ${score.keywords.score}`);
```

---

## Skill Matching

### SkillDefinition

Interface defining a skill with metadata.

```typescript
interface SkillDefinition {
  /** Primary name of the skill */
  name: string;
  
  /** Alternative names/variations */
  aliases?: string[];
  
  /** Skill category */
  category: SkillCategory;
  
  /** Related skills */
  related?: string[];
}
```

### SkillMatcher

Enhanced skill matching system with fuzzy logic support.

```typescript
class SkillMatcher {
  constructor(
    skills?: SkillDefinition[], 
    fuzzyOptions?: FuzzyMatchOptions
  );
  
  /** Find a skill by name or alias */
  public findSkill(name: string): SkillDefinition | undefined;
  
  /** Get related skills for a given skill */
  public getRelatedSkills(name: string): SkillDefinition[];
  
  /** Find skills by category */
  public findByCategory(category: SkillCategory): SkillDefinition[];
  
  /** Check if two skills are related */
  public areRelated(skill1: string, skill2: string): boolean;
}
```

**Usage:**
```typescript
const skillMatcher = new SkillMatcher(AllSkills, {
  enabled: true,
  threshold: 0.8
});

const skill = skillMatcher.findSkill('JavaScript');
const relatedSkills = skillMatcher.getRelatedSkills('React');
```

---

## Engine Components

### ATSEngine

Main ATS engine coordinating analysis, scoring, and optimization.

```typescript
interface ATSOptions {
  /** Scoring criteria weights */
  scoring?: ScoringCriteria;
  
  /** Custom skill definitions */
  skills?: SkillDefinition[];
  
  /** Minimum required score (0-1) */
  minimumScore?: number;
}

interface ATSResult {
  /** Overall match score */
  score: number;
  
  /** Detailed analysis results */
  analysis: AnalysisResult;
  
  /** Section-by-section scoring */
  scoring: CVScore;
  
  /** Optimization suggestions */
  suggestions: string[];
  
  /** Missing skills with recommendations */
  missingSkills: {
    skill: string;
    alternatives?: SkillDefinition[];
  }[];
}

class ATSEngine {
  constructor(options?: ATSOptions);
  
  /** Analyze and score a CV against a job posting */
  public async analyze(cv: CVData, posting: JobPosting): Promise<ATSResult>;
  
  /** Check if a CV meets minimum requirements for a job */
  public meetsRequirements(cv: CVData, posting: JobPosting): boolean;
}
```

**Usage:**
```typescript
const atsEngine = createATSEngine({
  scoring: {
    keywordWeight: 0.4,
    skillsWeight: 0.3,
    experienceWeight: 0.2,
    educationWeight: 0.1
  },
  minimumScore: 0.7
});

const result = await atsEngine.analyze(cvData, jobPosting);
if (atsEngine.meetsRequirements(cvData, jobPosting)) {
  console.log('CV meets minimum requirements');
}
```

---

## Factory Functions

### createAnalyzer()

Creates a classic CV analyzer instance.

```typescript
function createAnalyzer(): CVAnalyzer;
```

### createTFIDFAnalyzer()

Creates a TF-IDF-based CV analyzer instance.

```typescript
function createTFIDFAnalyzer(): TFIDFCVAnalyzer;
```

### createScoringEngine()

Creates a scoring engine with optional criteria.

```typescript
function createScoringEngine(criteria?: ScoringCriteria): ScoringEngine;
```

### createSkillMatcher()

Creates a skill matcher with optional custom skills.

```typescript
function createSkillMatcher(skills?: SkillDefinition[]): SkillMatcher;
```

### createATSEngine()

Creates a complete ATS engine with optional configuration.

```typescript
function createATSEngine(options?: ATSOptions): ATSEngine;
```

---

## Type Exports

The ATS package exports all necessary types for TypeScript users:

```typescript
// Core interfaces
export type {
  BaseAnalysisResult,
  AnalyzerOptions,
  ScoringCriteria,
  ExtendedScoringCriteria,
  FuzzyMatchConfig,
  SectionScore,
  CVScore,
  ATSResult,
  ATSOptions
};

// Skill system types
export type {
  SkillDefinition,
  FuzzyMatchOptions
};

// Enums
export { SkillCategory, ProficiencyLevel };
```

---

## Migration from Previous Versions

### Backward Compatibility

All existing code continues to work without changes:

```typescript
// This still works exactly as before
import { CVAnalyzer, createAnalyzer } from '@dzb-cv/ats';

const analyzer = new CVAnalyzer();
const result = analyzer.analyze(cvData, jobPosting);
```

### Using New Features

To use new configuration options:

```typescript
// New way with configuration
import { CVAnalyzer } from '@dzb-cv/ats';

const analyzer = new CVAnalyzer({
  keywordWeight: 0.6,
  experienceWeight: 0.3,
  educationWeight: 0.1
});
```

---

**Related Documentation:**
- [ATS Overview](./README.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Migration Guide](./MIGRATION.md)
