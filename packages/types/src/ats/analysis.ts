/**
 * Represents keyword analysis results from ATS scanning
 * @interface ATSKeywordAnalysis
 */
export interface ATSKeywordAnalysis {
  /** Keywords found in the CV */
  found: string[];
  /** Required keywords missing from the CV */
  missing: string[];
  /** Overall relevance score based on keyword matches */
  relevanceScore: number;
  /** Keyword density analysis */
  density?: Record<string, number>;
  /** Context in which keywords appear */
  context?: Record<string, string[]>;
}

/**
 * Represents the overall analysis of a CV by ATS
 * @interface ATSAnalysis
 */
export interface ATSAnalysis {
  /** Overall ATS compatibility score */
  score: number;
  /** Keywords successfully matched */
  keywordMatches: string[];
  /** Required keywords not found */
  missingKeywords: string[];
  /** General suggestions for improvement */
  suggestions: string[];
  /** Issues related to CV formatting */
  formattingIssues: string[];
}
