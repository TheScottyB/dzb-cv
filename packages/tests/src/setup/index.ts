import { expect } from 'vitest';
import type {
  PersonalInfo,
  Education,
  Experience,
  Skill,
  Certification
} from '@dzb-cv/types';
// Add custom matchers
expect.extend({
  toHaveLength(received: any[], expected: number) {
    const pass = received.length === expected;
    return {
      pass,
      message: () => `expected array to have length ${expected} but got ${received.length}`,
    };
  },
  toBeInstanceOf(received: any, expected: Function) {
    const pass = received instanceof expected;
    return {
      pass,
      message: () => `expected ${received} to be instance of ${expected.name}`,
    };
  },
  toContainEqual(received: any[], expected: any) {
    const pass = received.some(item => JSON.stringify(item) === JSON.stringify(expected));
    return {
      pass,
      message: () => `expected array to contain ${JSON.stringify(expected)}`,
    };
  },
});

// Export test data factories
export const createTestPersonalInfo = (overrides?: Partial<PersonalInfo>): PersonalInfo => ({
  name: {
    first: "Test",
    last: "User",
    full: "Test User"
  },
  contact: {
    email: "test@example.com",
    phone: "123-456-7890"
  },
  ...overrides
});

export const createTestEducation = (overrides?: Partial<Education>): Education => ({
  institution: "Test University",
  degree: "Test Degree",
  field: "Test Field",
  graduationDate: "2025",
  ...overrides
});

export const createTestExperience = (overrides?: Partial<Experience>): Experience => ({
  employer: "Test Company",
  position: "Test Position",
  startDate: "2024-01",
  responsibilities: ["Test responsibility"],
  employmentType: "full-time",
  ...overrides
});

export const createTestSkill = (overrides?: Partial<Skill>): Skill => ({
  name: "Test Skill",
  level: "intermediate",
  category: "Technical",
  ...overrides
});

export const createTestCertification = (overrides?: Partial<Certification>): Certification => ({
  name: "Test Certification",
  issuer: "Test Issuer",
  date: "2024-01",
  ...overrides
});

