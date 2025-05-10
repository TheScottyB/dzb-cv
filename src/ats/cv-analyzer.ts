import type { CVData } from '../core/types/cv-base';

/**
 * Job Posting interface representing job requirements and details
 */
export interface JobPosting {
  title?: string;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  experienceLevel?: string;
  educationRequirements?: string[];
}

/**
 * ATS Analysis result interface
 */
export interface ATSAnalysis {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  formattingIssues: string[];
}

/**
 * CV Analyzer configuration options
 */
export interface CVAnalyzerConfig {
  weights?: {
    keywords: number;
    experience: number;
    education: number;
  };
  minScore?: number;
  maxScore?: number;
}

/**
 * CVAnalyzer for analyzing resumes against job postings
 */
export class CVAnalyzer {
  private stopWords: Set<string>;
  private weights: {
    keywords: number;
    experience: number;
    education: number;
  };

  constructor(config?: CVAnalyzerConfig) {
    // Common English stop words
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'to', 'of', 'for', 'with', 'by', 'about', 'against', 'between', 'into',
      'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
      'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should',
      'now'
    ]);

    // Default weights for scoring different categories
    this.weights = config?.weights || {
      keywords: 0.5,
      experience: 0.3,
      education: 0.2
    };
  }

  /**
   * Analyze a CV against a job posting
   * @param cv The CV data to analyze
   * @param posting The job posting to analyze against
   * @returns ATS analysis result
   */
  public analyze(cv: CVData, posting: JobPosting): ATSAnalysis {
    // Handle empty CV
    if (!cv || (!cv.experience?.length && !cv.education?.length && !cv.skills?.length)) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: posting ? Array.from(new Set(this.extractKeywords(this.extractJobText(posting)))) : [],
        suggestions: ["CV is empty or missing critical sections."],
        formattingIssues: []
      };
    }

    // Handle empty posting
    if (!posting || (!posting.description && !posting.responsibilities?.length && !posting.qualifications?.length && !posting.skills?.length)) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: posting ? ["The job posting is empty. Add job details for analysis."] : [],
        formattingIssues: []
      };
    }

    // Extract CV and job posting text
    const cvText = this.extractCVText(cv);
    const jobText = this.extractJobText(posting);

    // Extract and compare keywords
    const jobKeywords = this.extractKeywords(jobText);
    const cvKeywords = this.extractKeywords(cvText);
    
    // Find matches and missing keywords
    const keywordMatches = this.findMatches(cvKeywords, jobKeywords);
    const missingKeywords = this.findMissingKeywords(cvKeywords, jobKeywords);
    
    // Calculate scores
    const keywordScore = keywordMatches.length / (jobKeywords.length || 1);
    const experienceScore = this.calculateExperienceScore(cv, posting);
    const educationScore = this.calculateEducationScore(cv, posting);
    
    // Calculate final score
    const score = this.calculateScore(keywordScore, experienceScore, educationScore);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(cv, posting, missingKeywords);
    
    // Format issues
    const formattingIssues = this.detectFormattingIssues(cv);
    
    return {
      score,
      keywordMatches,
      missingKeywords,
      suggestions,
      formattingIssues
    };
  }

  /**
   * Extract text from CV data
   * @param cv CV data
   * @returns Concatenated CV text
   */
  private extractCVText(cv: CVData): string {
    if (!cv) return '';
    
    const parts: string[] = [];
    
    // Add personal info
    if (cv.personalInfo) {
      if (cv.personalInfo.summary) {
        parts.push(cv.personalInfo.summary);
      }
      if (cv.personalInfo.professionalTitle) {
        parts.push(cv.personalInfo.professionalTitle);
      }
    }
    
    // Add experience
    if (cv.experience?.length) {
      cv.experience.forEach(exp => {
        parts.push(exp.position);
        if (exp.responsibilities?.length) {
          parts.push(exp.responsibilities.join(' '));
        }
        if (exp.achievements?.length) {
          parts.push(exp.achievements.join(' '));
        }
      });
    }
    
    // Add skills
    if (cv.skills?.length) {
      parts.push(cv.skills.map(skill => skill.name).join(' '));
    }
    
    // Add education
    if (cv.education?.length) {
      cv.education.forEach(edu => {
        parts.push(edu.degree);
        parts.push(edu.field);
        parts.push(edu.institution);
      });
    }
    
    return parts.join(' ');
  }

  /**
   * Extract text from job posting
   * @param posting Job posting data
   * @returns Concatenated job posting text
   */
  private extractJobText(posting: JobPosting): string {
    if (!posting) return '';
    
    const parts: string[] = [];
    
    if (posting.description) {
      parts.push(posting.description);
    }
    
    if (posting.responsibilities?.length) {
      parts.push(posting.responsibilities.join(' '));
    }
    
    if (posting.qualifications?.length) {
      parts.push(posting.qualifications.join(' '));
    }
    
    if (posting.skills?.length) {
      parts.push(posting.skills.join(' '));
    }
    
    return parts.join(' ');
  }

  /**
   * Extract keywords from text
   * @param text Text to extract keywords from
   * @returns Array of extracted keywords
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    // Technical terms regex patterns with word boundaries
    const techTermsRegex = /\b(React|TypeScript|JavaScript|Vue\.js|Angular|Node\.js|Next\.js|HTML5|CSS3|jQuery|Express\.js|MongoDB|SQL|AWS|Azure|Docker|Kubernetes|Git|Jest|Webpack|Babel|Gulp|Grunt|Redux|Vuex|GraphQL|REST|API|JSON|XML|SASS|SCSS|LESS|Tailwind|Bootstrap|Material-UI|Storybook|Cypress|Selenium|Jenkins|Travis|CircleCI|Github Actions)\b/gi;

    // Process case variations
    const casedTechTerms: Record<string, string> = {
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'react': 'React',
      'node.js': 'Node.js',
      'next.js': 'Next.js',
      'vue.js': 'Vue.js',
      'jest': 'Jest',
      'webpack': 'Webpack',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes'
    };

    const keywords = new Set<string>();
    
    // Extract technical terms with correct casing
    let match;
    while ((match = techTermsRegex.exec(text)) !== null) {
      const term = match[0].toLowerCase();
      keywords.add(casedTechTerms[term] || match[0]);
    }

    // Split text and process regular words
    const words = text.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      if (cleanWord.length < 3 || this.stopWords.has(cleanWord)) {
        continue;
      }
      keywords.add(word);
    }

    return Array.from(keywords);
  }

  /**
   * Find matching keywords between CV and job posting
   * @param cvKeywords Keywords from CV
   * @param jobKeywords Keywords from job posting
   * @returns Array of matching keywords
   */
  private findMatches(cvKeywords: string[], jobKeywords: string[]): string[] {
    const matches: string[] = [];
    const cvLowerKeywords = cvKeywords.map(kw => kw.toLowerCase());
    
    for (const keyword of jobKeywords) {
      const kwLower = keyword.toLowerCase();
      if (cvLowerKeywords.includes(kwLower)) {
        matches.push(keyword);
      }
    }
    
    return matches;
  }

  /**
   * Find keywords from job posting that are missing in the CV
   * @param cvKeywords Keywords from CV
   * @param jobKeywords Keywords from job posting
   * @returns Array of missing keywords
   */
  private findMissingKeywords(cvKeywords: string[], jobKeywords: string[]): string[] {
    const missing: string[] = [];
    const cvLowerKeywords = cvKeywords.map(kw => kw.toLowerCase());
    
    for (const keyword of jobKeywords) {
      const kwLower = keyword.toLowerCase();
      if (!cvLowerKeywords.includes(kwLower)) {
        missing.push(keyword);
      }
    }
    
    return missing;
  }

  /**
   * Calculate experience score based on matching experience requirements
   * @param cv CV data
   * @param posting Job posting data
   * @returns Experience match score (0-1)
   */
  private calculateExperienceScore(cv: CVData, posting: JobPosting): number {
    if (!cv.experience?.length) return 0;
    if (!posting.experienceLevel) return 0.5; // Default middle score if no requirements
    
    const experienceYears = this.extractExperienceYears(cv);
    const requiredYears = this.extractRequiredYears(posting);
    
    if (requiredYears === 0) return 1; // No specific year requirement
    
    if (experienceYears >= requiredYears) {
      return 1;
    } else if (experienceYears >= requiredYears * 0.75) {
      return 0.75;
    } else if (experienceYears >= requiredYears * 0.5) {
      return 0.5;
    } else {
      return 0.25;
    }
  }

  /**
   * Extract total years of experience from CV
   * @param cv CV data
   * @returns Total years of experience
   */
  private extractExperienceYears(cv: CVData): number {
    if (!cv.experience?.length) return 0;
    
    let totalYears = 0;
    
    for (const exp of cv.experience) {
      const startYear = this.extractYearFromDate(exp.startDate);
      const endYear = exp.endDate ? this.extractYearFromDate(exp.endDate) : new Date().getFullYear();
      
      if (startYear && endYear) {
        totalYears += endYear - startYear;
      }
    }
    
    return Math.max(0, totalYears);
  }

  /**
   * Extract required years of experience from job posting
   * @param posting Job posting data
   * @returns Required years of experience
   */
  private extractRequiredYears(posting: JobPosting): number {
    if (!posting.experienceLevel) return 0;
    
    // Match patterns like "5+ years", "3-5 years", "at least 2 years"
    const yearPatterns = [
      /(\d+)(?:\s*-\s*\d+)?\s*(?:\+)?\s*years?/i,
      /(\d+)(?:\s*\+)?\s*years?/i,
      /at least (\d+)\s*years?/i,
      /minimum (?:of )?(\d+)\s*years?/i,
      /(\d+)\s*or more years?/i
    ];
    
    for (const pattern of yearPatterns) {
      const match = posting.experienceLevel.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return 0;
  }

  /**
   * Extract year from date string
   * @param dateString Date string (format: MM/YYYY or similar)
   * @returns Year as number
   */
  private extractYearFromDate(dateString: string): number {
    if (!dateString) return 0;
    
    // Match year patterns
    const yearMatch = dateString.match(/(\d{4})/);
    if (yearMatch && yearMatch[1]) {
      return parseInt(yearMatch[1], 10);
    }
    
    return 0;
  }

  /**
   * Calculate education score based on matching education requirements
   * @param cv CV data
   * @param posting Job posting data
   * @returns Education match score (0-1)
   */
  private calculateEducationScore(cv: CVData, posting: JobPosting): number {
    if (!cv.education?.length) return 0;
    if (!posting.educationRequirements?.length) return 1; // No specific requirements
    
    const cvDegrees = cv.education.map(edu => edu.degree.toLowerCase());
    let bestScore = 0;
    
    for (const requirement of posting.educationRequirements) {
      const reqLower = requirement.toLowerCase();
      
      // Check for degree matches
      for (const degree of cvDegrees) {
        if (reqLower.includes(degree) || degree.includes(reqLower)) {
          // Direct match
          bestScore = Math.max(bestScore, 1);
          break;
        }
        
        // Check

