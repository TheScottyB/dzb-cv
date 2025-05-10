import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';
import { expect } from 'vitest';

/**
 * A comprehensive sample CV for general testing.
 */
export const sampleCV: CVData = {
  personalInfo: {
    name: {
      first: 'Jane',
      last: 'Smith',
      full: 'Jane Smith',
    },
    contact: {
      email: 'jane@example.com',
      phone: '123-456-7890',
    },
    professionalTitle: 'Full Stack Developer',
  },
  experience: [
    {
      position: 'Senior Developer',
      employer: 'Tech Co',
      startDate: '2020-01',
      endDate: '2023-12',
      responsibilities: [
        'Led development of microservices using Node.js',
        'Built React applications with TypeScript',
        'Implemented automated testing with Jest',
      ],
      employmentType: 'full-time',
    },
    {
      position: 'Full Stack Developer',
      employer: 'Startup Inc',
      startDate: '2018-01',
      endDate: '2019-12',
      responsibilities: ['Developed full stack applications', 'Worked with React and Node.js'],
      employmentType: 'full-time',
    },
  ],
  education: [
    {
      degree: 'Master of Science',
      field: 'Computer Science',
      institution: 'Tech University',
      graduationDate: '2018',
    },
  ],
  skills: [
    { name: 'React', level: 'expert' },
    { name: 'TypeScript', level: 'expert' },
    { name: 'Node.js', level: 'advanced' },
    { name: 'Jest', level: 'intermediate' },
  ],
};

/**
 * A comprehensive sample job posting for general testing.
 */
export const sampleJob: JobPosting = {
  title: 'Senior Full Stack Developer',
  company: 'Enterprise Corp',
  description: 'Looking for a senior developer with strong TypeScript and React experience.',
  qualifications: [
    "Master's degree in Computer Science or related field",
    '5+ years of development experience',
    'Strong knowledge of TypeScript and React',
  ],
  responsibilities: [
    'Lead development of web applications',
    'Write clean, maintainable TypeScript code',
    'Implement automated testing',
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Jest', 'Docker', 'Kubernetes'],
  url: '',
};

/**
 * Simpler sample CV for analyzer tests.
 */
export const simpleSampleCV: CVData = {
  personalInfo: {
    name: {
      first: 'John',
      last: 'Doe',
      full: 'John Doe',
    },
    contact: {
      email: 'john@example.com',
      phone: '123-456-7890',
    },
  },
  experience: [
    {
      position: 'Frontend Developer',
      employer: 'Web Corp',
      startDate: '2020-01',
      endDate: '2023-12',
      responsibilities: [
        'Developed React applications',
        'Implemented responsive designs',
        'Worked with TypeScript',
      ],
      employmentType: 'full-time',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      institution: 'Tech University',
      graduationDate: '2020',
    },
  ],
  skills: [
    { name: 'React', level: 'advanced' },
    { name: 'TypeScript', level: 'advanced' },
    { name: 'HTML', level: 'expert' },
    { name: 'CSS', level: 'expert' },
  ],
};

/**
 * Simpler sample job for analyzer tests.
 */
export const simpleSampleJob: JobPosting = {
  title: 'Senior Frontend Developer',
  company: 'Tech Solutions',
  description: 'Looking for an experienced frontend developer with strong React skills.',
  qualifications: [
    'Strong experience with React and TypeScript',
    '3+ years of frontend development',
    'Experience with modern CSS frameworks',
  ],
  responsibilities: [
    'Develop and maintain React applications',
    'Write clean, maintainable TypeScript code',
    'Implement responsive designs',
    'Optimize application performance',
  ],
  skills: ['React', 'TypeScript', 'CSS', 'Jest', 'Webpack'],
  url: '',
};

/**
 * An empty CV for edge case testing.
 */
export const emptyCV: CVData = {
  personalInfo: {
    name: { first: '', last: '', full: '' },
    contact: { email: '', phone: '' },
  },
  experience: [],
  education: [],
  skills: [],
};

/**
 * An empty job posting for edge case testing.
 */
export const emptyJob: JobPosting = {
  title: '',
  company: '',
  description: '',
  url: '',
};

/**
 * A minimal job posting for edge case testing.
 */
export const minimalJob: JobPosting = {
  title: 'Developer',
  company: 'Company',
  description: 'Job description',
  url: '',
};

/**
 * Factory function to create a CV with overrides.
 */
export function makeCV(overrides: Partial<CVData> = {}): CVData {
  return { ...sampleCV, ...overrides };
}

/**
 * Helper to assert that suggestions do not reference job-specific keywords.
 */
export function expectNoJobSpecificSuggestions(suggestions: string[]) {
  const jobSpecificKeywords = [
    'docker',
    'typescript',
    'react',
    'node.js',
    'jest',
    'enterprise corp',
    'developer',
  ];
  expect(
    suggestions.every(
      (s) => !jobSpecificKeywords.some((keyword) => s.toLowerCase().includes(keyword))
    )
  ).toBe(true);
}
