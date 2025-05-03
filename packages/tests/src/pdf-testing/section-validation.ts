import type { CVData } from '@dzb-cv/types';
import { createPDFValidationError } from './validation-error';

interface SectionValidationOptions {
  required?: boolean;
  order?: number;
  minItems?: number;
  maxItems?: number;
}

export class CVSectionValidator {
  private validators: Map<string, (data: any, options?: SectionValidationOptions) => boolean>;

  constructor() {
    this.validators = new Map();
    this.initializeValidators();
  }

  private initializeValidators() {
    this.validators.set('experience', this.validateExperience.bind(this));
    this.validators.set('education', this.validateEducation.bind(this));
    this.validators.set('skills', this.validateSkills.bind(this));
    this.validators.set('publications', this.validatePublications.bind(this));
  }

  validateSection(
    sectionName: string,
    data: any,
    options?: SectionValidationOptions
  ): void {
    const validator = this.validators.get(sectionName);
    if (!validator) {
      throw new Error(`No validator found for section: ${sectionName}`);
    }

    if (!validator(data, options)) {
      throw createPDFValidationError(
        sectionName,
        `Valid ${sectionName} section`,
        'Invalid section content'
      );
    }
  }

  private validateExperience(
    experiences: CVData['experience'],
    options?: SectionValidationOptions
  ): boolean {
    if (!experiences?.length) {
      return !options?.required;
    }

    if (options?.minItems && experiences.length < options.minItems) {
      return false;
    }

    return experiences.every(exp => 
      exp.employer &&
      exp.position &&
      exp.startDate &&
      exp.responsibilities?.length > 0
    );
  }

  private validateEducation(
    education: CVData['education'],
    options?: SectionValidationOptions
  ): boolean {
    if (!education?.length) {
      return !options?.required;
    }

    return education.every(edu =>
      edu.institution &&
      edu.degree &&
      edu.field &&
      edu.graduationDate
    );
  }

  private validateSkills(
    skills: CVData['skills'],
    options?: SectionValidationOptions
  ): boolean {
    if (!skills?.length) {
      return !options?.required;
    }

    if (options?.minItems && skills.length < options.minItems) {
      return false;
    }

    return skills.every(skill => 
      skill.name && 
      (!skill.level || ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level))
    );
  }

  private validatePublications(
    publications: CVData['publications'],
    options?: SectionValidationOptions
  ): boolean {
    if (!publications?.length) {
      return !options?.required;
    }

    return publications.every(pub =>
      pub.title &&
      pub.authors?.length > 0 &&
      pub.publisher &&
      pub.date
    );
  }
}

export const sectionValidator = new CVSectionValidator();

