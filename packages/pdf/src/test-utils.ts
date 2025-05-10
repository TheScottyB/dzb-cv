import type { CVData } from '@dzb-cv/types';

/**
 * Sample CV for PDF generator and template tests.
 */
export const sampleCV: CVData = {
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
      position: 'Software Engineer',
      employer: 'Tech Corp',
      startDate: '2020-01',
      endDate: '2023-12',
      responsibilities: ['Development', 'Testing'],
      employmentType: 'full-time',
    },
  ],
  education: [
    {
      institution: 'Test University',
      degree: 'BS Computer Science',
      field: 'Computer Science',
      graduationDate: '2019',
    },
  ],
  skills: [
    {
      name: 'TypeScript',
      level: 'expert',
    },
  ],
};
