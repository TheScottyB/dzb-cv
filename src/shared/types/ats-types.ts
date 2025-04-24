/**
 * ATS analysis result
 */
export interface ATSAnalysis {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  formattingIssues: string[];
}

/**
 * ATS compatibility improvement suggestion
 */
export interface ATSImprovement {
  type: string;
  score: number;
  message: string;
  fix: string;
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
