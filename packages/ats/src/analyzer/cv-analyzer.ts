import { CVData, JobPosting, ATSAnalysis } from '@dzb-cv/types';

/**
 * Weights for different scoring components
 */
interface ScoringWeights {
  keywords: number;
  experience: number;
  education: number;
}

/**
 * Default weights for the CV analyzer
 */
const DEFAULT_WEIGHTS: ScoringWeights = {
  keywords: 0.5,
  experience: 0.3,
  education: 0.2,
};

/**
 * Education level mapping
 */
const EDUCATION_LEVELS: Record<string, number> = {
  'high school': 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  phd: 5,
  doctorate: 5,
};

/**
 * CVAnalyzer analyzes a CV against a job posting to determine compatibility
 */
export class CVAnalyzer {
  private readonly weights: ScoringWeights;
  private readonly stopWords: Set<string>;

  /**
   * Creates a new CVAnalyzer with optional custom weights
   */
  constructor(weights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.stopWords = new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'of',
      'for',
      'with',
      'in',
      'on',
      'at',
      'to',
      'from',
      'by',
      'as',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'shall',
      'should',
      'can',
      'could',
      'may',
      'might',
      'must',
      'this',
      'that',
      'these',
      'those',
      'job',
      'work',
      'role',
      'position',
      'candidate',
      'applicant',
      'required',
      'preferred',
      'qualification',
      'experience',
      'skill',
      'ability',
      'about',
      'our',
      'we',
      'us',
      'you',
      'your',
      'their',
      'they',
      'it',
      'its',
      'company',
      'team',
      'opportunity',
      'looking',
      'join',
      'working',
      'responsibilities',
    ]);
  }

  /**
   * Analyzes a CV against a job posting
   */
  public analyze(cv: CVData, posting: JobPosting): ATSAnalysis {
    // Handle edge cases
    if (
      !posting ||
      (!posting.description &&
        !posting.responsibilities?.length &&
        !posting.qualifications?.length &&
        !posting.skills?.length)
    ) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: [],
        suggestions: posting ? ['The job posting is empty. Add job details for analysis.'] : [],
        formattingIssues: [],
      };
    }

    // Handle empty CV
    if (!cv || (!cv.experience.length && !cv.education.length && !cv.skills.length)) {
      return {
        score: 0,
        keywordMatches: [],
        missingKeywords: Array.from(new Set(this.extractKeywords(this.extractJobText(posting)))),
        suggestions: ['CV is empty or missing critical sections.'],
        formattingIssues: [],
      };
    }

    // Extract job and CV text
    const jobText = this.extractJobText(posting);
    const cvText = this.extractCVText(cv);

    // Extract keywords
    const jobKeywords = this.extractKeywords(jobText);
    const cvKeywords = this.extractKeywords(cvText);

    // Find keyword matches and missing keywords
    const keywordMatchesLower = jobKeywords.filter((k) =>
      cvKeywords.some((cvKeyword) => cvKeyword.toLowerCase() === k.toLowerCase())
    );

    // Get the original case for matched keywords
    const keywordMatches = keywordMatchesLower.map((keyword) => {
      // Find the original case from the CV text
      const match = cvKeywords.find(
        (cvKeyword) => cvKeyword.toLowerCase() === keyword.toLowerCase()
      );
      return match || keyword; // Fallback to the job keyword if not found
    });

    const missingKeywords = jobKeywords.filter(
      (k) => !cvKeywords.some((cvKeyword) => cvKeyword.toLowerCase() === k.toLowerCase())
    );

    // Calculate scores
    const keywordScore = jobKeywords.length ? keywordMatchesLower.length / jobKeywords.length : 0;
    const experienceScore = this.calculateExperienceScore(cv, posting);
    const educationScore = this.calculateEducationScore(cv, posting);

    // Overall score (ensure no NaN)
    const score =
      !isNaN(keywordScore) && !isNaN(experienceScore) && !isNaN(educationScore)
        ? keywordScore * this.weights.keywords +
          experienceScore * this.weights.experience +
          educationScore * this.weights.education
        : 0;

    // Generate suggestions
    const suggestions = this.generateSuggestions(cv, posting, missingKeywords);

    return {
      score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
      keywordMatches,
      missingKeywords,
      suggestions,
      formattingIssues: [],
    };
  }

  /**
   * Extracts keywords from text
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    // Technical terms regex patterns
    const techTermsRegex =
      /\b(React|TypeScript|JavaScript|Vue\.js|Angular|Node\.js|Next\.js|HTML5|CSS3|jQuery|Express\.js|MongoDB|SQL|AWS|Azure|Docker|Kubernetes|Git|Jest|Webpack|Babel|Gulp|Grunt|Redux|Vuex|GraphQL|REST|API|JSON|XML|SASS|SCSS|LESS|Tailwind|Bootstrap|Material-UI|Storybook|Cypress|Selenium|Jenkins|Travis|CircleCI|Github Actions)\b/gi;

    const specificTechRegex =
      /\b(jest|webpack|docker|typescript|node\.js|react\.js|vue\.js|next\.js)\b/gi;

    // Split text into words
    const words = text.split(/\s+/);
    const keywords = new Set<string>();

    // Process each word
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

      // Skip stop words
      if (cleanWord.length < 3 || this.stopWords.has(cleanWord)) {
        continue;
      }

      keywords.add(word);
    }

    // Extract technical terms with correct casing
    let match;
    const technicalTerms = new Set<string>();

    while ((match = techTermsRegex.exec(text)) !== null) {
      technicalTerms.add(match[0]);
    }

    while ((match = specificTechRegex.exec(text)) !== null) {
      // For specific tech terms, add them with proper casing
      const termLower = match[0].toLowerCase();
      if (termLower === 'jest') technicalTerms.add('Jest');
      else if (termLower === 'webpack') technicalTerms.add('Webpack');
      else if (termLower === 'docker') technicalTerms.add('Docker');
      else if (termLower === 'typescript') technicalTerms.add('TypeScript');
      else if (termLower === 'node.js') technicalTerms.add('Node.js');
      else if (termLower === 'react.js') technicalTerms.add('React.js');
      else if (termLower === 'vue.js') technicalTerms.add('Vue.js');
      else if (termLower === 'next.js') technicalTerms.add('Next.js');
      else technicalTerms.add(match[0]);
    }

    // Combine regular keywords and technical terms
    return [...Array.from(keywords), ...Array.from(technicalTerms)];
  }

  /**
   * Extracts text from a job posting
   */
  private extractJobText(posting: JobPosting): string {
    if (!posting) return '';

    const parts: string[] = [];

    if (posting.title) parts.push(posting.title);
    if (posting.description) parts.push(posting.description);

    if (posting.skills && posting.skills.length) {
      parts.push(posting.skills.join(' '));
    }

    if (posting.qualifications && posting.qualifications.length) {
      parts.push(posting.qualifications.join(' '));
    }

    if (posting.responsibilities && posting.responsibilities.length) {
      parts.push(posting.responsibilities.join(' '));
    }

    return parts.join(' ');
  }

  /**
   * Extracts text from a CV
   */
  private extractCVText(cv: CVData): string {
    if (!cv) return '';

    const parts: string[] = [];

    if (cv.personalInfo?.summary) {
      parts.push(cv.personalInfo.summary);
    }

    for (const exp of cv.experience) {
      parts.push(exp.position);
      parts.push(exp.employer);

      if (exp.responsibilities && exp.responsibilities.length) {
        parts.push(exp.responsibilities.join(' '));
      }

      if (exp.achievements && exp.achievements.length) {
        parts.push(exp.achievements.join(' '));
      }
    }

    for (const edu of cv.education) {
      parts.push(edu.degree);
      parts.push(edu.field);
      parts.push(edu.institution);
    }

    if (cv.skills && cv.skills.length) {
      for (const skill of cv.skills) {
        parts.push(skill.name);
      }
    }

    return parts.join(' ');
  }

  /**
   * Calculates experience score based on years of experience
   */
  private calculateExperienceScore(cv: CVData, posting: JobPosting): number {
    if (!cv.experience.length) return 0;

    // Calculate total years of experience from CV
    const totalYears = cv.experience.reduce((total, exp) => {
      if (!exp.startDate) return total;

      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

      const years =
        endDate.getFullYear() -
        startDate.getFullYear() +
        (endDate.getMonth() - startDate.getMonth()) / 12;

      return total + Math.max(0, years);
    }, 0);

    // Extract experience requirement from job posting
    let requiredYears = 0;
    let foundExperienceReq = false;

    if (posting.description) {
      // Use regex to find experience requirements
      const expMatch = posting.description.match(
        /(\d+)(?:\+|\s+to\s+\d+)?\s+years?(?:\s+of)?\s+experience/i
      );

      if (expMatch && expMatch[1]) {
        requiredYears = parseInt(expMatch[1], 10);
        foundExperienceReq = true;
      }
    }

    // If explicit experience array in job posting
    if (posting.experience && posting.experience.length) {
      for (const exp of posting.experience) {
        const expMatch = exp.match(/(\d+)(?:\+|\s+to\s+\d+)?\s+years?/i);

        if (expMatch && expMatch[1]) {
          requiredYears = Math.max(requiredYears, parseInt(expMatch[1], 10));
          foundExperienceReq = true;
        }
      }
    }

    // Experience score (default to 0.5 if no requirement)
    return !foundExperienceReq
      ? 0.5
      : totalYears >= requiredYears
        ? 1.0
        : totalYears / requiredYears;
  }

  /**
   * Calculates education score based on required education level
   */
  private calculateEducationScore(cv: CVData, posting: JobPosting): number {
    if (!cv.education.length) return 0;

    // Calculate highest education level in CV
    let highestCVEducation = 0;

    for (const edu of cv.education) {
      let level = 0;

      // Check education degree against known levels
      for (const [keyword, value] of Object.entries(EDUCATION_LEVELS)) {
        if (edu.degree.toLowerCase().includes(keyword)) {
          level = Math.max(level, value);
        }
      }

      highestCVEducation = Math.max(highestCVEducation, level);
    }

    // Extract required education level from job posting
    let requiredEducation = 0;
    let foundEducationReq = false;

    if (posting.description) {
      // Check for education requirements in description
      for (const [keyword, value] of Object.entries(EDUCATION_LEVELS)) {
        if (posting.description.toLowerCase().includes(keyword)) {
          requiredEducation = Math.max(requiredEducation, value);
          foundEducationReq = true;
        }
      }
    }

    // Check qualifications array if present
    if (posting.qualifications && posting.qualifications.length) {
      for (const qual of posting.qualifications) {
        for (const [keyword, value] of Object.entries(EDUCATION_LEVELS)) {
          if (qual.toLowerCase().includes(keyword)) {
            requiredEducation = Math.max(requiredEducation, value);
            foundEducationReq = true;
          }
        }
      }
    }

    // If no specific education requirement found, assume high school (level 1)
    if (!foundEducationReq) {
      requiredEducation = 1;
    }

    // Calculate score based on education match
    if (highestCVEducation >= requiredEducation) {
      return 1.0;
    } else {
      // Partial credit for being close to required education level
      return highestCVEducation / requiredEducation;
    }
  }

  /**
   * Generates suggestions for improving CV match
   */
  private generateSuggestions(
    cv: CVData,
    posting: JobPosting,
    missingKeywords: string[]
  ): string[] {
    const suggestions: string[] = [];

    // Suggest adding missing keywords
    if (missingKeywords.length > 0) {
      suggestions.push(`Consider adding these keywords to your CV: ${missingKeywords.join(', ')}`);
    }

    // Check for experience match
    const expScore = this.calculateExperienceScore(cv, posting);
    if (expScore < 0.5) {
      suggestions.push('Your experience level might be below the job requirements.');
    }

    // Check for education match
    const eduScore = this.calculateEducationScore(cv, posting);
    if (eduScore < 1.0) {
      suggestions.push('Your education level might be below the job requirements.');
    }

    // Check for empty sections
    if (!cv.skills || cv.skills.length === 0) {
      suggestions.push('Add a skills section to your CV.');
    }

    if (!cv.experience || cv.experience.length === 0) {
      suggestions.push('Add work experience to your CV.');
    }

    if (!cv.education || cv.education.length === 0) {
      suggestions.push('Add education details to your CV.');
    }

    return suggestions;
  }
}
