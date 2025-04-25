import { dawnTemplate } from '../templates/dawn-template.js';

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

  matchRequirements(jobData: any): MatchResult[] {
    const requirements = this.extractRequirements(jobData);
    return requirements.map(req => this.findMatches(req));
  }

  private extractRequirements(jobData: any): JobRequirement[] {
    // Extract requirements from job data based on our known structure
    const requirements: JobRequirement[] = [];

    // Add requirements from responsibilities
    if (jobData.responsibilities) {
      jobData.responsibilities.forEach((resp: string) => {
        requirements.push({
          category: 'responsibilities',
          requirement: resp,
          importance: 'high'
        });
      });
    }

    // Add requirements from qualifications
    if (jobData.educationAndExperience?.requirements) {
      jobData.educationAndExperience.requirements.forEach((req: string) => {
        requirements.push({
          category: 'qualifications',
          requirement: req,
          importance: 'high'
        });
      });
    }

    return requirements;
  }

  private findMatches(requirement: JobRequirement): MatchResult {
    const matches: string[] = [];
    const evidence: string[] = [];

    // Check core strengths
    Object.entries(this.template.coreStrengths).forEach(([category, strengths]) => {
      (strengths as string[]).forEach((strength: string) => {
        if (this.isMatch(requirement.requirement, strength)) {
          matches.push(strength);
          evidence.push(`Core strength in ${category}`);
        }
      });
    });

    // Check experience patterns
    Object.entries(this.template.experiencePatterns).forEach(([role, pattern]) => {
      const expPattern = pattern as ExperiencePattern;
      expPattern.keyDuties.forEach((duty: string) => {
        if (this.isMatch(requirement.requirement, duty)) {
          matches.push(duty);
          evidence.push(`Experience from ${expPattern.title} (${expPattern.period})`);
        }
      });
    });

    return {
      requirement: requirement.requirement,
      matches,
      confidence: this.calculateConfidence(matches.length, requirement.importance),
      evidence
    };
  }

  private isMatch(requirement: string, potentialMatch: string): boolean {
    // Simple keyword matching - can be enhanced later
    const reqWords = requirement.toLowerCase().split(/\s+/);
    const matchWords = potentialMatch.toLowerCase().split(/\s+/);
    
    return reqWords.some(word => 
      matchWords.some(matchWord => 
        matchWord.includes(word) || word.includes(matchWord)
      )
    );
  }

  private calculateConfidence(matchCount: number, importance: 'high' | 'medium' | 'low'): 'high' | 'medium' | 'low' {
    if (matchCount >= 3) return 'high';
    if (matchCount >= 1) return 'medium';
    return 'low';
  }

  generateTailoredContent(matches: MatchResult[]): string {
    const relevantExperience = this.getRelevantExperience(matches);
    
    // Group matches by confidence level
    const highConfidence = matches.filter(m => m.confidence === 'high');
    const mediumConfidence = matches.filter(m => m.confidence === 'medium');
    
    // Format key strengths
    const keyStrengths = this.formatStrengths(highConfidence);
    
    // Format experience highlights
    const experienceHighlights = this.formatExperienceHighlights(relevantExperience);
    
    return `
# Professional Summary

With ${this.template.presentationRules.summary.years} of experience in healthcare administration and team leadership, 
I bring a proven track record of excellence in patient access management, staff supervision, and process improvement.

## Key Strengths
${keyStrengths}

## Professional Experience

### ${relevantExperience.foxLake.title} (${relevantExperience.foxLake.period})
- ${relevantExperience.foxLake.keyDuties[0]}
- ${relevantExperience.foxLake.keyDuties[1]}
- ${relevantExperience.foxLake.keyDuties[2]}

### ${relevantExperience.midwestSports.title} (${relevantExperience.midwestSports.period})
- ${relevantExperience.midwestSports.keyDuties[0]}
- ${relevantExperience.midwestSports.keyDuties[1]}
- ${relevantExperience.midwestSports.keyDuties[2]}

### ${relevantExperience.familyMedicine.title} (${relevantExperience.familyMedicine.period})
- ${relevantExperience.familyMedicine.keyDuties[0]}
- ${relevantExperience.familyMedicine.keyDuties[1]}
- ${relevantExperience.familyMedicine.keyDuties[2]}

## Additional Qualifications
${this.formatAdditionalQualifications(mediumConfidence)}
    `.trim();
  }

  private getRelevantExperience(matches: MatchResult[]) {
    return {
      foxLake: this.template.experiencePatterns.foxLake as ExperiencePattern,
      midwestSports: this.template.experiencePatterns.midwestSports as ExperiencePattern,
      familyMedicine: this.template.experiencePatterns.familyMedicine as ExperiencePattern
    };
  }

  private formatStrengths(matches: MatchResult[]): string {
    const strengths = new Set<string>();
    matches.forEach(match => {
      match.matches.forEach(m => strengths.add(m));
    });
    return Array.from(strengths)
      .map(strength => `- ${strength}`)
      .join('\n');
  }

  private formatExperienceHighlights(experience: Record<string, ExperiencePattern>): string {
    return Object.entries(experience)
      .map(([key, exp]) => `
### ${exp.title} (${exp.period})
${exp.keyDuties.slice(0, 3).map(duty => `- ${duty}`).join('\n')}
      `.trim())
      .join('\n\n');
  }

  private formatAdditionalQualifications(matches: MatchResult[]): string {
    const qualifications = new Set<string>();
    matches.forEach(match => {
      match.matches.forEach(m => qualifications.add(m));
    });
    return Array.from(qualifications)
      .map(qual => `- ${qual}`)
      .join('\n');
  }
} 