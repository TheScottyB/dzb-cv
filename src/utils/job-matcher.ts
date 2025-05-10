import { dawnTemplate } from '../templates/dawn-template.js';

export interface JobData {
  responsibilities?: string[];
  educationAndExperience?: {
    requirements?: string[];
  };
  // Add additional properties as needed
}

export interface JobRequirement {
  category: string;
  requirement: string;
  importance: 'high' | 'medium' | 'low';
}

export interface MatchResult {
  requirement: string;
  matches: string[];
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

export interface ExperiencePattern {
  title: string;
  period: string;
  keyDuties: string[];
  relevance: {
    patientAccess: 'high' | 'medium' | 'low';
    supervision: 'high' | 'medium' | 'low';
    systems: 'high' | 'medium' | 'low';
  };
}

export class JobMatcher {
  private template = dawnTemplate;

  matchRequirements(jobData: JobData): MatchResult[] {
    const requirements = this.extractRequirements(jobData);
    return requirements.map((req) => this.findMatches(req));
  }

  private extractRequirements(jobData: JobData): JobRequirement[] {
    // Extract requirements from job data based on our known structure
    const requirements: JobRequirement[] = [];

    // Add requirements from responsibilities
    if (jobData.responsibilities) {
      jobData.responsibilities.forEach((resp: string) => {
        requirements.push({
          category: 'responsibilities',
          requirement: resp,
          importance: 'high',
        });
      });
    }

    // Add requirements from qualifications
    if (jobData.educationAndExperience?.requirements) {
      jobData.educationAndExperience.requirements.forEach((req: string) => {
        requirements.push({
          category: 'qualifications',
          requirement: req,
          importance: 'high',
        });
      });
    }

    return requirements;
  }

  private findMatches(requirement: JobRequirement): MatchResult {
    const matches: string[] = [];
    const evidence: string[] = [];

    // Split requirement string by comma (for multi-keyword requirements)
    const segments = requirement.requirement
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Check core strengths
    Object.entries(this.template.coreStrengths).forEach(([category, strengths]) => {
      (strengths as string[]).forEach((strength: string) => {
        for (const seg of segments) {
          if (this.isMatch(seg, strength)) {
            matches.push(strength);
            // Use matched human-readable phrase
            evidence.push(`Core strength in ${strength}`);
          }
        }
      });
    });

    // Check experience patterns
    Object.entries(this.template.experiencePatterns).forEach(([, pattern]) => {
      const expPattern = pattern as ExperiencePattern;
      expPattern.keyDuties.forEach((duty: string) => {
        for (const seg of segments) {
          if (this.isMatch(seg, duty)) {
            matches.push(duty);
            evidence.push(`Experience from ${expPattern.title} (${expPattern.period})`);
            break;
          }
        }
      });
    });

    return {
      requirement: requirement.requirement,
      matches,
      confidence: this.calculateConfidence(matches.length),
      evidence,
    };
  }

  private isMatch(requirement: string, potentialMatch: string): boolean {
    // Strict, trimmed, case-insensitive equality match
    return requirement.trim().toLowerCase() === potentialMatch.trim().toLowerCase();
  }

  private calculateConfidence(matchCount: number): 'high' | 'medium' | 'low' {
    if (matchCount >= 3) return 'high';
    if (matchCount >= 1) return 'medium';
    return 'low';
  }

  generateTailoredContent(matches: MatchResult[]): string {
    // Group matches by confidence level
    const groupedMatches = matches.reduce(
      (acc, match) => {
        acc[match.confidence].push(match);
        return acc;
      },
      {
        high: [] as MatchResult[],
        medium: [] as MatchResult[],
        low: [] as MatchResult[],
      }
    );

    // Format the content
    let content = '';

    // Add high confidence matches
    if (groupedMatches.high.length > 0) {
      content += '\n## Strong Matches\n';
      content += groupedMatches.high
        .map((match) => `### ${match.requirement}\n${match.evidence.join('\n')}`)
        .join('\n\n');
    }

    // Add medium confidence matches
    if (groupedMatches.medium.length > 0) {
      content += '\n## Good Matches\n';
      content += groupedMatches.medium
        .map((match) => `### ${match.requirement}\n${match.evidence.join('\n')}`)
        .join('\n\n');
    }

    return content;
  }
}
