import type { 
  AcademicCVData, 
  Publication, 
  Conference, 
  Grant 
} from '../../types/academic-types.js';

interface ValidationError {
  field: string;
  message: string;
}

interface Award {
  title: string;
  organization?: string;
  year?: string;
  notes?: string;
  achievement?: string;
  description?: string;
}

/**
 * Validator for academic CV data
 */
export class AcademicCVValidator {
  validate(data: Partial<AcademicCVData>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validate required fields
    this.validateRequiredFields(data, errors);
    
    // Validate format fields
    this.validateFormatFields(data, errors);
    
    // Validate arrays if they exist
    if (data.publications) {
      this.validatePublications(data.publications, errors);
    }
    
    if (data.conferences) {
      this.validateConferences(data.conferences, errors);
    }
    
    if (data.grants) {
      this.validateGrants(data.grants, errors);
    }
    
    if (data.awards) {
      this.validateAwards(data.awards, errors);
    }
    
    return errors;
  }

  private validateRequiredFields(data: Partial<AcademicCVData>, errors: ValidationError[]): void {
    // Validate personal info

    // Name object required
    if (!data.personalInfo?.name) {
      errors.push({
        field: 'personalInfo.name',
        message: 'Name is required'
      });
    }

    // Full name required & non-empty string
    if (
      data.personalInfo?.name &&
      (typeof data.personalInfo.name.full !== 'string' || !data.personalInfo.name.full.trim())
    ) {
      errors.push({
        field: 'personalInfo.name.full',
        message: 'Full name is required'
      });
    }

    // Email required & non-empty string
    if (
      !data.personalInfo?.contact ||
      typeof data.personalInfo.contact.email !== 'string' ||
      !data.personalInfo.contact.email.trim()
    ) {
      errors.push({
        field: 'personalInfo.contact.email',
        message: 'Email is required'
      });
    }
    // Phone required & non-empty string
    if (
      !data.personalInfo?.contact ||
      typeof data.personalInfo.contact.phone !== 'string' ||
      !data.personalInfo.contact.phone.trim()
    ) {
      errors.push({
        field: 'personalInfo.contact.phone',
        message: 'Phone number is required'
      });
    }
  }
  
  private validateFormatFields(data: Partial<AcademicCVData>, errors: ValidationError[]): void {
    // Validate email format
    const email = data.personalInfo?.contact?.email;
    if (email && !this.isValidEmail(email)) {
      errors.push({
        field: 'personalInfo.contact.email',
        message: 'Email must be in a valid format'
      });
    }
    
    // Validate year format where applicable
    if (data.publications) {
      data.publications.forEach((pub, index) => {
        if (pub.year && !this.isValidYear(pub.year)) {
          errors.push({
            field: `publications[${index}].year`,
            message: 'Year must be in YYYY format'
          });
        }
      });
    }
    
    if (data.conferences) {
      data.conferences.forEach((conf, index) => {
        if (conf.year && !this.isValidYear(conf.year)) {
          errors.push({
            field: `conferences[${index}].year`,
            message: 'Year must be in YYYY format'
          });
        }
      });
    }
    
    if (data.grants) {
      data.grants.forEach((grant, index) => {
        if (grant.year && !this.isValidYear(grant.year)) {
          errors.push({
            field: `grants[${index}].year`,
            message: 'Year must be in YYYY format'
          });
        }
      });
    }
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private isValidYear(year: string): boolean {
    const yearRegex = /^\d{4}$/;
    return yearRegex.test(year);
  }

  private validatePublications(publications: Publication[], errors: ValidationError[]): void {
    publications.forEach((pub, index) => {
      if (!pub.authors || (typeof pub.authors === 'string' && !pub.authors.trim())) {
        errors.push({
          field: `publications[${index}].authors`,
          message: 'Publication authors are required'
        });
      }

      if (!pub.title || (typeof pub.title === 'string' && !pub.title.trim())) {
        errors.push({
          field: `publications[${index}].title`,
          message: 'Publication title is required'
        });
      }

      if (!pub.journal || (typeof pub.journal === 'string' && !pub.journal.trim())) {
        errors.push({
          field: `publications[${index}].journal`,
          message: 'Journal name is required'
        });
      }

      if (!pub.year || (typeof pub.year === 'string' && !pub.year.trim())) {
        errors.push({
          field: `publications[${index}].year`,
          message: 'Publication year is required'
        });
      }

      if (!pub.volume || (typeof pub.volume === 'string' && !pub.volume.trim())) {
        errors.push({
          field: `publications[${index}].volume`,
          message: 'Volume information is required'
        });
      }

      if (!pub.pages || (typeof pub.pages === 'string' && !pub.pages.trim())) {
        errors.push({
          field: `publications[${index}].pages`,
          message: 'Page numbers are required'
        });
      }
    });
  }

  private validateConferences(conferences: Conference[], errors: ValidationError[]): void {
    conferences.forEach((conf, index) => {
      if (!conf.title || (typeof conf.title === 'string' && !conf.title.trim())) {
        errors.push({
          field: `conferences[${index}].title`,
          message: 'Conference presentation title is required'
        });
      }

      if (!conf.authors || (typeof conf.authors === 'string' && !conf.authors.trim())) {
        errors.push({
          field: `conferences[${index}].authors`,
          message: 'Presentation authors are required'
        });
      }

      if (!conf.year || (typeof conf.year === 'string' && !conf.year.trim())) {
        errors.push({
          field: `conferences[${index}].year`,
          message: 'Presentation year is required'
        });
      }

      if (!conf.conferenceName || (typeof conf.conferenceName === 'string' && !conf.conferenceName.trim())) {
        errors.push({
          field: `conferences[${index}].conferenceName`,
          message: 'Conference name is required'
        });
      }

      if (!conf.location || (typeof conf.location === 'string' && !conf.location.trim())) {
        errors.push({
          field: `conferences[${index}].location`,
          message: 'Conference location is required'
        });
      }
    });
  }

  private validateGrants(grants: Grant[], errors: ValidationError[]): void {
    grants.forEach((grant, index) => {
      if (!grant.title || (typeof grant.title === 'string' && !grant.title.trim())) {
        errors.push({
          field: `grants[${index}].title`,
          message: 'Grant title is required'
        });
      }

      if (!grant.year || (typeof grant.year === 'string' && !grant.year.trim())) {
        errors.push({
          field: `grants[${index}].year`,
          message: 'Grant year is required'
        });
      }

      if (!grant.amount || (typeof grant.amount === 'string' && !grant.amount.trim())) {
        errors.push({
          field: `grants[${index}].amount`,
          message: 'Grant amount is required'
        });
      }

      if (!grant.agency || (typeof grant.agency === 'string' && !grant.agency.trim())) {
        errors.push({
          field: `grants[${index}].agency`,
          message: 'Funding agency is required'
        });
      }
    });
  }

  private validateAwards(awards: Award[], errors: ValidationError[]): void {
    awards.forEach((award, index) => {
      if (!award.title || (typeof award.title === 'string' && !award.title.trim())) {
        errors.push({
          field: `awards[${index}].title`,
          message: 'Award title is required'
        });
      }

      if (!award.year || (typeof award.year === 'string' && !award.year.trim())) {
        errors.push({
          field: `awards[${index}].year`,
          message: 'Award year is required'
        });
      }
      // organization and all other fields are optional
    });
  }

  /**
   * Check if the data is a valid academic CV
   */
  isValid(data: Partial<AcademicCVData>): boolean {
    return this.validate(data).length === 0;
  }

  /**
   * Gets the first validation error message
   */
  getFirstErrorMessage(data: Partial<AcademicCVData>): string | null {
    const errors = this.validate(data);
    return errors.length > 0 ? errors[0]?.message ?? null : null;
  }
}

