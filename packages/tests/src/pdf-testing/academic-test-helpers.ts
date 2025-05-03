import type { PDFDocument } from 'pdf-lib';
import type { ElementMetrics, SectionMetrics } from './metrics-validation';
import { createPDFValidationError } from './validation-error';

interface CitationFormat {
  pattern: RegExp;
  example: string;
}

interface ImpactMetrics {
  citations?: number;
  hIndex?: number;
  i10Index?: number;
}

interface TeachingMetrics {
  evaluationScore?: number;
  studentCount?: number;
  courseCount?: number;
  supervisedStudents?: {
    phd?: number;
    masters?: number;
    undergraduate?: number;
  };
}

interface ConferenceFormat {
  pattern: RegExp;
  example: string;
}

interface ServiceMetrics {
  committees?: number;
  reviews?: number;
  editorial?: number;
  leadership?: number;
}

interface PublicationImpactMetrics extends ImpactMetrics {
  journalImpactFactor?: number;
  citationsPerYear?: number;
  topVenuePapers?: number;
}

interface CourseEvaluation {
  year: number;
  semester: string;
  score: number;
  responses: number;
}

interface AcademicRankRequirements {
  assistant: {
    publications: number;
    grants: number;
    teaching: number;
  };
  associate: {
    publications: number;
    grants: number;
    teaching: number;
    service: number;
  };
  full: {
    publications: number;
    grants: number;
    teaching: number;
    service: number;
    leadership: number;
  };
}

interface ValidationError {
  type: string;
  field: string;
  message: string;
  expected?: string;
  actual?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  rank?: keyof AcademicRankRequirements;
  patterns?: Record<string, boolean>;
}

interface DetailedValidationError extends ValidationError {
  severity: 'critical' | 'major' | 'minor';
  suggestion?: string;
  context?: Record<string, unknown>;
}

interface CareerStageRequirements {
  earlyCareer: {
    yearsPostPhD: number;
    minPublications: number;
    minCitations: number;
    teachingLoad: number;
  };
  midCareer: {
    yearsPostPhD: number;
    minPublications: number;
    minCitations: number;
    teachingLoad: number;
    serviceLoad: number;
  };
  senior: {
    yearsPostPhD: number;
    minPublications: number;
    minCitations: number;
    teachingLoad: number;
    serviceLoad: number;
    leadershipRoles: number;
  };
}

interface InstitutionTypeRequirements {
  r1: CareerStageRequirements;
  r2: CareerStageRequirements;
  pui: CareerStageRequirements;
  liberal: CareerStageRequirements;
}

interface ValidationReport {
  summary: string;
  details: {
    category: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    recommendations?: string[];
  }[];
  score: number;
}

interface ValidationSummary {
  isValid: boolean;
  score: number;
  severityBreakdown: {
    critical: number;
    major: number;
    minor: number;
  };
  sectionScores: Record<string, {
    score: number;
    issues: DetailedValidationError[];
  }>;
  recommendations: string[];
}

interface HierarchicalValidationResult {
  isValid: boolean;
  summary: ValidationSummary;
  details: {
    section: string;
    errors: DetailedValidationError[];
    subsections?: {
      name: string;
      errors: DetailedValidationError[];
    }[];
  }[];
}
// ValidationContext class for tracking validation results and adjustments
class ValidationContext {
  private results: Map<string, any> = new Map();
  private adjustments: Map<string, number> = new Map();

  addResults(category: string, results: any) {
    this.results.set(category, results);
  }

  addAdjustment(category: string, factor: number) {
    this.adjustments.set(category, factor);
  }

  getAdjustedScore(category: string, baseScore: number): number {
    const factor = this.adjustments.get(category) ?? 1;
    return baseScore * factor;
  }

  getAllResults(): Record<string, any> {
    return Object.fromEntries(this.results);
  }
}

const citationFormats: Record<string, CitationFormat> = {
  apa: {
    pattern: /^[A-Z][a-z]+,\s+[A-Z]\.(\s+[A-Z]\.)?\s+\(\d{4}\)\./,
    example: 'Smith, J. A. (2020). Title of the work. Journal, 12(3), 45-67.'
  },
  mla: {
    pattern: /^[A-Z][a-z]+,\s+[A-Z][a-z]+\.\s+"[^"]+"/,
    example: 'Smith, John. "Title of the Work." Journal, vol. 12, no. 3, 2020, pp. 45-67.'
  },
  chicago: {
    pattern: /^[A-Z][a-z]+,\s+[A-Z][a-z]+\.\s+[""].*?[""]/,
    example: 'Smith, John. "Title of the Work." Journal 12, no. 3 (2020): 45-67.'
  }
};

export const academicTestHelpers = {
  validatePublicationFormat(
    text: string,
    format: 'apa' | 'mla' | 'chicago'
  ): void {
    const citation = citationFormats[format];
    if (!citation.pattern.test(text)) {
      throw createPDFValidationError(
        'format',
        `citation.${format}`,
        citation.example,
        text
      );
    }
  },

  validateChronologicalOrder(
    elements: (ElementMetrics & { text?: string })[],
    dateExtractor: (text: string) => string
  ): void {
    const dates = elements
      .map(el => el.text)
      .filter(Boolean)
      .map(dateExtractor)
      .filter(Boolean);

    const isDescending = dates.every((date, i) => 
      i === 0 || date <= dates[i - 1]
    );

    if (!isDescending) {
      throw createPDFValidationError(
        'order',
        'chronological',
        'Descending date order',
        'Dates not in descending order'
      );
    }
  },

  validateTeachingChronology(section: SectionMetrics): void {
    const courseElements = section.content.filter(el => 
      /[A-Z]{2,4}\s*\d{3,4}/.test(el.text || '')
    );

    this.validateChronologicalOrder(
      courseElements,
      text => {
        const match = text.match(/\d{4}/);
        return match ? match[0] : '';
      }
    );
  },

  validateResearchImpact(
    section: SectionMetrics,
    expectedMetrics?: Partial<ImpactMetrics>
  ): void {
    if (!expectedMetrics) return;

    const text = section.content.map(el => el.text).join(' ');
    
    if (expectedMetrics.citations !== undefined) {
      const citationMatch = text.match(/citations?:\s*(\d+)/i);
      const citations = citationMatch ? parseInt(citationMatch[1], 10) : 0;
      
      if (citations < expectedMetrics.citations) {
        throw createPDFValidationError(
          'metrics',
          'research.citations',
          `At least ${expectedMetrics.citations} citations`,
          `${citations} citations found`
        );
      }
    }

    if (expectedMetrics.hIndex !== undefined) {
      const hIndexMatch = text.match(/h-index:\s*(\d+)/i);
      const hIndex = hIndexMatch ? parseInt(hIndexMatch[1], 10) : 0;
      
      if (hIndex < expectedMetrics.hIndex) {
        throw createPDFValidationError(
          'metrics',
          'research.hIndex',
          `h-index of at least ${expectedMetrics.hIndex}`,
          `h-index of ${hIndex} found`
        );
      }
    }
  },

  expectValidPublicationSection(
    section: SectionMetrics,
    requirements: {
      format: 'apa' | 'mla' | 'chicago';
      minPublications?: number;
      impactMetrics?: ImpactMetrics;
    }
  ): void {
    const entries = section.content.filter(el => 
      this.isPublicationEntry(el.text || '')
    );

    if (requirements.minPublications && entries.length < requirements.minPublications) {
      throw createPDFValidationError(
        'content',
        'publications.count',
        `At least ${requirements.minPublications} publications`,
        `${entries.length} publications found`
      );
    }

    entries.forEach(entry => 
      this.validatePublicationFormat(entry.text || '', requirements.format)
    );

    if (requirements.impactMetrics) {
      this.validateResearchImpact(section, requirements.impactMetrics);
    }
  },

  expectValidResearchSection(
    section: SectionMetrics,
    requirements: {
      minGrants?: number;
      totalFunding?: number;
      activeFunding?: number;
    }
  ): void {
    const grantEntries = section.content.filter(el => 
      this.isGrantEntry(el.text || '')
    );

    if (requirements.minGrants && grantEntries.length < requirements.minGrants) {
      throw createPDFValidationError(
        'content',
        'research.grants',
        `At least ${requirements.minGrants} grants`,
        `${grantEntries.length} grants found`
      );
    }

    if (requirements.totalFunding) {
      const totalFunding = this.calculateTotalFunding(grantEntries);
      if (totalFunding < requirements.totalFunding) {
        throw createPDFValidationError(
          'metrics',
          'research.funding',
          `At least $${requirements.totalFunding.toLocaleString()}`,
          `$${totalFunding.toLocaleString()} found`
        );
      }
    }
  },

  isPublicationEntry(text: string): boolean {
    return Object.values(citationFormats).some(format => 
      format.pattern.test(text)
    );
  },

  isGrantEntry(text: string): boolean {
    return /\$\d{1,3}(,\d{3})*(\.\d{2})?/.test(text) && 
           /\d{4}(-\d{2,4})?/.test(text);
  },

  calculateTotalFunding(grants: (ElementMetrics & { text?: string })[]): number {
    return grants.reduce((total, grant) => {
      const match = grant.text?.match(/\$(\d{1,3}(,\d{3})*(\.\d{2})?)/);
      if (!match) return total;
      return total + parseFloat(match[1].replace(/,/g, ''));
    }, 0);
  }
  validateTeachingMetrics(
    section: SectionMetrics,
    requirements: TeachingMetrics
  ): void {
    const text = section.content.map(el => el.text).join(' ');

    if (requirements.evaluationScore !== undefined) {
      const scoreMatch = text.match(/(\d+(\.\d+)?)\s*\/\s*5\.0/);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      if (score < requirements.evaluationScore) {
        throw createPDFValidationError(
          'metrics',
          'teaching.evaluation',
          `Evaluation score of at least ${requirements.evaluationScore}/5.0`,
          `${score}/5.0 found`
        );
      }
    }

    if (requirements.supervisedStudents) {
      const { phd, masters, undergraduate } = requirements.supervisedStudents;
      
      if (phd !== undefined) {
        const phdCount = this.countSupervisedStudents(text, 'phd');
        if (phdCount < phd) {
          throw createPDFValidationError(
            'metrics',
            'teaching.phd',
            `At least ${phd} PhD students`,
            `${phdCount} PhD students found`
          );
        }
      }

      if (masters !== undefined) {
        const mastersCount = this.countSupervisedStudents(text, 'masters');
        if (mastersCount < masters) {
          throw createPDFValidationError(
            'metrics',
            'teaching.masters',
            `At least ${masters} Masters students`,
            `${mastersCount} Masters students found`
          );
        }
      }

      if (undergraduate !== undefined) {
        const undergradCount = this.countSupervisedStudents(text, 'undergraduate');
        if (undergradCount < undergraduate) {
          throw createPDFValidationError(
            'metrics',
            'teaching.undergraduate',
            `At least ${undergraduate} Undergraduate students`,
            `${undergradCount} Undergraduate students found`
          );
        }
      }
    }
  },

  validateConferencePresentation(
    text: string,
    format: 'international' | 'domestic' | 'invited' = 'international'
  ): void {
    const formats: Record<string, ConferenceFormat> = {
      international: {
        pattern: /^.+\.\s+(\d{4})\.\s+.+\.\s+In\s+.+,\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*,\s+[A-Z]{2,3}(\s+|,\s+)[A-Z]{2,3}/,
        example: 'Smith, J. (2020). Title. In Conference Name, City, ST, USA'
      },
      domestic: {
        pattern: /^.+\.\s+(\d{4})\.\s+.+\.\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*,\s+[A-Z]{2}/,
        example: 'Smith, J. (2020). Title. City, ST'
      },
      invited: {
        pattern: /^Invited\s+[Tt]alk:?\s+.+\.\s+(\d{4})\./,
        example: 'Invited Talk: Title. (2020). Location'
      }
    };

    const formatSpec = formats[format];
    if (!formatSpec.pattern.test(text)) {
      throw createPDFValidationError(
        'format',
        `conference.${format}`,
        formatSpec.example,
        text
      );
    }
  },

  validateCoAuthors(
    publication: string,
    requirements: {
      minAuthors?: number;
      maxAuthors?: number;
      includeAuthors?: string[];
      firstAuthor?: boolean;
    }
  ): void {
    const authors = this.extractAuthors(publication);

    if (requirements.minAuthors && authors.length < requirements.minAuthors) {
      throw createPDFValidationError(
        'content',
        'publication.authors.min',
        `At least ${requirements.minAuthors} authors`,
        `${authors.length} authors found`
      );
    }

    if (requirements.maxAuthors && authors.length > requirements.maxAuthors) {
      throw createPDFValidationError(
        'content',
        'publication.authors.max',
        `At most ${requirements.maxAuthors} authors`,
        `${authors.length} authors found`
      );
    }

    if (requirements.includeAuthors) {
      const missingAuthors = requirements.includeAuthors.filter(
        author => !authors.some(a => a.toLowerCase().includes(author.toLowerCase()))
      );

      if (missingAuthors.length > 0) {
        throw createPDFValidationError(
          'content',
          'publication.authors.required',
          requirements.includeAuthors.join(', '),
          `Missing authors: ${missingAuthors.join(', ')}`
        );
      }
    }

    if (requirements.firstAuthor && 
        requirements.includeAuthors?.[0] &&
        !authors[0].toLowerCase().includes(requirements.includeAuthors[0].toLowerCase())) {
      throw createPDFValidationError(
        'content',
        'publication.authors.first',
        `First author should be ${requirements.includeAuthors[0]}`,
        `First author is ${authors[0]}`
      );
    }
  },

  validateAcademicAchievements(
    section: SectionMetrics,
    requirements: {
      awards?: number;
      fellowships?: number;
      scholarships?: number;
      minYear?: number;
    }
  ): void {
    const text = section.content.map(el => el.text).join(' ');

    if (requirements.awards !== undefined) {
      const awardCount = (text.match(/award/gi) || []).length;
      if (awardCount < requirements.awards) {
        throw createPDFValidationError(
          'content',
          'achievements.awards',
          `At least ${requirements.awards} awards`,
          `${awardCount} awards found`
        );
      }
    }

    if (requirements.minYear !== undefined) {
      const years = text.match(/\d{4}/g)?.map(Number) || [];
      const hasRecentAchievement = years.some(year => year >= requirements.minYear);
      
      if (!hasRecentAchievement) {
        throw createPDFValidationError(
          'content',
          'achievements.recent',
          `Achievement since ${requirements.minYear}`,
          'No recent achievements found'
        );
      }
    }
  },

  countSupervisedStudents(text: string, level: 'phd' | 'masters' | 'undergraduate'): number {
    const patterns: Record<string, RegExp> = {
      phd: /(?:PhD|Doctoral|Ph\.D\.)\s+students?:\s*(\d+)/i,
      masters: /(?:Masters?|M\.S\.|M\.A\.)\s+students?:\s*(\d+)/i,
      undergraduate: /(?:Undergraduate|B\.S\.|B\.A\.)\s+students?:\s*(\d+)/i
    };

    const match = text.match(patterns[level]);
    return match ? parseInt(match[1], 10) : 0;
  },

  extractAuthors(publication: string): string[] {
    // Extract authors based on citation format
    const authorSection = publication.split(/[.,(]/)[0];
    return authorSection
      .split(/,\s*(?:and\s+|&\s+)?|\s+and\s+|\s+&\s+/)
      .map(author => author.trim())
      .filter(Boolean);
  },

  validateAcademicService(
    section: SectionMetrics,
    requirements: ServiceMetrics
  ): void {
    const text = section.content.map(el => el.text).join(' ');

    if (requirements.committees !== undefined) {
      const committeeCount = this.countServiceItems(text, 'committee');
      if (committeeCount < requirements.committees) {
        throw createPDFValidationError(
          'service',
          'committees',
          `At least ${requirements.committees} committees`,
          `${committeeCount} committees found`
        );
      }
    }

    if (requirements.reviews !== undefined) {
      const reviewCount = this.countServiceItems(text, 'review');
      if (reviewCount < requirements.reviews) {
        throw createPDFValidationError(
          'service',
          'reviews',
          `At least ${requirements.reviews} reviews`,
          `${reviewCount} reviews found`
        );
      }
    }

    if (requirements.editorial !== undefined) {
      const editorialCount = this.countServiceItems(text, 'editorial');
      if (editorialCount < requirements.editorial) {
        throw createPDFValidationError(
          'service',
          'editorial',
          `At least ${requirements.editorial} editorial positions`,
          `${editorialCount} positions found`
        );
      }
    }
  },

  validatePublicationImpact(
    section: SectionMetrics,
    requirements: PublicationImpactMetrics
  ): void {
    const text = section.content.map(el => el.text).join(' ');

    if (requirements.journalImpactFactor !== undefined) {
      const impactFactors = this.extractImpactFactors(text);
      const hasHighImpact = impactFactors.some(
        factor => factor >= requirements.journalImpactFactor!
      );

      if (!hasHighImpact) {
        throw createPDFValidationError(
          'impact',
          'journal.impact',
          `Journal with impact factor >= ${requirements.journalImpactFactor}`,
          `Highest impact factor: ${Math.max(...impactFactors) || 0}`
        );
      }
    }

    if (requirements.citationsPerYear !== undefined) {
      const citationsPerYear = this.calculateCitationsPerYear(text);
      if (citationsPerYear < requirements.citationsPerYear) {
        throw createPDFValidationError(
          'impact',
          'citations.yearly',
          `${requirements.citationsPerYear} citations per year`,
          `${citationsPerYear} citations per year found`
        );
      }
    }
  },

  validateTeachingTrend(
    section: SectionMetrics,
    requirements: {
      minTrend?: number;
      recentScore?: number;
      minResponses?: number;
    }
  ): void {
    const evaluations = this.extractCourseEvaluations(section);
    if (evaluations.length === 0) return;

    if (requirements.minTrend !== undefined) {
      const trend = this.calculateEvaluationTrend(evaluations);
      if (trend < requirements.minTrend) {
        throw createPDFValidationError(
          'teaching',
          'evaluation.trend',
          `Improving trend >= ${requirements.minTrend}`,
          `Trend: ${trend.toFixed(2)}`
        );
      }
    }

    if (requirements.recentScore !== undefined) {
      const recentEvals = this.getRecentEvaluations(evaluations, 2);
      const avgScore = this.calculateAverageScore(recentEvals);
      if (avgScore < requirements.recentScore) {
        throw createPDFValidationError(
          'teaching',
          'evaluation.recent',
          `Recent score >= ${requirements.recentScore}`,
          `Average recent score: ${avgScore.toFixed(2)}`
        );
      }
    }
  },

  countServiceItems(text: string, type: 'committee' | 'review' | 'editorial'): number {
    const patterns: Record<string, RegExp> = {
      committee: /(?:committee|task force|working group)/gi,
      review: /(?:reviewer|reviewed for|peer review)/gi,
      editorial: /(?:editor|editorial board|associate editor)/gi
    };

    return (text.match(patterns[type]) || []).length;
  },

  extractImpactFactors(text: string): number[] {
    const matches = text.match(/impact factor[:\s]+(\d+\.?\d*)/gi) || [];
    return matches.map(match => {
      const factor = parseFloat(match.replace(/[^0-9.]/g, ''));
      return isNaN(factor) ? 0 : factor;
    });
  },

  calculateCitationsPerYear(text: string): number {
    const citationMatch = text.match(/(\d+)\s+citations/i);
    const yearMatch = text.match(/since\s+(\d{4})/i);
    
    if (!citationMatch || !yearMatch) return 0;
    
    const citations = parseInt(citationMatch[1], 10);
    const startYear = parseInt(yearMatch[1], 10);
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;
    
    return years > 0 ? citations / years : 0;
  },

  extractCourseEvaluations(section: SectionMetrics): CourseEvaluation[] {
    return section.content
      .map(el => {
        const text = el.text || '';
        const yearMatch = text.match(/\b(20\d{2})\b/);
        const semesterMatch = text.match(/\b(Spring|Fall|Summer)\b/i);
        const scoreMatch = text.match(/(\d+\.?\d*)\s*\/\s*5\.0/);
        const responseMatch = text.match(/(\d+)\s+responses/i);

        if (!yearMatch || !semesterMatch || !scoreMatch) return null;

        return {
          year: parseInt(yearMatch[1], 10),
          semester: semesterMatch[1],
          score: parseFloat(scoreMatch[1]),
          responses: responseMatch ? parseInt(responseMatch[1], 10) : 0
        };
      })
      .filter((eval): eval is CourseEvaluation => eval !== null);
  },

  calculateEvaluationTrend(evaluations: CourseEvaluation[]): number {
    if (evaluations.length < 2) return 0;

    const sortedEvals = [...evaluations].sort((a, b) => a.year - b.year);
    const scores = sortedEvals.map(e => e.score);
    
    // Calculate linear regression slope
    const n = scores.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumXX = x.reduce((sum, x) => sum + x * x, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  },

  getRecentEvaluations(
    evaluations: CourseEvaluation[],
    count: number
  ): CourseEvaluation[] {
    return [...evaluations]
      .sort((a, b) => b.year - a.year || b.semester.localeCompare(a.semester))
      .slice(0, count);
  },

  calculateAverageScore(evaluations: CourseEvaluation[]): number {
    if (evaluations.length === 0) return 0;
    return evaluations.reduce((sum, eval) => sum + eval.score, 0) / evaluations.length;
  },

  async validateForRank(
    doc: PDFDocument,
    sections: SectionMetrics[],
    rank: keyof AcademicRankRequirements
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const requirements = this.getRankRequirements(rank);

    try {
      this.expectValidPublicationSection(
        sections.find(s => s.title.text === 'Publications') || { title: { text: 'Publications' }, content: [], bounds: { top: 0, right: 0, bottom: 0, left: 0 } },
        { format: 'apa', minPublications: requirements[rank].publications }
      );
    } catch (error) {
      if (error instanceof Error) {
        errors.push({
          type: 'publication',
          field: 'publications.count',
          message: error.message
        });
      }
    }

    try {
      this.expectValidResearchSection(
        sections.find(s => s.title.text === 'Research') || { title: { text: 'Research' }, content: [], bounds: { top: 0, right: 0, bottom: 0, left: 0 } },
        { minGrants: requirements[rank].grants }
      );
    } catch (error) {
      if (error instanceof Error) {
        errors.push({
          type: 'research',
          field: 'research.grants',
          message: error.message
        });
      }
    }

    try {
      const teachingSection = sections.find(s => s.title.text === 'Teaching') || { title: { text: 'Teaching' }, content: [], bounds: { top: 0, right: 0, bottom: 0, left: 0 } };
      this.validateTeachingMetrics(
        teachingSection,
        { evaluationScore: 4.0, courseCount: requirements[rank].teaching }
      );
    } catch (error) {
      if (error instanceof Error) {
        errors.push({
          type: 'teaching',
          field: 'teaching.metrics',
          message: error.message
        });
      }
    }

    if (rank !== 'assistant') {
      try {
        this.validateAcademicService(
          sections.find(s => s.title.text === 'Service') || { title: { text: 'Service' }, content: [], bounds: { top: 0, right: 0, bottom: 0, left: 0 } },
          { committees: requirements[rank].service }
        );
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            type: 'service',
            field: 'service.committees',
            message: error.message
          });
        }
      }
    }

    if (rank === 'full') {
      try {
        await this.validateLeadership(
          sections,
          requirements[rank].leadership
        );
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            type: 'leadership',
            field: 'leadership.roles',
            message: error.message
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      rank
    };
  },

  validateCommonPatterns(
    sections: SectionMetrics[],
    patterns: {
      nationalPresence?: boolean;
      internationalCollaboration?: boolean;
      interdisciplinary?: boolean;
      studentMentorship?: boolean;
    }
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const text = sections.map(s => s.content.map(el => el.text).join(' ')).join(' ');

    if (patterns.nationalPresence) {
      const hasNationalPresence = this.checkNationalPresence(text);
      if (!hasNationalPresence) {
        errors.push({
          type: 'pattern',
          field: 'national_presence',
          message: 'No evidence of national presence in the field'
        });
      }
    }

    if (patterns.internationalCollaboration) {
      const hasInternational = this.checkInternationalCollaboration(text);
      if (!hasInternational) {
        errors.push({
          type: 'pattern',
          field: 'international_collaboration',
          message: 'No evidence of international collaboration'
        });
      }
    }

    if (patterns.interdisciplinary) {
      const isInterdisciplinary = this.checkInterdisciplinaryWork(text);
      if (!isInterdisciplinary) {
        errors.push({
          type: 'pattern',
          field: 'interdisciplinary',
          message: 'No evidence of interdisciplinary work'
        });
      }
    }

    if (patterns.studentMentorship) {
      const hasMentorship = text.match(/mentor(ed|ing|ship)/i) !== null;
      if (!hasMentorship) {
        errors.push({
          type: 'pattern',
          field: 'student_mentorship',
          message: 'No evidence of student mentorship'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      patterns
    };
  },

  getRankRequirements(rank: keyof AcademicRankRequirements): AcademicRankRequirements {
    return {
      assistant: {
        publications: 3,
        grants: 1,
        teaching: 4
      },
      associate: {
        publications: 10,
        grants: 3,
        teaching: 8,
        service: 2
      },
      full: {
        publications: 25,
        grants: 5,
        teaching: 16,
        service: 4,
        leadership: 2
      }
    };
  },

  checkNationalPresence(text: string): boolean {
    const indicators = [
      /national\s+conference/i,
      /national\s+committee/i,
      /national\s+organization/i,
      /across\s+the\s+country/i,
      /nationwide/i
    ];
    return indicators.some(pattern => pattern.test(text));
  },

  checkInternationalCollaboration(text: string): boolean {
    const indicators = [
      /international\s+collaboration/i,
      /international\s+partner/i,
      /collaborated\s+with.*\b[A-Z][a-z]+\s+University\b.*\b[A-Z]{2,3}\b/,
      /joint\s+research.*\b[A-Z][a-z]+\s+University\b.*\b[A-Z]{2,3}\b/
    ];
    return indicators.some(pattern => pattern.test(text));
  },

  checkInterdisciplinaryWork(text: string): boolean {
    const indicators = [
      /interdisciplinary/i,
      /cross-disciplinary/i,
      /multiple\s+disciplines/i,
      /collaboration\s+(?:with|between)\s+\w+\s+and\s+\w+\s+departments/i
    ];
    return indicators.some(pattern => pattern.test(text));
  },

  async validateLeadership(
    sections: SectionMetrics[],
    minLeadershipRoles: number
  ): Promise<void> {
    const text = sections.map(s => s.content.map(el => el.text).join(' ')).join(' ');
    const leadershipRoles = this.countLeadershipRoles(text);

    if (leadershipRoles < minLeadershipRoles) {
      throw createPDFValidationError(
        'leadership',
        'academic.leadership',
        `At least ${minLeadershipRoles} leadership roles`,
        `${leadershipRoles} roles found`
      );
    }
  },

  countLeadershipRoles(text: string): number {
    const leadershipPatterns = [
      /chair(?:ed|ing)?\s+(?:of|the)/i,
      /director\s+of/i,
      /head\s+of/i,
      /led\s+(?:the|a)/i,
      /coordinator\s+of/i,
      /founded/i,
      /established/i
    ];

    return leadershipPatterns.reduce((count, pattern) => 
      count + (text.match(pattern) || []).length, 0
    );
  },

  async validateForInstitutionType(
    doc: PDFDocument,
    sections: SectionMetrics[],
    institutionType: keyof InstitutionTypeRequirements,
    careerStage: keyof CareerStageRequirements
  ): Promise<ValidationReport> {
    const requirements = this.getInstitutionRequirements(institutionType, careerStage);
    const details: ValidationReport['details'] = [];
    let score = 0;

    // Validate base requirements
    const baseResult = await this.validateForRank(doc, sections, this.mapCareerStageToRank(careerStage));
    if (!baseResult.isValid) {
      details.push(...baseResult.errors.map(error => ({
        category: error.type,
        status: 'fail',
        message: error.message
      })));
    }

    // Validate institution-specific requirements
    const institutionResult = await this.validateInstitutionSpecifics(
      sections,
      institutionType,
      requirements
    );

    details.push(...institutionResult.details);
    score = this.calculateValidationScore(details);

    return {
      summary: this.generateValidationSummary(institutionType, careerStage, score),
      details,
      score
    };
  },

  async validateInstitutionSpecifics(
    sections: SectionMetrics[],
    institutionType: keyof InstitutionTypeRequirements,
    requirements: CareerStageRequirements[keyof CareerStageRequirements]
  ): Promise<{ details: ValidationReport['details'] }> {
    const details: ValidationReport['details'] = [];

    // Teaching focus for PUIs and liberal arts
    if (institutionType === 'pui' || institutionType === 'liberal') {
      const teachingSection = sections.find(s => s.title.text === 'Teaching');
      if (teachingSection) {
        const hasTeachingPhilosophy = teachingSection.content.some(el => 
          /teaching\s+philosophy|pedagogical\s+approach/i.test(el.text || '')
        );
        
        details.push({
          category: 'teaching',
          status: hasTeachingPhilosophy ? 'pass' : 'warning',
          message: hasTeachingPhilosophy 
            ? 'Teaching philosophy well articulated'
            : 'Consider adding explicit teaching philosophy statement',
          recommendations: hasTeachingPhilosophy ? undefined : [
            'Add a teaching philosophy section',
            'Discuss pedagogical approaches',
            'Include student-centered learning examples'
          ]
        });
      }
    }

    // Research focus for R1/R2
    if (institutionType === 'r1' || institutionType === 'r2') {
      const researchSection = sections.find(s => s.title.text === 'Research');
      if (researchSection) {
        const hasFundingStrategy = researchSection.content.some(el =>
          /funding\s+strategy|research\s+agenda|future\s+directions/i.test(el.text || '')
        );

        details.push({
          category: 'research',
          status: hasFundingStrategy ? 'pass' : 'warning',
          message: hasFundingStrategy
            ? 'Research agenda and funding strategy present'
            : 'Consider adding future research directions and funding strategy',
          recommendations: hasFundingStrategy ? undefined : [
            'Add a research agenda section',
            'Outline funding strategy',
            'Discuss future research directions'
          ]
        });
      }
    }

    return { details };
  },

  getInstitutionRequirements(
    institutionType: keyof InstitutionTypeRequirements,
    careerStage: keyof CareerStageRequirements
  ): any {
    const institutionRequirements: InstitutionTypeRequirements = {
      r1: {
        earlyCareer: {
          yearsPostPhD: 0,
          minPublications: 5,
          minCitations: 20,
          teachingLoad: 3
        },
        midCareer: {
          yearsPostPhD: 5,
          minPublications: 15,
          minCitations: 100,
          teachingLoad: 4,
          serviceLoad: 3
        },
        senior: {
          yearsPostPhD: 10,
          minPublications: 30,
          minCitations: 500,
          teachingLoad: 4,
          serviceLoad: 5,
          leadershipRoles: 3
        }
      },
      r2: {
        earlyCareer: {
          yearsPostPhD: 0,
          minPublications: 3,
          minCitations: 10,
          teachingLoad: 4
        },
        midCareer: {
          yearsPostPhD: 6,
          minPublications: 12,
          minCitations: 50,
          teachingLoad: 5,
          serviceLoad: 3
        },
        senior: {
          yearsPostPhD: 12,
          minPublications: 20,
          minCitations: 200,
          teachingLoad: 5,
          serviceLoad: 5,
          leadershipRoles: 2
        }
      },
      pui: {
        earlyCareer: {
          yearsPostPhD: 0,
          minPublications: 1,
          minCitations: 5,
          teachingLoad: 6
        },
        midCareer: {
          yearsPostPhD: 6,
          minPublications: 5,
          minCitations: 20,
          teachingLoad: 7,
          serviceLoad: 4
        },
        senior: {
          yearsPostPhD: 12,
          minPublications: 10,
          minCitations: 50,
          teachingLoad: 7,
          serviceLoad: 6,
          leadershipRoles: 2
        }
      },
      liberal: {
        earlyCareer: {
          yearsPostPhD: 0,
          minPublications: 1,
          minCitations: 0,
          teachingLoad: 7
        },
        midCareer: {
          yearsPostPhD: 6,
          minPublications: 3,
          minCitations: 10,
          teachingLoad: 8,
          serviceLoad: 5
        },
        senior: {
          yearsPostPhD: 15,
          minPublications: 7,
          minCitations: 30,
          teachingLoad: 8,
          serviceLoad: 7,
          leadershipRoles: 3
        }
      }
    };

    return institutionRequirements[institutionType][careerStage];
  },

  mapCareerStageToRank(
    stage: keyof CareerStageRequirements
  ): keyof AcademicRankRequirements {
    const mapping: Record<keyof CareerStageRequirements, keyof AcademicRankRequirements> = {
      earlyCareer: 'assistant',
      midCareer: 'associate',
      senior: 'full'
    };
    return mapping[stage];
  },

  calculateValidationScore(details: ValidationReport['details']): number {
    const weights = {
      pass: 1,
      warning: 0.5,
      fail: 0
    };

    const totalWeight = details.length;
    if (totalWeight === 0) return 100; // Perfect score if no validation points
    
    const weightedSum = details.reduce((sum, detail) => 
      sum + weights[detail.status], 0
    );

    return (weightedSum / totalWeight) * 100;
  },

  generateValidationSummary(
    institutionType: keyof InstitutionTypeRequirements,
    careerStage: keyof CareerStageRequirements,
    score: number
  ): string {
    const scoreCategory = score >= 90 ? 'Excellent' :
                         score >= 80 ? 'Strong' :
                         score >= 70 ? 'Adequate' :
                         'Needs Improvement';

    return `CV Evaluation for ${institutionType.toUpperCase()} Institution (${careerStage})\n` +
           `Overall Assessment: ${scoreCategory} (${score.toFixed(1)}%)\n` +
           `Institution Type: ${this.getInstitutionDescription(institutionType)}`;
  },

  getInstitutionDescription(type: keyof InstitutionTypeRequirements): string {
    const descriptions: Record<keyof InstitutionTypeRequirements, string> = {
      r1: 'Research-intensive university with very high research activity',
      r2: 'Research university with high research activity',
      pui: 'Primarily undergraduate institution with teaching focus',
      liberal: 'Liberal arts college with emphasis on undergraduate education'
    };
    return descriptions[type];
  },

  countPublications(sections: SectionMetrics[]): number {
    const publicationSection = sections.find(s => s.title.text === 'Publications');
    if (!publicationSection) return 0;
    
    return publicationSection.content.filter(el => 
      this.isPublicationEntry(el.text || '')
    ).length;
  },

  async validateComprehensive(
    doc: PDFDocument,
    sections: SectionMetrics[],
    options: {
      institutionType: keyof InstitutionTypeRequirements;
      careerStage: keyof CareerStageRequirements;
      customRequirements?: Partial<CareerStageRequirements[keyof CareerStageRequirements]>;
      patterns?: {
        nationalPresence?: boolean;
        internationalCollaboration?: boolean;
        interdisciplinary?: boolean;
        studentMentorship?: boolean;
      };
      context?: {
        emeritusTransition?: boolean;
        administrativeRole?: boolean;
        jointAppointment?: boolean;
        clinicalFocus?: boolean;
      };
    }
  ): Promise<ValidationReport & { recommendations: string[] }> {
    const errors: ValidationError[] = [];
    const validationContext = new ValidationContext();

    try {
      // Run institution-specific validation
      const institutionReport = await this.validateForInstitutionType(
        doc,
        sections,
        options.institutionType,
        options.careerStage
      );
      validationContext.addResults('institution', institutionReport);

      // Check common patterns if requested 
      if (options.patterns) {
        const patternResult = this.validateCommonPatterns(sections, options.patterns);
        validationContext.addResults('patterns', patternResult);
      }

      // Apply context-specific adjustments
      if (options.context) {
        this.applyContextualAdjustments(validationContext, options.context);
      }

      // Apply custom requirements if provided
      if (options.customRequirements) {
        this.validateCustomRequirements(
          sections,
          options.customRequirements,
          validationContext
        );
      }

      return this.generateComprehensiveReport(validationContext);

    } catch (error) {
      console.error('Comprehensive validation error:', error);
      throw error;
    }
  },

  applyContextualAdjustments(
    context: ValidationContext,
    specialContext: Record<string, boolean>
  ): void {
    if (specialContext.emeritusTransition) {
      // Reduce publication requirements for emeritus transition
      context.addAdjustment('publications', 0.7);
      context.addAdjustment('grants', 0.7);
    }

    if (specialContext.administrativeRole) {
      // Adjust teaching and research expectations for administrative roles
      context.addAdjustment('teaching', 0.8);
      context.addAdjustment('research', 0.8);
      context.addAdjustment('service', 1.2);
    }

    if (specialContext.jointAppointment) {
      // Adjust expectations for split appointments
      context.addAdjustment('teaching', 0.5);
      context.addAdjustment('research', 0.5);
      context.addAdjustment('service', 0.5);
    }

    if (specialContext.clinicalFocus) {
      // Adjust for clinical faculty focus
      context.addAdjustment('publications', 0.7);
      context.addAdjustment('teaching', 1.2);
      context.addAdjustment('service', 1.1);
    }
  },

  validateCustomRequirements(
    sections: SectionMetrics[],
    requirements: Partial<CareerStageRequirements[keyof CareerStageRequirements]>,
    context: ValidationContext
  ): void {
    if (requirements.minPublications !== undefined) {
      const publicationCount = this.countPublications(sections);
      const adjustedRequirement = context.getAdjustedScore(
        'publications',
        requirements.minPublications
      );
      
      if (publicationCount < adjustedRequirement) {
        throw createPDFValidationError(
          'custom',
          'publications.count',
          `At least ${adjustedRequirement} publications`,
          `${publicationCount} publications found`
        );
      }
    }

    // Similarly check other custom requirements...
  },

  generateComprehensiveReport(
    context: ValidationContext
  ): ValidationReport & { recommendations: string[] } {
    const results = context.getAllResults();
    const recommendations: string[] = [];
    
    // Generate category-specific recommendations
    Object.entries(results).forEach(([category, result]) => {
      if (category === 'institution' && result.score < 80) {
        recommendations.push(
          'Consider strengthening institutional fit by:',
          ...this.getInstitutionalRecommendations(result)
        );
      }

      if (category === 'patterns' && !result.isValid) {
        recommendations.push(
          'Address missing academic patterns:',
          ...this.getPatternRecommendations(result)
        );
      }
    });

    return {
      ...results.institution,
      recommendations: recommendations.filter(Boolean)
    };
  },

  getInstitutionalRecommendations(
    result: ValidationReport
  ): string[] {
    return result.details
      .filter(detail => detail.status !== 'pass')
      .map(detail => {
        switch (detail.category) {
          case 'teaching':
            return '- Enhance teaching portfolio with more evidence of effectiveness';
          case 'research':
            return '- Strengthen research impact and funding strategy';
          case 'service':
            return '- Increase service contributions at department/institution level';
          default:
            return `- Address ${detail.category} requirements`;
        }
      });
  },

  getPatternRecommendations(
    result: ValidationResult
  ): string[] {
    return result.errors.map(error => {
      switch (error.field) {
        case 'national_presence':
          return '- Seek opportunities for national visibility in your field';
        case 'international_collaboration':
          return '- Develop international research collaborations';
        case 'interdisciplinary':
          return '- Engage in more cross-disciplinary projects';
        case 'student_mentorship':
          return '- Document student mentorship activities more explicitly';
        default:
          return `- Address ${error.field.replace(/_/g, ' ')}`;
      }
    });
  },

  async validateEdgeCases(
    sections: SectionMetrics[],
    context: {
      postponedTenure?: boolean;
      interdisciplinaryAppointment?: boolean;
      researchLeave?: { duration: number; year: number };
      covid19Period?: boolean;
    }
  ): Promise<DetailedValidationError[]> {
    const errors: DetailedValidationError[] = [];

    // Validate COVID-19 impact period if applicable
    if (context.covid19Period) {
      errors.push(...await this.validateCOVIDImpact(sections));
    }

    // Validate research leave periods
    if (context.researchLeave) {
      errors.push(...await this.validateResearchLeave(
        sections,
        context.researchLeave
      ));
    }

    // Handle interdisciplinary appointments
    if (context.interdisciplinaryAppointment) {
      errors.push(...await this.validateInterdisciplinaryMetrics(sections));
    }

    return errors;
  },

  async validateCOVIDImpact(
    sections: SectionMetrics[]
  ): Promise<DetailedValidationError[]> {
    const errors: DetailedValidationError[] = [];
    const covid19Period = { start: 2020, end: 2022 };

    // Check for COVID-19 impact statement
    const hasImpactStatement = sections.some(section =>
      section.content.some(el => 
        /covid-19|pandemic|remote teaching/i.test(el.text || '')
      )
    );

    if (!hasImpactStatement) {
      errors.push({
        type: 'context',
        field: 'covid19.impact',
        message: 'Missing COVID-19 impact statement',
        severity: 'minor',
        suggestion: 'Consider adding a brief statement about adaptations during COVID-19'
      });
    }

    // Analyze publication patterns during COVID
    const publicationSection = sections.find(s => s.title.text === 'Publications');
    if (publicationSection) {
      const covidPeriodPubs = this.countPublicationsByYearRange(
        publicationSection,
        covid19Period.start,
        covid19Period.end
      );

      if (covidPeriodPubs === 0) {
        errors.push({
          type: 'context',
          field: 'covid19.publications',
          message: 'No publications during COVID-19 period',
          severity: 'minor',
          suggestion: 'Document research adaptations during the pandemic period'
        });
      }
    }

    return errors;
  },

  async validateResearchLeave(
    sections: SectionMetrics[],
    leave: { duration: number; year: number }
  ): Promise<DetailedValidationError[]> {
    const errors: DetailedValidationError[] = [];
    const leaveYearPublications = this.countPublicationsByYearRange(
      sections.find(s => s.title.text === 'Publications'),
      leave.year,
      leave.year + leave.duration
    );

    // Expect increased productivity during research leave
    const expectedPublications = Math.ceil(leave.duration * 2);
    if (leaveYearPublications < expectedPublications) {
      errors.push({
        type: 'productivity',
        field: 'research.leave',
        message: `Lower than expected productivity during research leave`,
        severity: 'major',
        suggestion: 'Document specific research outputs from leave period',
        context: {
          expected: expectedPublications,
          actual: leaveYearPublications,
          period: `${leave.year}-${leave.year + leave.duration}`
        }
      });
    }

    return errors;
  },

  async validateInterdisciplinaryMetrics(
    sections: SectionMetrics[]
  ): Promise<DetailedValidationError[]> {
    const errors: DetailedValidationError[] = [];
    const researchSection = sections.find(s => s.title.text === 'Research');

    if (researchSection) {
      // Check for cross-disciplinary collaboration indicators
      const hasCollaboration = researchSection.content.some(el =>
        /collaboration|joint|cross-disciplinary|multi-disciplinary/i.test(el.text || '')
      );

      if (!hasCollaboration) {
        errors.push({
          type: 'interdisciplinary',
          field: 'research.collaboration',
          message: 'Limited evidence of cross-disciplinary work',
          severity: 'major',
          suggestion: 'Highlight interdisciplinary aspects of research projects'
        });
      }

      // Check for multiple discipline keywords
      const disciplineCount = this.countUniqueFields(researchSection);
      if (disciplineCount < 2) {
        errors.push({
          type: 'interdisciplinary',
          field: 'research.fields',
          message: 'Limited representation of multiple fields',
          severity: 'major',
          suggestion: 'Explicitly mention contributions to different disciplines'
        });
      }
    }

    return errors;
  },

  countPublicationsByYearRange(
    section: SectionMetrics | undefined,
    startYear: number,
    endYear: number
  ): number {
    if (!section) return 0;

    return section.content.filter(el => {
      const yearMatch = el.text?.match(/\b(20\d{2})\b/);
      if (!yearMatch) return false;
      
      const year = parseInt(yearMatch[1], 10);
      return year >= startYear && year <= endYear;
    }).length;
  },

  countUniqueFields(section: SectionMetrics): number {
    const fieldKeywords = new Set<string>();
    const text = section.content.map(el => el.text).join(' ');
    
    // Common academic field keywords
    const fieldPatterns = [
      /computer science/i,
      /engineering/i,
      /mathematics/i,
      /physics/i,
      /chemistry/i,
      /biology/i,
      /psychology/i,
      /sociology/i,
      /economics/i,
      /literature/i,
      /history/i,
      /philosophy/i
    ];

    fieldPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        fieldKeywords.add(pattern.source);
      }
    });

    return fieldKeywords.size;
  },

  // Note: The following hierarchy validation methods require additional implementation
  // of validatePublicationHierarchy, validateResearchHierarchy, validateTeachingHierarchy,
  // and validateServiceHierarchy methods which aren't shown here.
  
  async validateWithHierarchy(
    doc: PDFDocument,
    sections: SectionMetrics[],
    options: {
      institutionType: keyof InstitutionTypeRequirements;
      careerStage: keyof CareerStageRequirements;
      context?: {
        emeritusTransition?: boolean;
        administrativeRole?: boolean;
        jointAppointment?: boolean;
        clinicalFocus?: boolean;
      };
    }
  ): Promise<HierarchicalValidationResult> {
    const allErrors: DetailedValidationError[] = [];
    const sectionResults: Map<string, DetailedValidationError[]> = new Map();
    const subsectionResults: Map<string, Map<string, DetailedValidationError[]>> = new Map();

    // Validate each major section
    for (const section of sections) {
      const sectionErrors: DetailedValidationError[] = [];
      
      try {
        // These methods need to be implemented separately
        switch (section.title.text) {
          case 'Publications':
            // await this.validatePublicationHierarchy(section, options, sectionErrors);
            break;
          case 'Research':
            // await this.validateResearchHierarchy(section, options, sectionErrors);
            break;
          case 'Teaching':
            // await this.validateTeachingHierarchy(section, options, sectionErrors);
            break;
          case 'Service':
            // await this.validateServiceHierarchy(section, options, sectionErrors);
            break;
        }
      } catch (error) {
        if (error instanceof Error) {
          sectionErrors.push({
            type: 'validation',
            field: `${section.title.text.toLowerCase()}.general`,
            message: error.message,
            severity: 'critical',
            suggestion: 'Check section formatting and content requirements'
          });
        }
      }

      sectionResults.set(section.title.text, sectionErrors);
      allErrors.push(...sectionErrors);
    }

    const summary = this.generateValidationSummary(allErrors, options);
    const details = this.organizeValidationDetails(sectionResults, subsectionResults);

    return {
      isValid: allErrors.length === 0,
      summary,
      details
    };
  },

  generateValidationSummary(
    errors: DetailedValidationError[],
    options: any
  ): ValidationSummary {
    const severityBreakdown = {
      critical: errors.filter(e => e.severity === 'critical').length,
      major: errors.filter(e => e.severity === 'major').length,
      minor: errors.filter(e => e.severity === 'minor').length
    };

    const sectionScores: Record<string, { score: number; issues: DetailedValidationError[] }> = {};
    const sectionErrors = this.groupErrorsBySection(errors);

    for (const [section, sectionIssues] of Object.entries(sectionErrors)) {
      sectionScores[section] = {
        score: this.calculateSectionScore(sectionIssues),
        issues: sectionIssues
      };
    }

    const overallScore = this.calculateOverallScore(sectionScores);
    const recommendations = this.generateDetailedRecommendations(errors, options);

    return {
      isValid: errors.length === 0,
      score: overallScore,
      severityBreakdown,
      sectionScores,
      recommendations
    };
  },

  calculateSectionScore(errors: DetailedValidationError[]): number {
    const weights = {
      critical: 1.0,
      major: 0.7,
      minor: 0.3
    };

    const weightedErrors = errors.reduce((sum, error) => 
      sum + weights[error.severity], 0
    );

    return Math.max(0, 100 - (weightedErrors * 20));
  },

  calculateOverallScore(
    sectionScores: Record<string, { score: number; issues: DetailedValidationError[] }>
  ): number {
    const weights = {
      Publications: 0.3,
      Research: 0.3,
      Teaching: 0.25,
      Service: 0.15
    };

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [section, data] of Object.entries(sectionScores)) {
      const weight = weights[section as keyof typeof weights] || 0.1;
      weightedScore += data.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  },

  generateDetailedRecommendations(
    errors: DetailedValidationError[],
    options: any
  ): string[] {
    const recommendations: string[] = [];
    const criticalIssues = errors.filter(e => e.severity === 'critical');
    const majorIssues = errors.filter(e => e.severity === 'major');
    const minorIssues = errors.filter(e => e.severity === 'minor');

    if (criticalIssues.length > 0) {
      recommendations.push('Critical Issues to Address:');
      recommendations.push(...criticalIssues.map(e => `- ${e.suggestion || e.message}`));
    }

    if (majorIssues.length > 0) {
      recommendations.push('\nMajor Improvements Needed:');
      recommendations.push(...majorIssues.map(e => `- ${e.suggestion || e.message}`));
    }

    if (minorIssues.length > 0) {
      recommendations.push('\nSuggested Enhancements:');
      recommendations.push(...minorIssues.map(e => `- ${e.suggestion || e.message}`));
    }

    // Add context-specific recommendations
    if (options.context) {
      recommendations.push('\nContext-Specific Recommendations:');
      if (options.context.emeritusTransition) {
        recommendations.push('- Consider highlighting legacy achievements and mentorship impact');
      }
      if (options.context.administrativeRole) {
        recommendations.push('- Emphasize leadership and administrative accomplishments');
      }
      // Add more context-specific recommendations as needed
    }

    return recommendations;
  },

  organizeValidationDetails(
    sectionResults: Map<string, DetailedValidationError[]>,
    subsectionResults: Map<string, Map<string, DetailedValidationError[]>>
  ): HierarchicalValidationResult['details'] {
    return Array.from(sectionResults.entries()).map(([section, errors]) => {
      const subsections = subsectionResults.get(section);
      return {
        section,
        errors,
        subsections: subsections ? 
          Array.from(subsections.entries()).map(([name, errors]) => ({
            name,
            errors
          })) : 
          undefined
      };
    });
  },

  groupErrorsBySection(
    errors: DetailedValidationError[]
  ): Record<string, DetailedValidationError[]> {
    return errors.reduce((groups, error) => {
      const section = error.field.split('.')[0];
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(error);
      return groups;
    }, {} as Record<string, DetailedValidationError[]>);
  },

  // Implementation of the missing hierarchical validation methods
  async validatePublicationHierarchy(
    section: SectionMetrics,
    options: any,
    errors: DetailedValidationError[]
  ): Promise<void> {
    // Check publication categories
    const categories = this.identifyPublicationCategories(section);
    if (!categories.has('peer_reviewed') && !categories.has('journal')) {
      errors.push({
        type: 'structure',
        field: 'publications.categories',
        message: 'Missing clear publication categories',
        severity: 'major',
        suggestion: 'Organize publications by type (e.g., peer-reviewed, conference proceedings)'
      });
    }

    // Validate citation formatting within each category
    for (const [category, entries] of categories.entries()) {
      // Note: validateCategoryEntries would need to be implemented
      // await this.validateCategoryEntries(category, entries, errors);
    }

    // Check for research impact indicators
    // Note: validateImpactIndicators would need to be implemented
    // await this.validateImpactIndicators(section, errors);
  },

  async validateResearchHierarchy(
    section: SectionMetrics,
    options: any,
    errors: DetailedValidationError[]
  ): Promise<void> {
    // Validate research areas
    // Note: identifyResearchAreas would need to be implemented
    const researchAreas = new Set<string>(); // this.identifyResearchAreas(section);
    if (researchAreas.size < 2) {
      errors.push({
        type: 'content',
        field: 'research.areas',
        message: 'Limited research areas identified',
        severity: 'major',
        suggestion: 'Clearly define multiple research focus areas'
      });
    }

    // Check for funding and grant information
    // Note: validateFundingInfo would need to be implemented
    // await this.validateFundingInfo(section, errors);

    // Validate research outcomes and impact
    await this.validateResearchOutcomes(section, errors);
  },

  async validateTeachingHierarchy(
    section: SectionMetrics,
    options: any,
    errors: DetailedValidationError[]
  ): Promise<void> {
    // Check course levels and variety
    const courseLevels = this.identifyCourseLevels(section);
    if (options.institutionType === 'r1' && !courseLevels.has('graduate')) {
      errors.push({
        type: 'content',
        field: 'teaching.levels',
        message: 'No graduate-level teaching experience',
        severity: 'major',
        suggestion: 'Include graduate course teaching experience'
      });
    }

    // Validate teaching effectiveness metrics
    await this.validateTeachingEffectiveness(section, errors);

    // Check for mentorship and supervision
    // Note: validateMentorship would need to be implemented
    // await this.validateMentorship(section, errors);
  },

  async validateServiceHierarchy(
    section: SectionMetrics,
    options: any,
    errors: DetailedValidationError[]
  ): Promise<void> {
    // Check service levels (department, college, university, professional)
    const serviceLevels = this.identifyServiceLevels(section);
    const requiredLevels = ['department', 'college', 'professional'];
    
    for (const level of requiredLevels) {
      if (!serviceLevels.has(level)) {
        errors.push({
          type: 'content',
          field: `service.${level}`,
          message: `Missing ${level}-level service`,
          severity: 'minor',
          suggestion: `Include service activities at the ${level} level`
        });
      }
    }

    // Validate leadership roles
    // Note: validateLeadershipRoles would need to be implemented
    // await this.validateLeadershipRoles(section, errors);
  },

  identifyPublicationCategories(
    section: SectionMetrics
  ): Map<string, ElementMetrics[]> {
    const categories = new Map<string, ElementMetrics[]>();
    let currentCategory = '';
    let currentElements: ElementMetrics[] = [];

    for (const element of section.content) {
      const text = element.text || '';
      
      // Detect category headers
      if (this.isPublicationCategoryHeader(text)) {
        if (currentCategory && currentElements.length > 0) {
          categories.set(currentCategory, currentElements);
        }
        currentCategory = this.normalizePublicationCategory(text);
        currentElements = [];
      } else if (currentCategory) {
        currentElements.push(element);
      }
    }

    // Don't forget the last category
    if (currentCategory && currentElements.length > 0) {
      categories.set(currentCategory, currentElements);
    }

    return categories;
  },

  isPublicationCategoryHeader(text: string): boolean {
    const categoryPatterns = [
      /^peer[- ]reviewed/i,
      /^journal publications/i,
      /^conference proceedings/i,
      /^book chapters/i,
      /^invited publications/i
    ];
    return categoryPatterns.some(pattern => pattern.test(text));
  },

  normalizePublicationCategory(text: string): string {
    text = text.toLowerCase().trim();
    if (text.includes('peer') && text.includes('review')) return 'peer_reviewed';
    if (text.includes('journal')) return 'journal';
    if (text.includes('conference')) return 'conference';
    if (text.includes('book')) return 'book';
    if (text.includes('invited')) return 'invited';
    return 'other';
  },

  async validateResearchOutcomes(
    section: SectionMetrics,
    errors: DetailedValidationError[]
  ): Promise<void> {
    const text = section.content.map(el => el.text).join(' ');
    
    // Check for research outcomes
    const hasOutcomes = /outcomes?|results?|findings?|impact/i.test(text);
    if (!hasOutcomes) {
      errors.push({
        type: 'content',
        field: 'research.outcomes',
        message: 'Research outcomes not clearly stated',
        severity: 'major',
        suggestion: 'Include specific research outcomes and their impact'
      });
    }

    // Check for future directions
    const hasFuture = /future|ongoing|planned|proposed/i.test(text);
    if (!hasFuture) {
      errors.push({
        type: 'content',
        field: 'research.future',
        message: 'Future research directions not specified',
        severity: 'minor',
        suggestion: 'Include plans for future research directions'
      });
    }
  },

  identifyCourseLevels(section: SectionMetrics): Set<string> {
    const levels = new Set<string>();
    const text = section.content.map(el => el.text).join(' ');

    if (/\b[1-2]\d{2}\b/.test(text)) levels.add('lower_division');
    if (/\b[3-4]\d{2}\b/.test(text)) levels.add('upper_division');
    if (/\b[5-9]\d{2}\b/.test(text)) levels.add('graduate');

    return levels;
  },

  async validateTeachingEffectiveness(
    section: SectionMetrics,
    errors: DetailedValidationError[]
  ): Promise<void> {
    const text = section.content.map(el => el.text).join(' ');

    // Check for quantitative metrics
    const hasMetrics = /rating|score|evaluation|assessment/i.test(text);
    if (!hasMetrics) {
      errors.push({
        type: 'content',
        field: 'teaching.metrics',
        message: 'Teaching effectiveness metrics not provided',
        severity: 'major',
        suggestion: 'Include quantitative teaching evaluation metrics'
      });
    }

    // Check for qualitative feedback
    const hasFeedback = /feedback|comment|review|testimonial/i.test(text);
    if (!hasFeedback) {
      errors.push({
        type: 'content',
        field: 'teaching.feedback',
        message: 'Qualitative teaching feedback not included',
        severity: 'minor',
        suggestion: 'Consider including qualitative student/peer feedback'
      });
    }
  },

  identifyServiceLevels(section: SectionMetrics): Set<string> {
    const levels = new Set<string>();
    const text = section.content.map(el => el.text).join(' ');

    if (/department|program/i.test(text)) levels.add('department');
    if (/college|school/i.test(text)) levels.add('college');
    if (/university|institution/i.test(text)) levels.add('university');
    if (/profession|discipline|field/i.test(text)) levels.add('professional');
    if (/community|public|outreach/i.test(text)) levels.add('community');

    return levels;
  },

  async validateCategoryEntries(
    category: string,
    entries: ElementMetrics[],
    errors: DetailedValidationError[]
  ): Promise<void> {
    const format = category === 'conference' ? 'conference' :
                  category === 'journal' ? 'apa' : 'chicago';

    for (const entry of entries) {
      try {
        this.validatePublicationFormat(entry.text || '', format);
      } catch (error) {
        errors.push({
          type: 'format',
          field: `publications.${category}.format`,
          message: `Invalid ${category} entry format`,
          severity: 'major',
          suggestion: `Use ${format.toUpperCase()} format for ${category} entries`,
          context: {
            entry: entry.text,
            format
          }
        });
      }

      // Check for required fields based on category
      const missingFields = this.checkRequiredFields(category, entry.text || '');
      if (missingFields.length > 0) {
        errors.push({
          type: 'content',
          field: `publications.${category}.fields`,
          message: `Missing required fields in ${category} entry`,
          severity: 'major',
          suggestion: `Include ${missingFields.join(', ')} in entry`,
          context: {
            entry: entry.text,
            missingFields
          }
        });
      }
    }
  },

  checkRequiredFields(category: string, text: string): string[] {
    const requiredFields: Record<string, string[]> = {
      journal: ['authors', 'year', 'title', 'journal', 'volume'],
      conference: ['authors', 'year', 'title', 'conference', 'location'],
      book: ['authors', 'year', 'title', 'publisher'],
      invited: ['venue', 'date', 'title']
    };

    const missing: string[] = [];
    const fields = requiredFields[category] || [];

    for (const field of fields) {
      switch (field) {
        case 'authors':
          if (!this.hasAuthors(text)) missing.push('authors');
          break;
        case 'year':
          if (!this.hasYear(text)) missing.push('year');
          break;
        case 'title':
          if (!this.hasTitle(text)) missing.push('title');
          break;
        case 'journal':
          if (!this.hasJournal(text)) missing.push('journal name');
          break;
        case 'volume':
          if (!this.hasVolume(text)) missing.push('volume number');
          break;
        case 'conference':
          if (!this.hasConference(text)) missing.push('conference name');
          break;
        case 'location':
          if (!this.hasLocation(text)) missing.push('location');
          break;
        case 'publisher':
          if (!this.hasPublisher(text)) missing.push('publisher');
          break;
        case 'venue':
          if (!this.hasVenue(text)) missing.push('venue');
          break;
        case 'date':
          if (!this.hasDate(text)) missing.push('date');
          break;
      }
    }

    return missing;
  },

  hasAuthors(text: string): boolean {
    return /[A-Z][a-z]+,\s+([A-Z]\.\s*)+/.test(text);
  },

  hasYear(text: string): boolean {
    return /\(\d{4}\)/.test(text) || /\b20\d{2}\b/.test(text);
  },

  hasTitle(text: string): boolean {
    return /[""]([^""])+[""]/.test(text) || /["""]([^"""])+["""]/.test(text);
  },

  hasJournal(text: string): boolean {
    return /[A-Z][a-zA-Z\s&]+,/.test(text) || /Journal of/.test(text);
  },

  hasVolume(text: string): boolean {
    return /vol\.\s*\d+/i.test(text) || /\d+\s*\(\d+\)/.test(text);
  },

  hasConference(text: string): boolean {
    return /proceedings? of|conference on|symposium on/i.test(text);
  },

  hasLocation(text: string): boolean {
    return /[A-Z][a-z]+,\s+[A-Z]{2}/.test(text) || /[A-Z][a-z]+,\s+[A-Z][a-z]+/.test(text);
  },

  hasPublisher(text: string): boolean {
    return /press|publications?|publishing|books/i.test(text);
  },

  hasVenue(text: string): boolean {
    return /university|institute|center|department of/i.test(text);
  },

  hasDate(text: string): boolean {
    return /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}/.test(text) ||
           /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}/.test(text);
  }
};
