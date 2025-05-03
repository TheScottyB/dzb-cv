export interface ATSImprovement {
  type: string;
  score: number;
  message: string;
  fix: string;
  examples?: string[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface ATSAnalysis {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  formattingIssues: string[];
}

export interface ATSKeywordAnalysis {
  found: string[];
  missing: string[];
  relevanceScore: number;
  density?: {
    [keyword: string]: number;
  };
  context?: {
    [keyword: string]: string[];
  };
}

export interface ATSSectionScore {
  name: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

/**
 * ATS compatibility score breakdown
 */
export interface ATSScore {
  total: number;
  categories: {
    formatting: number;
    content: number;
    structure: number;
    metadata: number;
  };
}
export interface ATSCompatibilityReport {
  overallScore: number;
  sectionScores: ATSSectionScore[];
  improvements: ATSImprovement[];
  keywordAnalysis: ATSKeywordAnalysis;
  parseRate: number;
  recommendation: string;
} 