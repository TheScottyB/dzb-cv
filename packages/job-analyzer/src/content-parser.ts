// Content Parser for Job Postings
// @version 1.0

import { JSDOM } from 'jsdom';
import { createError } from '@dzb-cv/errors';
import { SiteDetector } from './site-detector.js';
import type { JobSite, SiteParsingStrategy, ParsedJobContent, ParsingOptions } from './types.js';

export class ContentParser {
  private static skillKeywords = [
    // Technical Skills
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'api', 'rest', 'graphql', 'mongodb', 'postgresql', 'redis',
    'microservices', 'devops', 'ci/cd', 'jenkins', 'terraform', 'ansible',
    
    // Healthcare Skills
    'ekg', 'ecg', 'cardiac monitoring', 'patient care', 'medical terminology', 'hipaa',
    'electronic health records', 'ehr', 'medical coding', 'cpt', 'icd-10', 'nursing',
    'phlebotomy', 'vital signs', 'medical devices', 'x-ray', 'mri', 'ct scan',
    
    // Soft Skills
    'communication', 'leadership', 'teamwork', 'problem solving', 'analytical thinking',
    'project management', 'time management', 'customer service', 'attention to detail',
    'multitasking', 'organization', 'critical thinking', 'collaboration'
  ];

  /**
   * Parses job content from DOM using site-specific strategies
   */
  public static parseJobContent(
    dom: JSDOM,
    url: string,
    options: ParsingOptions = {}
  ): ParsedJobContent {
    const startTime = Date.now();
    const jobSite = SiteDetector.identifyJobSite(url);
    const strategy = SiteDetector.getStrategy(jobSite);
    const document = dom.window.document;

    try {
      // Apply preprocessing
      this.applyPreprocessing(document, strategy);

      // Extract basic information
      const title = this.extractText(document, strategy.selectors.title, 'Job Title');
      const company = this.extractText(document, strategy.selectors.company, 'Company');
      const location = this.extractText(document, strategy.selectors.location, 'Location');
      const description = this.extractText(document, strategy.selectors.description, 'Description');

      // Extract additional information
      const requirements = this.extractList(document, strategy.selectors.requirements);
      const qualifications = this.extractList(document, strategy.selectors.qualifications);
      const benefits = this.extractList(document, strategy.selectors.benefits);

      // Extract skills and keywords if requested
      const skills = options.extractSkills ? this.extractSkills(description + ' ' + requirements.join(' ')) : [];
      const keywords = options.extractKeywords ? this.extractKeywords(description + ' ' + requirements.join(' ')) : [];

      // Apply postprocessing
      const cleanedTitle = this.applyTitleCleanup(title, strategy);
      const cleanedDescription = this.applyDescriptionFilters(description, strategy);

      // Validate minimum requirements
      if (options.minDescriptionLength && cleanedDescription.length < options.minDescriptionLength) {
        throw createError.jobPostingParse(
          url,
          `Description too short: ${cleanedDescription.length} characters (minimum: ${options.minDescriptionLength})`
        );
      }

      const parseTime = Date.now() - startTime;

      return {
        title: cleanedTitle || 'Unknown Position',
        company: company || 'Unknown Company',
        location: location || 'Location Not Specified',
        description: cleanedDescription,
        requirements,
        qualifications,
        benefits,
        skills,
        keywords,
        metadata: {
          jobSite,
          url,
          extractedAt: new Date(),
          parseStrategy: options.strategy || 'default',
        },
      };

    } catch (error) {
      throw createError.jobPostingParse(
        url,
        `Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Applies preprocessing rules to clean up the document
   */
  private static applyPreprocessing(document: Document, strategy: SiteParsingStrategy): void {
    if (!strategy.preprocessing) return;

    // Remove unwanted elements
    if (strategy.preprocessing.removeElements) {
      for (const selector of strategy.preprocessing.removeElements) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      }
    }

    // Apply cleanup rules
    if (strategy.preprocessing.cleanupRules) {
      for (const selector of strategy.preprocessing.cleanupRules) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      }
    }
  }

  /**
   * Extracts text content using CSS selectors with fallbacks
   */
  private static extractText(document: Document, selectors: string, fieldName: string): string {
    const selectorList = selectors.split(',').map(s => s.trim());
    
    for (const selector of selectorList) {
      try {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      } catch (error) {
        console.warn(`Invalid selector for ${fieldName}: ${selector}`);
        continue;
      }
    }

    return '';
  }

  /**
   * Extracts list items from elements
   */
  private static extractList(document: Document, selectors?: string): string[] {
    if (!selectors) return [];

    const selectorList = selectors.split(',').map(s => s.trim());
    
    for (const selector of selectorList) {
      try {
        const container = document.querySelector(selector);
        if (!container) continue;

        // Check for list items
        const listItems = container.querySelectorAll('li');
        if (listItems.length > 0) {
          return Array.from(listItems)
            .map(item => item.textContent?.trim())
            .filter(text => text && text.length > 0) as string[];
        }

        // Check for paragraph-based lists
        const paragraphs = container.querySelectorAll('p');
        if (paragraphs.length > 0) {
          return Array.from(paragraphs)
            .map(p => p.textContent?.trim())
            .filter(text => text && text.length > 0) as string[];
        }

        // Split by common separators
        const text = container.textContent?.trim();
        if (text) {
          return text
            .split(/[\\n\\r•·–—]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
      } catch (error) {
        console.warn(`Error extracting list from selector: ${selector}`);
        continue;
      }
    }

    return [];
  }

  /**
   * Extracts skills from text content
   */
  private static extractSkills(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set<string>();

    for (const skill of this.skillKeywords) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }

    return Array.from(foundSkills);
  }

  /**
   * Extracts keywords from text content
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z\\s]/g, ' ')
      .split(/\\s+/)
      .filter(word => word.length > 3);

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Return top keywords by frequency
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Applies title cleanup rules
   */
  private static applyTitleCleanup(title: string, strategy: SiteParsingStrategy): string {
    if (!strategy.postprocessing?.titleCleanup) return title;

    let cleaned = title;
    for (const rule of strategy.postprocessing.titleCleanup) {
      cleaned = cleaned.replace(rule, '').trim();
    }

    return cleaned;
  }

  /**
   * Applies description filters
   */
  private static applyDescriptionFilters(description: string, strategy: SiteParsingStrategy): string {
    if (!strategy.postprocessing?.descriptionFilters) return description;

    let filtered = description;
    for (const rule of strategy.postprocessing.descriptionFilters) {
      filtered = filtered.replace(rule, '').trim();
    }

    return filtered;
  }

  /**
   * Validates parsed content quality
   */
  public static validateParsedContent(content: ParsedJobContent): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Check required fields
    if (!content.title || content.title === 'Unknown Position') {
      issues.push('Missing or invalid job title');
      score -= 25;
    }

    if (!content.company || content.company === 'Unknown Company') {
      issues.push('Missing or invalid company name');
      score -= 20;
    }

    if (!content.description || content.description.length < 50) {
      issues.push('Missing or too short job description');
      score -= 30;
    }

    if (!content.location || content.location === 'Location Not Specified') {
      issues.push('Missing job location');
      score -= 15;
    }

    // Check content quality
    if (content.requirements.length === 0 && content.qualifications.length === 0) {
      issues.push('No requirements or qualifications found');
      score -= 10;
    }

    return {
      isValid: score >= 60,
      score: Math.max(0, score),
      issues,
    };
  }
}