/**
 * Types and interfaces for ATS validation
 */
export enum ATSIssueType {
  INCOMPATIBLE_FILE_FORMAT = 'INCOMPATIBLE_FILE_FORMAT',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  FILE_SIZE_LARGE = 'FILE_SIZE_LARGE',
  SPECIAL_CHARACTERS = 'SPECIAL_CHARACTERS',
  SPECIAL_CHARS = 'SPECIAL_CHARS',
  UNSUPPORTED_FONT = 'UNSUPPORTED_FONT',
  MISSING_SECTION = 'MISSING_SECTION',
  INSUFFICIENT_CONTENT = 'INSUFFICIENT_CONTENT',
  PROBLEMATIC_DATE_FORMAT = 'PROBLEMATIC_DATE_FORMAT',
  NONSTANDARD_HEADER = 'NONSTANDARD_HEADER',
  MISSING_CONTACT_INFO = 'MISSING_CONTACT_INFO',
  INVALID_CONTACT_FORMAT = 'INVALID_CONTACT_FORMAT',
  TABLE_LAYOUTS = 'TABLE_LAYOUTS',
  MULTICOLUMN_LAYOUT = 'MULTICOLUMN_LAYOUT'
}

export enum ATSIssueCategory {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  WARNING = 'WARNING',
  SUGGESTION = 'SUGGESTION'
}

export interface ATSIssue {
  type: ATSIssueType;
  category: ATSIssueCategory;
  score: number;
  message: string;
  fix: string;
  examples: string[];
  detected?: string | undefined;
}

export interface ATSImprovement {
  type: ATSIssueType;
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
  parseRate: number;
  sectionScores: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  recommendation: string;
}

/**
 * Scoring constants for ATS validation
 */
export const ATS_SCORING = {
  BASE_SCORE: 100,
  CRITICAL: {
    INCOMPATIBLE_FILE_FORMAT: -25,
    FILE_SIZE_EXCEEDED: -15,
    MISSING_CONTACT_INFO: -20
  },
  HIGH: {
    TABLE_LAYOUTS: -20,
    MULTICOLUMN_LAYOUT: -15
  },
  MEDIUM: {
    SPECIAL_CHARS: -10
  },
  LOW: {
    FILE_SIZE_LARGE: -5
  },
  WARNING: {
    SPECIAL_CHARACTERS: -5,
    UNSUPPORTED_FONT: -5,
    PROBLEMATIC_DATE_FORMAT: -8
  },
  SUGGESTION: {
    NONSTANDARD_HEADER: -2,
    INSUFFICIENT_CONTENT: -3
  }
} as const;

/**
 * Validation rules for ATS parsing with enhanced regex patterns
 */
export const ATS_VALIDATION_RULES = {
  DATE_FORMAT: {
    SLASH_MM_YYYY: /^(0[1-9]|1[0-2])\/\d{4}$/, // MM/YYYY (e.g., 01/2023)
    MONTH_YYYY: /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/, // Month YYYY
    DASH_MM_YYYY: /^(0[1-9]|1[0-2])-\d{4}$/, // MM-YYYY (e.g., 01-2023)
    PROBLEMATIC: [
      /^(Spring|Summer|Fall|Winter)\s\d{4}$/,  // Season YYYY
      /^Q[1-4]\s\d{4}$/,                       // Q1 YYYY
      /^Early\s\d{4}$/,                        // Early YYYY
      /^Late\s\d{4}$/,                         // Late YYYY
      /^\d{4}$/                                // YYYY only (missing month)
    ]
  },

  SECTION_HEADERS: [
    'Experience', 'Work Experience', 'Professional Experience', 'Employment History',
    'Education', 'Academic Background', 'Educational Background',
    'Skills', 'Technical Skills', 'Core Competencies', 'Key Skills',
    'Summary', 'Professional Summary', 'Profile', 'Executive Summary',
    'Certifications', 'Professional Certifications', 'Licenses',
    'Projects', 'Relevant Projects', 'Key Projects',
    'Languages', 'Language Proficiency',
    'Volunteer Experience', 'Community Service',
    'Publications', 'Research', 'Patents',
    'Awards', 'Honors', 'Achievements',
    'Professional Affiliations', 'Memberships'
  ],

  NONSTANDARD_HEADERS: [
    'My Journey', 'Career Path', 'Where I\'ve Been',
    'Brain Power', 'What I Know', 'My Expertise',
    'About Me', 'Personal Brand', 'Who I Am',
    'My Story', 'Career Highlights', 'Professional Journey',
    'Toolbox', 'Things I\'m Good At', 'Super Powers',
    'Learning Journey', 'Knowledge Base'
  ],

  CONTACT_FORMAT: {
    required: ['phone', 'email', 'location'],
    format: {
      phone: /^\+?[\d\s\-()]{10,20}$/,
      email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]{5,30}\/?$/
    }
  },

  ACCEPTABLE_FONTS: [
    'Arial', 'Calibri', 'Garamond', 'Georgia',
    'Helvetica', 'Times New Roman', 'Trebuchet MS',
    'Verdana', 'Tahoma', 'Century Gothic'
  ],

  ALLOWED_CHARS: /^[\x20-\x7E]+$/, // Printable ASCII only

  PROBLEMATIC_CHARS: [
    '•', '◦', '‣', '⁃', '→', '⇒', '★', '☆', '✓', '✔',
    '✗', '✘', '⚫', '⬤', '❖', '❑', '❒', '⦿', '⊙', '◆',
    '◇', '♦', '♢', '❤', '↑', '↓', '←', '→', '≈', '≥',
    '≤', '≠', '©', '®', '™', '±', '∞', '∑', '√', '∫',
    '∏', '⌘', '⌥', '⇧', '⌃', '⎋', '⌫', '⌦', '⏎', '⎮'
  ],

  FILE_FORMATS: {
    RECOMMENDED: ['docx', 'pdf'] as const,
    PROBLEMATIC: ['jpg', 'png', 'bmp', 'gif', 'tiff', 'psd', 'ai', 'indd', 'epub'] as const
  },

  SECTION_MIN_WORD_COUNT: {
    summary: 40,
    experience: 200,
    education: 30,
    skills: 50
  },

  MAX_FILE_SIZE: 1024 // KB (1MB)
} as const;

/**
 * Calculates the overall ATS compatibility score
 */
export function calculateATSScore(
  issues: ATSIssue[],
  bonuses: { type: string; score: number }[] = []
): number {
  const baseScore = ATS_SCORING.BASE_SCORE;
  const totalPenalty = issues.reduce((sum, issue) => sum + issue.score, 0);
  const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.score, 0);

  return Math.max(0, Math.min(100, baseScore + totalPenalty + totalBonus));
}

/**
 * Analyzes keyword matching between resume and job description
 */
export function analyzeKeywords(resumeText: string, jobDescription: string): {
  found: string[];
  missing: string[];
  relevanceScore: number;
} {
  // Convert texts to lowercase for case-insensitive matching
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Extract unique words from job description (excluding common words)
  const jobWords = new Set((jobLower.match(/\b\w+\b/g) || []).filter(Boolean));
  const commonWords = new Set(['and', 'the', 'or', 'in', 'at', 'to', 'for', 'a', 'an', 'of', 'with']);
  
  const keywordMatches = {
    found: [] as string[],
    missing: [] as string[],
    relevanceScore: 0
  };

  // Check each job keyword against resume
  Array.from(jobWords).forEach(word => {
    if (word && !commonWords.has(word)) {
      if (resumeLower.includes(word)) {
        keywordMatches.found.push(word);
      } else {
        keywordMatches.missing.push(word);
      }
    }
  });

  // Calculate relevance score (0-100)
  const totalKeywords = keywordMatches.found.length + keywordMatches.missing.length;
  keywordMatches.relevanceScore = totalKeywords > 0
    ? Math.round((keywordMatches.found.length / totalKeywords) * 100)
    : 0;

  return keywordMatches;
}

/**
 * Detects ATS parsing issues in the resume
 */
export function detectATSIssues(
  resumeText: string,
  fileInfo: { format: string; size: number },
  jobDescription?: string
): ATSIssue[] {
  const issues: ATSIssue[] = [];

  // File format validation
  if (!ATS_VALIDATION_RULES.FILE_FORMATS.RECOMMENDED.includes(fileInfo.format as 'docx' | 'pdf')) {
    issues.push({
      type: ATSIssueType.INCOMPATIBLE_FILE_FORMAT,
      category: ATSIssueCategory.CRITICAL,
      score: ATS_SCORING.CRITICAL.INCOMPATIBLE_FILE_FORMAT,
      message: `The file format .${fileInfo.format} may not be compatible with some ATS systems.`,
      fix: 'Convert your resume to a standard .docx or .pdf format.',
      examples: ['Resume saved as an image or non-standard format', 'Scanned paper resume']
    });
  }

  // File size validation (MB)
  if (fileInfo.size > ATS_VALIDATION_RULES.MAX_FILE_SIZE) {
    issues.push({
      type: ATSIssueType.FILE_SIZE_LARGE,
      category: ATSIssueCategory.LOW,
      score: ATS_SCORING.LOW.FILE_SIZE_LARGE,
      message: `The file size (${Math.round(fileInfo.size / 1024)}MB) exceeds recommended limits.`,
      fix: 'Reduce file size by optimizing images or removing unnecessary elements.',
      examples: ['Resume with high-resolution images', 'Document with embedded fonts']
    });
  }

  // Table layout detection
  if (resumeText.includes('<table') || resumeText.includes('<tr') || resumeText.includes('<td')) {
    issues.push({
      type: ATSIssueType.TABLE_LAYOUTS,
      category: ATSIssueCategory.HIGH,
      score: ATS_SCORING.HIGH.TABLE_LAYOUTS,
      message: 'Tables detected in resume, which may cause parsing issues.',
      fix: 'Replace tables with simple formatting using line breaks and spacing.',
      examples: ['Skills matrix in table format', 'Experience details in table cells']
    });
  }

  // Multi-column layout detection
  if (resumeText.includes('<div class="column') || resumeText.includes('<div class="col-')) {
    issues.push({
      type: ATSIssueType.MULTICOLUMN_LAYOUT,
      category: ATSIssueCategory.HIGH,
      score: ATS_SCORING.HIGH.MULTICOLUMN_LAYOUT,
      message: 'Multi-column layout detected, which may disrupt ATS parsing sequence.',
      fix: 'Use a single-column layout for better ATS compatibility.',
      examples: ['Two-column resume with skills in sidebar', 'Three-column header section']
    });
  }

  // Special characters check
  const specialCharsFound = ATS_VALIDATION_RULES.PROBLEMATIC_CHARS.filter(char => 
    resumeText.includes(char)
  );

  if (specialCharsFound.length > 0) {
    issues.push({
      type: ATSIssueType.SPECIAL_CHARS,
      category: ATSIssueCategory.MEDIUM,
      score: ATS_SCORING.MEDIUM.SPECIAL_CHARS,
      message: `Found problematic special characters: ${specialCharsFound.join(' ')}`,
      fix: 'Replace special characters with standard alternatives (-, *, •).',
      examples: ['Replace "•" with "-" for bullet points', 'Use "to" instead of "→"'],
      detected: specialCharsFound[0]
    });
  }

  // Date format validation
  const dateMatches = resumeText.match(/\b\w+\s+\d{4}\b|\d{2}[-/]\d{4}\b|\d{4}\b/g) || [];
  for (const date of dateMatches) {
    const isProblematic = ATS_VALIDATION_RULES.DATE_FORMAT.PROBLEMATIC.some(pattern => 
      pattern.test(date)
    );
    
    if (isProblematic) {
      issues.push({
        type: ATSIssueType.PROBLEMATIC_DATE_FORMAT,
        category: ATSIssueCategory.WARNING,
        score: ATS_SCORING.WARNING.PROBLEMATIC_DATE_FORMAT,
        message: `Found problematic date format: "${date}"`,
        fix: 'Use standard date formats (MM/YYYY or Month YYYY).',
        examples: ['Use "06/2023" instead of "Summer 2023"', 'Use "January 2023" instead of "Early 2023"']
      });
    }
  }

  // Section content validation
  Object.entries(ATS_VALIDATION_RULES.SECTION_MIN_WORD_COUNT).forEach(([section, minCount]) => {
    const sectionContent = extractSectionContent(resumeText, section);
    if (sectionContent && countWords(sectionContent) < minCount) {
      issues.push({
        type: ATSIssueType.INSUFFICIENT_CONTENT,
        category: ATSIssueCategory.SUGGESTION,
        score: ATS_SCORING.SUGGESTION.INSUFFICIENT_CONTENT,
        message: `The ${section} section may need more content (minimum ${minCount} words recommended).`,
        fix: `Expand the ${section} section with more detailed information.`,
        examples: ['Add more specific achievements', 'Include relevant technical details']
      });
    }
  });

  return issues;
}

/**
 * Generates actionable improvement suggestions based on detected issues
 */
export function generateATSImprovements(issues: ATSIssue[]): ATSImprovement[] {
  return issues.map(issue => ({
    type: issue.type,
    score: Math.abs(issue.score),
    message: issue.message,
    fix: issue.fix,
    examples: issue.examples,
    priority: getPriorityFromCategory(issue.category)
  }));
}

/**
 * Maps issue category to improvement priority
 */
function getPriorityFromCategory(category: ATSIssueCategory): 'critical' | 'high' | 'medium' | 'low' {
  switch (category) {
    case ATSIssueCategory.CRITICAL: return 'critical';
    case ATSIssueCategory.HIGH: return 'high';
    case ATSIssueCategory.MEDIUM: return 'medium';
    case ATSIssueCategory.LOW: return 'low';
    case ATSIssueCategory.WARNING: return 'medium';
    case ATSIssueCategory.SUGGESTION: return 'low';
    default: return 'medium';
  }
}

/**
 * Full ATS analysis of a resume
 */
export function analyzeATS(
  resumeText: string,
  fileInfo: { format: string; size: number },
  jobDescription?: string
): ATSAnalysisResult {
  const issues = detectATSIssues(resumeText, fileInfo, jobDescription);
  const improvements = generateATSImprovements(issues);
  const keywords = jobDescription
    ? analyzeKeywords(resumeText, jobDescription)
    : { found: [], missing: [], relevanceScore: 0 };

  const sectionScores = {
    contact: 90,
    summary: 85,
    experience: 75,
    education: 80,
    skills: 85
  };

  const parseRate = 95; // Placeholder parse success rate
  const score = calculateATSScore(issues);

  const recommendation =
    score >= 90 ? 'Your resume is highly ATS-compatible. Focus on tailoring content to specific job descriptions.' :
    score >= 70 ? 'Your resume is generally ATS-compatible but has some issues that could be improved.' :
    score >= 50 ? 'Your resume has several ATS compatibility issues that should be addressed before applying.' :
    'Your resume has critical ATS compatibility issues that need immediate attention.';

  return {
    score,
    issues,
    improvements,
    keywords,
    parseRate,
    sectionScores,
    recommendation
  };
}

// Helper functions
function countWords(text: string): number {
  return (text.match(/\b\w+\b/g) || []).length;
}

function extractSectionContent(text: string, sectionName: string): string | null {
  // Simple section extraction - could be enhanced with more sophisticated parsing
  const regex = new RegExp(`(?:${sectionName}:?)([\\s\\S]*?)(?=\\n\\s*\\w+:|$)`, 'i');
  const match = text.match(regex);
  return match?.[1]?.trim() || null;
} 