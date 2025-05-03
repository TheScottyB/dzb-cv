import type { 
  CVData, 
  ATSImprovement,
  ATSAnalysisResult as BaseATSAnalysisResult 
} from '@dzb-cv/common';
import { ATSIssueType, ATSIssueCategory, ATS_SCORING, ATSIssue } from './scoring.js';

/**
 * Helper function to create an ATSIssue with proper category and impact
 */
function createIssue(
  type: ATSIssueType,
  category: ATSIssueCategory,
  impact: number,
  message: string,
  fix?: string,
  location?: string
): ATSIssue {
  return {
    type,
    category,
    message,
    impact,
    fix,
    location
  };
}

/**
 * Type definition for experience entry used in the analyzer
 */
interface ExperienceEntry {
  position: string;
  employer: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Extended ATSAnalysisResult interface with additional metrics
 */
interface ATSAnalysisResult extends BaseATSAnalysisResult {
  sectionScores: { [key: string]: number };
  parseRate: number;
  keywords: {
    found: string[];
    missing: string[];
    relevanceScore: number;
  };
  recommendation: string;
}

/**
 * Valid section headers in a CV
 */
type StandardSection = 
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'publications'
  | 'awards';

/**
 * Interface for section analysis results
 */
interface SectionAnalysis {
  issues: ATSIssue[];
  sectionScores: { [key: string]: number };
}

/**
 * Analyzer for ATS scoring and improvements
 */
export class ATSAnalyzer {
  // Standard sections that should be recognized
  private readonly standardSections: StandardSection[] = [
    'experience',
    'education',
    'skills',
    'certifications',
    'projects',
    'publications',
    'awards'
  ];

  // Date and formatting patterns
  private readonly datePatterns = {
    standard: /^(0[1-9]|1[0-2])\/\d{4}$/,
    yearOnly: /^\d{4}$/,
    textDate: /^[A-Za-z]+\s+\d{4}$/,
    present: /^(Present|Current)$/i
  };

  private readonly specialCharPattern = /[^\x20-\x7E]/g;
  private readonly tablePattern = /\|[\s-|]*\|/;
  private readonly complexFormattingPattern = /<[^>]+>|\{[^}]+\}|\[[^\]]+\]/g;

  /**
   * Common industry keywords to check for
   */
  private readonly commonKeywords = [
    'managed', 'led', 'developed', 'created', 'implemented',
    'analyzed', 'designed', 'coordinated', 'improved', 'increased',
    'reduced', 'supervised', 'trained', 'project', 'team',
    'leadership', 'results', 'successful', 'achievement', 'responsible'
  ];
  /**
   * Analyze CV data and content for ATS optimization
   */
  async analyze(cvData: CVData, content: string): Promise<ATSAnalysisResult> {
    const issues: ATSIssue[] = [];
    let score = ATS_SCORING.BASE_SCORE;
    const sectionScores: { [key: string]: number } = {};

    // Analyze dates
    const dateIssues = this.analyzeDates(cvData);
    issues.push(...dateIssues);

    // Analyze formatting
    const formattingIssues = this.analyzeFormatting(content);
    issues.push(...formattingIssues);

    // Analyze sections and their scores
    const sectionAnalysis = this.analyzeSections(content);
    issues.push(...sectionAnalysis.issues);
    Object.assign(sectionScores, sectionAnalysis.sectionScores);

    // Calculate score adjustments
    score += issues.reduce((total, issue) => total + issue.impact, 0);
    const bonusPoints = this.calculateBonuses(cvData, content);
    score += bonusPoints;

    // Calculate additional metrics
    const parseRate = this.calculateParseRate(content);
    const keywords = this.analyzeKeywords(content);
    const recommendation = this.generateRecommendation(score, issues);

    // Generate improvements
    const improvements: ATSImprovement[] = issues.map(issue => ({
      type: issue.type,
      score: issue.impact,
      message: issue.message,
      fix: issue.fix || '',
      examples: [],  // ATSIssue doesn't have examples, they come from the scoring system
      priority: this.getPriorityFromCategory(issue.category)
    }));

    return {
      score: Math.max(0, Math.min(100, score)),
      maxScore: ATS_SCORING.MAX_SCORE,
      issues,
      improvements,
      sectionScores,
      parseRate,
      keywords,
      recommendation
    };
  }

  /**
   * Analyze dates in CV data
   */
  private analyzeDates(cvData: CVData): ATSIssue[] {
    const issues: ATSIssue[] = [];

    cvData.experience?.forEach((exp, index) => {
      if (!exp.startDate) {
        issues.push(createIssue(
          ATSIssueType.MISSING_DATES,
          ATSIssueCategory.CRITICAL,
          ATS_SCORING.CRITICAL.MISSING_DATES,
          `Missing start date in experience entry ${index + 1}`,
          'Add start date in MM/YYYY format',
          `experience[${index}].startDate`
        ));
      } else if (!this.datePatterns.standard.test(exp.startDate)) {
        issues.push(createIssue(
          ATSIssueType.INCORRECT_DATE_FORMAT,
          ATSIssueCategory.CRITICAL,
          ATS_SCORING.CRITICAL.INCORRECT_DATE_FORMAT,
          `Invalid date format in experience entry ${index + 1}`,
          'Use MM/YYYY format for dates',
          `experience[${index}].startDate`
        ));
      }
    });

    return issues;
  }

  /**
   * Analyze formatting issues in CV content
   */
  private analyzeFormatting(content: string): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // Check for special characters
    const specialChars = content.match(this.specialCharPattern);
    if (specialChars) {
      issues.push(createIssue(
        ATSIssueType.SPECIAL_CHARS,
        ATSIssueCategory.MEDIUM,
        ATS_SCORING.MEDIUM.SPECIAL_CHARS,
        'Special characters detected',
        'Replace special characters with standard ASCII alternatives'
      ));
    }

    // Check for tables
    if (this.tablePattern.test(content)) {
      issues.push(createIssue(
        ATSIssueType.TABLE_LAYOUTS,
        ATSIssueCategory.HIGH,
        ATS_SCORING.HIGH.TABLE_LAYOUTS,
        'Table layout detected',
        'Convert tables to bullet points or paragraphs'
      ));
    }

    // Check for complex formatting
    const complexFormatting = content.match(this.complexFormattingPattern);
    if (complexFormatting) {
      issues.push(createIssue(
        ATSIssueType.COMPLEX_FORMATTING,
        ATSIssueCategory.MEDIUM,
        ATS_SCORING.MEDIUM.COMPLEX_FORMATTING,
        'Complex formatting detected that may confuse ATS systems',
        'Simplify formatting and use standard sections'
      ));
    }

    return issues;
  }

  /**
   * Analyze sections for ATS issues and calculate section-specific scores
   * @param content - The CV content to analyze
   * @returns Object containing issues found and scores for each section
   */
  private analyzeSections(content: string): SectionAnalysis {
    const issues: ATSIssue[] = [];
    const sectionScores: { [key: string]: number } = {};
    const sections = this.extractSections(content);

    // Check for non-standard section headers
    sections.forEach(section => {
      const normalizedHeader = section.header.toLowerCase();
      if (!this.standardSections.includes(normalizedHeader)) {
        issues.push(createIssue(
          ATSIssueType.NONSTANDARD_HEADERS,
          ATSIssueCategory.HIGH,
          ATS_SCORING.HIGH.NONSTANDARD_HEADERS,
          'Non-standard section headers detected',
          'Use standard section headers like "Experience", "Education", "Skills"'
        ));
      }

      // Score each section based on content quality
      sectionScores[normalizedHeader] = this.calculateSectionScore(section.content);
    });

    return { issues, sectionScores };
  }

  /**
   * Calculate bonus points for positive ATS features
   * @param cvData - The CV data object
   * @param content - The CV text content
   * @returns Total bonus points to add to the score
   */
  private calculateBonuses(cvData: CVData, content: string): number {
    let bonus = 0;

    // Check for consistent date formatting
    const hasConsistentDates = cvData.experience?.every((exp: ExperienceEntry) => 
      this.datePatterns.standard.test(exp.startDate || '') &&
      (!exp.endDate || this.datePatterns.standard.test(exp.endDate) || this.datePatterns.present.test(exp.endDate))
    );
    if (hasConsistentDates) {
      bonus += ATS_SCORING.BONUSES.CONSISTENT_DATES;
    }

    // Check for standard formatting
    if (!this.complexFormattingPattern.test(content)) {
      bonus += ATS_SCORING.BONUSES.STANDARD_FORMAT;
    }

    return bonus;
  }

  /**
   * Calculate the percentage of content that can be successfully parsed
   * @param content - The CV content to analyze
   * @returns A percentage between 0 and 100
   */
  private calculateParseRate(content: string): number {
    const totalLength = content.length;
    if (totalLength === 0) return 0;
    
    const matches = content.match(this.specialCharPattern);
    const unparseable = matches?.length ?? 0;
    
    // Ensure we don't return NaN or invalid percentages
    const parseRate = ((totalLength - unparseable) / totalLength) * 100;
    return Math.max(0, Math.min(100, Math.round(parseRate)));
  }

  /**
   * Analyze keyword relevance against industry terms
   * @param content - The CV content to analyze for keywords
   * @returns Object containing found keywords, missing keywords, and relevance score
   */
  private analyzeKeywords(content: string): {
    found: string[];
    missing: string[];
    relevanceScore: number;
  } {
    const normalizedContent = content.toLowerCase();
    const found = this.commonKeywords.filter(keyword => 
      normalizedContent.includes(keyword.toLowerCase())
    );
    
    const missing = this.commonKeywords.filter(keyword => 
      !normalizedContent.includes(keyword.toLowerCase())
    );

    // Calculate relevance score (0-100)
    const relevanceScore = Math.round((found.length / this.commonKeywords.length) * 100);

    return {
      found,
      missing,
      relevanceScore
    };
  }

  /**
   * Generate a human-readable recommendation based on the ATS score
   * @param score - The calculated ATS score
   * @param issues - The list of issues found during analysis
   * @returns A recommendation string
   */
  private generateRecommendation(score: number, issues: ATSIssue[]): string {
    if (score >= 90) {
      return 'Your resume is highly ATS-compatible. Minor improvements possible.';
    } else if (score >= 70) {
      return 'Good ATS compatibility. Address highlighted issues to improve parsing.';
    } else if (score >= 50) {
      return 'Moderate ATS compatibility. Several important issues need attention.';
    } else {
      return 'Low ATS compatibility. Major revisions recommended for better parsing.';
    }
  }


  /**
   * Extract sections from CV content using markdown headers or capitalized lines
   * @param content - The full CV content
   * @returns Array of sections with headers and content
   */
  private extractSections(content: string): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = [];
    
    // Match headers (# Header or ## Header or ### Header)
    const headerPattern = /^(#{1,3})\s+(.+?)(?:\n|\r\n?)([\s\S]*?)(?=^#{1,3}\s|\Z)/gm;
    let match;

    while ((match = headerPattern.exec(content)) !== null) {
      const [, , header = '', sectionContent = ''] = match;
      sections.push({
        header: header.trim(),
        content: sectionContent.trim()
      });
    }

    // If no sections found with markdown headers, try looking for capitalized lines
    if (sections.length === 0) {
      const lines = content.split(/\r?\n/);
      let currentSection: { header: string; content: string[] } | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check if line is a potential header (all caps, or first letter capitalized)
        if (trimmedLine === trimmedLine.toUpperCase() || /^[A-Z][a-z\s]*$/.test(trimmedLine)) {
          if (currentSection) {
            sections.push({
              header: currentSection.header,
              content: currentSection.content.join('\n')
            });
          }
          currentSection = {
            header: trimmedLine,
            content: []
          };
        } else if (currentSection && trimmedLine) {
          currentSection.content.push(trimmedLine);
        }
      }

      // Add the last section
      if (currentSection) {
        sections.push({
          header: currentSection.header,
          content: currentSection.content.join('\n')
        });
      }
    }

    return sections;
  }

  /**
   * Calculate score for an individual section based on content quality
   * @param content - The text content of the section
   * @returns A score between 0 and 100
   */
  private calculateSectionScore(content: string): number {
    let score = 100;
    
    // Check for formatting issues
    if (this.complexFormattingPattern.test(content)) {
      score -= 10;
    }
    
    // Check for special characters
    const specialChars = content.match(this.specialCharPattern);
    if (specialChars) {
      score -= 5 * Math.min(specialChars.length, 5); // Cap penalty at -25
    }
    
    // Check for tables
    if (this.tablePattern.test(content)) {
      score -= 15;
    }
    
    // Check for content length (too short or too long)
    const words = content.split(/\s+/).length;
    if (words < 10) {
      score -= 10; // Too short
    } else if (words > 500) {
      score -= 15; // Too long
    }
    
    // Check for bullet points consistency
    const bulletPoints = content.match(/^[•\-\*]\s/gm);
    if (bulletPoints) {
      const differentBullets = new Set(bulletPoints).size;
      if (differentBullets > 1) {
        score -= 5; // Inconsistent bullet points
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Get priority level from category
   */
  private getPriorityFromCategory(category: ATSIssueCategory): 'low' | 'medium' | 'high' | 'critical' {
    switch (category) {
      case ATSIssueCategory.CRITICAL:
        return 'critical';
      case ATSIssueCategory.HIGH:
        return 'high';
      case ATSIssueCategory.MEDIUM:
        return 'medium';
      case ATSIssueCategory.LOW:
        return 'low';
    }
  }
} 
