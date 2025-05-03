import { describe, it, expect } from 'vitest';
import { AcademicCVValidator } from '../academic-cv-validator.js';
import type { AcademicCVData } from '../../../types/academic-types.js';

describe('AcademicCVValidator', () => {
  const validator = new AcademicCVValidator();

  const validData: AcademicCVData = {
    personalInfo: {
      name: { full: 'Dr. Test User' },
      contact: {
        email: 'test@university.edu',
        phone: '555-123-4567'
      }
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    publications: [
      {
        authors: 'Test, A., User, B.',
        title: 'Test Publication',
        journal: 'Test Journal',
        year: '2023',
        volume: '10',
        issue: '2',
        pages: '100-120'
      }
    ],
    conferences: [
      {
        title: 'Test Conference Presentation',
        authors: 'Test, A.',
        year: '2023',
        conferenceName: 'Test Conference',
        location: 'Test City, Country'
      }
    ],
    grants: [
      {
        title: 'Test Grant',
        year: '2022',
        amount: '$50,000',
        agency: 'Test Funding Agency',
        description: 'Research funding'
      }
    ],
    awards: [
      {
        title: 'Test Award',
        year: '2021',
        organization: 'Test Organization',
        description: 'Recognition for research'
      }
    ]
  };

  describe('required fields validation', () => {
    it('should validate required personal information', () => {
      const result = validator.validate(validData);
      expect(result).toHaveLength(0);
    });

    it('should require full name', () => {
      const invalidData = {
        ...validData,
        personalInfo: {
          ...validData.personalInfo,
          name: { full: '' }
        }
      };
      const result = validator.validate(invalidData);
      expect(result).toContainEqual({
        field: 'personalInfo.name.full',
        message: 'Full name is required'
      });
    });

    it('should require email and phone', () => {
      const invalidData = {
        ...validData,
        personalInfo: {
          ...validData.personalInfo,
          contact: {
            email: '',
            phone: ''
          }
        }
      };
      const result = validator.validate(invalidData);
      expect(result).toContainEqual({
        field: 'personalInfo.contact.email',
        message: 'Email is required'
      });
      expect(result).toContainEqual({
        field: 'personalInfo.contact.phone',
        message: 'Phone number is required'
      });
    });
  });

  describe('publication validation', () => {
    it('should validate complete publication entries', () => {
      const result = validator.validate(validData);
      expect(result).toHaveLength(0);
    });

    it('should require all mandatory publication fields', () => {
      const invalidPub = {
        ...validData,
        publications: [{
          authors: '',
          title: '',
          journal: '',
          year: '',
          volume: '',
          pages: ''
        }]
      };
      const result = validator.validate(invalidPub);
      expect(result).toContainEqual({
        field: 'publications[0].authors',
        message: 'Publication authors are required'
      });
      expect(result).toContainEqual({
        field: 'publications[0].title',
        message: 'Publication title is required'
      });
    });

    it('should allow optional issue field in publications', () => {
      const dataWithoutIssue = {
        ...validData,
        publications: [{
          ...validData.publications![0],
          issue: undefined
        }]
      };
      const result = validator.validate(dataWithoutIssue);
      expect(result).toHaveLength(0);
    });
  });

  describe('conference validation', () => {
    it('should validate complete conference entries', () => {
      const result = validator.validate(validData);
      expect(result).toHaveLength(0);
    });

    it('should require all mandatory conference fields', () => {
      const invalidConf = {
        ...validData,
        conferences: [{
          title: '',
          authors: '',
          year: '',
          conferenceName: '',
          location: ''
        }]
      };
      const result = validator.validate(invalidConf);
      expect(result).toContainEqual({
        field: 'conferences[0].title',
        message: 'Conference presentation title is required'
      });
      expect(result).toContainEqual({
        field: 'conferences[0].location',
        message: 'Conference location is required'
      });
    });

    it('should allow optional description in conferences', () => {
      const dataWithoutDesc = {
        ...validData,
        conferences: [{
          ...validData.conferences![0],
          description: undefined
        }]
      };
      const result = validator.validate(dataWithoutDesc);
      expect(result).toHaveLength(0);
    });
  });

  describe('grant validation', () => {
    it('should validate complete grant entries', () => {
      const result = validator.validate(validData);
      expect(result).toHaveLength(0);
    });

    it('should require all mandatory grant fields', () => {
      const invalidGrant = {
        ...validData,
        grants: [{
          title: '',
          year: '',
          amount: '',
          agency: ''
        }]
      };
      const result = validator.validate(invalidGrant);
      expect(result).toContainEqual({
        field: 'grants[0].amount',
        message: 'Grant amount is required'
      });
      expect(result).toContainEqual({
        field: 'grants[0].agency',
        message: 'Funding agency is required'
      });
    });
  });

  describe('award validation', () => {
    it('should validate complete award entries', () => {
      const result = validator.validate(validData);
      expect(result).toHaveLength(0);
    });

    it('should require only title and year for awards', () => {
      const invalidAward = {
        ...validData,
        awards: [{
          title: '',
          year: ''
        }]
      };
      const result = validator.validate(invalidAward);
      expect(result).toContainEqual({
        field: 'awards[0].title',
        message: 'Award title is required'
      });
      expect(result).toContainEqual({
        field: 'awards[0].year',
        message: 'Award year is required'
      });
    });

    it('should allow optional fields in awards', () => {
      const minimalAward = {
        ...validData,
        awards: [{
          title: 'Test Award',
          year: '2021'
        }]
      };
      const result = validator.validate(minimalAward);
      expect(result).toHaveLength(0);
    });
  });

  describe('utility methods', () => {
    it('should correctly identify valid data', () => {
      expect(validator.isValid(validData)).toBe(true);
    });

    it('should return first error message', () => {
      const invalidData = {
        ...validData,
        personalInfo: {
          ...validData.personalInfo,
          name: { full: '' }
        }
      };
      const message = validator.getFirstErrorMessage(invalidData);
      expect(message).toBe('Full name is required');
    });

    it('should return null when no errors', () => {
      const message = validator.getFirstErrorMessage(validData);
      expect(message).toBeNull();
    });
            });
});
