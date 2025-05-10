/**
 * Represents a specific improvement suggestion from ATS analysis
 * @interface ATSImprovement
 */
export interface ATSImprovement {
  /** Type of improvement needed */
  type: string;
  /** Impact score of this improvement */
  score: number;
  /** Detailed explanation of the issue */
  message: string;
  /** Suggested fix */
  fix: string;
  /** Example implementations */
  examples?: string[];
  /** Priority level of the improvement */
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Represents the score and analysis of a specific CV section
 * @interface ATSSectionScore
 */
export interface ATSSectionScore {
  /** Section name */
  name: string;
  /** Section's ATS compatibility score */
  score: number;
  /** Issues found in the section */
  issues: string[];
  /** Suggestions for improving the section */
  suggestions: string[];
}

/**
 * Represents a complete ATS compatibility report
 * @interface ATSCompatibilityReport
 */
export interface ATSCompatibilityReport {
  /** Overall ATS compatibility score */
  overallScore: number;
  /** Individual section scores */
  sectionScores: ATSSectionScore[];
  /** Specific improvements suggested */
  improvements: ATSImprovement[];
  /** Keyword analysis results */
  keywordAnalysis: import('./analysis.js').ATSKeywordAnalysis;
  /** Success rate of parsing the CV */
  parseRate: number;
  /** Overall recommendation */
  recommendation: string;
}
