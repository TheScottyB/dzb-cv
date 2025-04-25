import { CVData } from '../shared/types/cv-base.js';

export enum ATSIssueCategory {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ATSIssueType {
  // Critical issues
  MISSING_DATES = 'MISSING_DATES',
  INCORRECT_DATE_FORMAT = 'INCORRECT_DATE_FORMAT',
  INCOMPATIBLE_FILE_FORMAT = 'INCOMPATIBLE_FILE_FORMAT',
  SCANNED_DOCUMENT = 'SCANNED_DOCUMENT',

  // High-impact issues
  NONSTANDARD_HEADERS = 'NONSTANDARD_HEADERS',
  TABLE_LAYOUTS = 'TABLE_LAYOUTS',
  MULTICOLUMN_LAYOUT = 'MULTICOLUMN_LAYOUT',
  CONTACT_FORMAT = 'CONTACT_FORMAT',
  MISSING_KEYWORDS = 'MISSING_KEYWORDS',

  // Medium-impact issues
  COMPLEX_FORMATTING = 'COMPLEX_FORMATTING',
  SPECIAL_CHARS = 'SPECIAL_CHARS',
  FONT_ISSUES = 'FONT_ISSUES',
  GRAPHICS_CHARTS = 'GRAPHICS_CHARTS',
  HEADER_FOOTER_INFO = 'HEADER_FOOTER_INFO',

  // Low-impact issues
  EXCESSIVE_SPACING = 'EXCESSIVE_SPACING',
  UNNECESSARY_STYLING = 'UNNECESSARY_STYLING',
  INCONSISTENT_FORMATTING = 'INCONSISTENT_FORMATTING',
  FILE_SIZE_LARGE = 'FILE_SIZE_LARGE'
}

export interface ATSImprovement {
  type: string;
  score: number;
  message: string;
  fix: string;
  examples: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ATSAnalysisResult {
  score: number;
  issues: ATSIssue[];
  improvements: ATSImprovement[];
  keywords: {
    found: string[];
    missing: string[];
    relevanceScore: number;
  };
  parseRate: number; // Percentage of content successfully parsed
  sectionScores: {
    [key: string]: number;
  };
  recommendation: string;
}

export function analyzeATS(
  resumeText: string,
  fileInfo: { format: string; size: number },
  jobDescription?: string
): ATSAnalysisResult {
  return {
    score: 0,
    issues: [],
    improvements: [],
    keywords: { found: [], missing: [], relevanceScore: 0 },
    parseRate: 0,
    sectionScores: {},
    recommendation: "",
  };
}

export const ATS_SCORING = {
  BASE_SCORE: 100,
  CRITICAL: {
    MISSING_DATES: -8,
    INCORRECT_DATE_FORMAT: -9,
    INCOMPATIBLE_FILE_FORMAT: -10,
    SCANNED_DOCUMENT: -10
  },
  HIGH: {
    NONSTANDARD_HEADERS: -5,
    TABLE_LAYOUTS: -6,
    MULTICOLUMN_LAYOUT: -7,
    CONTACT_FORMAT: -5,
    MISSING_KEYWORDS: -7
  },
  MEDIUM: {
    COMPLEX_FORMATTING: -3,
    SPECIAL_CHARS: -3,
    FONT_ISSUES: -4,
    GRAPHICS_CHARTS: -4,
    HEADER_FOOTER_INFO: -3
  },
  LOW: {
    EXCESSIVE_SPACING: -2,
    UNNECESSARY_STYLING: -1,
    INCONSISTENT_FORMATTING: -2,
    FILE_SIZE_LARGE: -1
  },
  BONUSES: {
    KEYWORD_DENSITY: 5,
    STANDARD_FORMAT: 3,
    CONSISTENT_DATES: 2,
    PROPER_SECTION_HEADERS: 2
  }
} as const; 