import {
  ATSIssueType,
  ATSIssueCategory,
  ATSIssue,
  ATSAnalysisResult,
  ATS_SCORING,
} from './scoring.js';
import type { CVData } from '../core/types/cv-base.js';
import type { ATSImprovement } from '../core/types/ats-types.js';

export interface ExperienceEntry {
  startDate?: string;
  endDate?: string;
}

export class ATSAnalyzer {
  private readonly standardSections = [
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'projects',
    'publications',
    'awards',
  ];

  private readonly datePatterns = {
    standard: /^(0[1-9]|1[0-2])\/\d{4}$/,
    yearOnly: /^\d{4}$/,
    textDate: /^[A-Za-z]+\s+\d{4}$/,
    present: /^(Present|Current)$/i,
  };

  private readonly specialCharPattern = /[^\x20-\x7E]/g;
  private readonly tablePattern = /\|[\s-|]*\|/;
  private readonly complexFormattingPattern = /<[^>]+>|\{[^}]+\}|\[[^\]]+\]/g;

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

    // Analyze sections
    const sectionAnalysis = this.analyzeSections(content);
    issues.push(...sectionAnalysis.issues);
    Object.assign(sectionScores, sectionAnalysis.sectionScores);

    // Calculate final score
    score += issues.reduce((total, issue) => total + issue.score, 0);

    // Apply bonuses
    const bonuses = this.calculateBonuses(cvData, content);
    score += bonuses;

    // Generate improvements
    const improvements = issues.map((issue) => ({
      type: issue.type,
      score: issue.score,
      message: issue.message,
      fix: issue.fix,
      examples: issue.examples,
      priority: this.getPriorityFromCategory(issue.category),
    }));

    // Calculate parse rate
    const parseRate = this.calculateParseRate(content);

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      improvements,
      keywords: this.analyzeKeywords(content),
      parseRate,
      sectionScores,
      recommendation: this.generateRecommendation(score, issues),
    };
  }

  private analyzeDates(cvData: CVData): ATSIssue[] {
    const issues: ATSIssue[] = [];

    cvData.experience?.forEach((exp: ExperienceEntry, index: number) => {
      if (!exp.startDate) {
        issues.push({
          type: ATSIssueType.MISSING_DATES,
          category: ATSIssueCategory.CRITICAL,
          score: ATS_SCORING.CRITICAL.MISSING_DATES,
          message: `Missing start date in experience entry ${index + 1}`,
          fix: 'Add start date in MM/YYYY format',
          examples: ['01/2020', '05/2019'],
          location: `experience[${index}].startDate`,
        });
      } else if (!this.datePatterns.standard.test(exp.startDate)) {
        issues.push({
          type: ATSIssueType.INCORRECT_DATE_FORMAT,
          category: ATSIssueCategory.CRITICAL,
          score: ATS_SCORING.CRITICAL.INCORRECT_DATE_FORMAT,
          message: `Invalid date format in experience entry ${index + 1}`,
          fix: 'Use MM/YYYY format for dates',
          examples: ['01/2020', '05/2019'],
          detected: exp.startDate,
          location: `experience[${index}].startDate`,
        });
      }
    });

    return issues;
  }

  private analyzeFormatting(content: string): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // Check for special characters
    const specialChars = content.match(this.specialCharPattern);
    if (specialChars) {
      issues.push({
        type: ATSIssueType.SPECIAL_CHARS,
        category: ATSIssueCategory.MEDIUM,
        score: ATS_SCORING.MEDIUM.SPECIAL_CHARS,
        message: 'Special characters detected',
        fix: 'Replace special characters with standard ASCII alternatives',
        examples: ['• → *', '→ → ->', '© → (c)'],
        detected: specialChars.join(', '),
      });
    }

    // Check for tables
    if (this.tablePattern.test(content)) {
      issues.push({
        type: ATSIssueType.TABLE_LAYOUTS,
        category: ATSIssueCategory.HIGH,
        score: ATS_SCORING.HIGH.TABLE_LAYOUTS,
        message: 'Table layout detected',
        fix: 'Convert tables to bullet points or paragraphs',
        examples: ['• Skill 1\n• Skill 2', 'Achievement 1\nAchievement 2'],
      });
    }

    // Check for complex formatting
    const complexFormatting = content.match(this.complexFormattingPattern);
    if (complexFormatting) {
      issues.push({
        type: ATSIssueType.COMPLEX_FORMATTING,
        category: ATSIssueCategory.MEDIUM,
        score: ATS_SCORING.MEDIUM.COMPLEX_FORMATTING,
        message: 'Complex formatting detected',
        fix: 'Use simple text formatting without HTML or special markup',
        examples: ['Plain text with standard bullet points'],
        detected: complexFormatting.join(', '),
      });
    }

    return issues;
  }

  private analyzeSections(content: string): {
    issues: ATSIssue[];
    sectionScores: { [key: string]: number };
  } {
    const issues: ATSIssue[] = [];
    const sectionScores: { [key: string]: number } = {};
    const sections = this.extractSections(content);

    // Check for non-standard section headers
    sections.forEach((section) => {
      const normalizedHeader = section.header.toLowerCase();
      if (!this.standardSections.includes(normalizedHeader)) {
        issues.push({
          type: ATSIssueType.NONSTANDARD_HEADERS,
          category: ATSIssueCategory.HIGH,
          score: ATS_SCORING.HIGH.NONSTANDARD_HEADERS,
          message: `Non-standard section header: "${section.header}"`,
          fix: 'Use standard section headers',
          examples: this.standardSections,
          detected: section.header,
        });
      }

      // Score each section based on content quality
      sectionScores[normalizedHeader] = this.calculateSectionScore(section.content);
    });

    return { issues, sectionScores };
  }

  private calculateBonuses(cvData: CVData, content: string): number {
    let bonus = 0;

    // Check for consistent date formatting
    const hasConsistentDates = cvData.experience?.every(
      (exp: ExperienceEntry) =>
        this.datePatterns.standard.test(exp.startDate || '') &&
        (!exp.endDate ||
          this.datePatterns.standard.test(exp.endDate) ||
          this.datePatterns.present.test(exp.endDate))
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

  private calculateParseRate(content: string): number {
    // Calculate percentage of content that can be successfully parsed
    const totalLength = content.length;
    const unparseable = content.match(this.specialCharPattern)?.length || 0;
    return Math.round(((totalLength - unparseable) / totalLength) * 100);
  }

  private analyzeKeywords(content: string): {
    found: string[];
    missing: string[];
    relevanceScore: number;
  } {
    // Implement keyword analysis logic here
    return {
      found: [],
      missing: [],
      relevanceScore: 0,
    };
  }

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

  private getPriorityFromCategory(
    category: ATSIssueCategory
  ): 'critical' | 'high' | 'medium' | 'low' {
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

  private extractSections(content: string): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = [];

    // Match headers (# Header or ## Header or ### Header)
    const headerPattern = /^(#{1,3})\s+(.+?)(?:\n|\r\n?)([\s\S]*?)(?=^#{1,3}\s|\Z)/gm;
    let match;

    while ((match = headerPattern.exec(content)) !== null) {
      const [, , header = '', sectionContent = ''] = match;
      sections.push({
        header: header.trim(),
        content: sectionContent.trim(),
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
              content: currentSection.content.join('\n'),
            });
          }
          currentSection = {
            header: trimmedLine,
            content: [],
          };
        } else if (currentSection && trimmedLine) {
          currentSection.content.push(trimmedLine);
        }
      }

      // Add the last section
      if (currentSection) {
        sections.push({
          header: currentSection.header,
          content: currentSection.content.join('\n'),
        });
      }
    }

    return sections;
  }

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
    const differentBullets = new Set(bulletPoints).size;
    if (bulletPoints && differentBullets > 1) {
      score -= 5; // Inconsistent bullet points
    }

    return Math.max(0, Math.min(100, score));
  }
}
