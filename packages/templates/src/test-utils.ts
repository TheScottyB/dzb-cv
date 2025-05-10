import type { CVData } from '@dzb-cv/types';

/**
 * Minimal CV data for basic/modern template tests.
 */
export const minimalCV: CVData = {
  personalInfo: {
    name: {
      first: 'John',
      last: 'Doe',
      full: 'John Doe',
    },
    contact: {
      email: 'john@example.com',
      phone: '(555) 123-4567',
    },
  },
  experience: [],
  education: [],
  skills: [],
};

/**
 * Sample CV for basic template tests.
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
      degree: 'BS',
      field: 'Computer Science',
      institution: 'Test University',
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

/**
 * Full CV data for comprehensive modern template tests.
 */
export const fullCV: CVData = {
  personalInfo: {
    name: {
      first: 'Jane',
      middle: 'Marie',
      last: 'Smith',
      full: 'Jane Marie Smith',
    },
    professionalTitle: 'Senior Software Engineer',
    summary:
      'Experienced software engineer with expertise in web development and distributed systems.',
    contact: {
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      address: '123 Tech Street, San Francisco, CA 94107',
      linkedin: 'linkedin.com/in/janesmith',
      github: 'github.com/janesmith',
      website: 'janesmith.dev',
    },
  },
  experience: [
    {
      position: 'Senior Software Engineer',
      employer: 'Tech Solutions Inc.',
      startDate: 'Jan 2020',
      endDate: 'Present',
      location: 'San Francisco, CA',
      responsibilities: [
        'Lead development of microservices architecture',
        'Mentor junior developers and conduct code reviews',
        'Implement CI/CD pipelines for automated testing and deployment',
      ],
      achievements: [
        'Reduced API response time by 40% through optimized database queries',
        'Implemented authentication system that increased security compliance by 100%',
      ],
      employmentType: 'full-time',
    },
    {
      position: 'Software Developer',
      employer: 'InnovateTech',
      startDate: 'Mar 2018',
      endDate: 'Dec 2019',
      location: 'Seattle, WA',
      responsibilities: [
        'Developed front-end components using React and TypeScript',
        'Created RESTful APIs using Node.js and Express',
      ],
      employmentType: 'full-time',
    },
  ],
  education: [
    {
      institution: 'University of Washington',
      degree: 'Master of Science',
      field: 'Computer Science',
      graduationDate: '2018',
      gpa: '3.92',
      honors: ['Magna Cum Laude', "Dean's List"],
    },
    {
      institution: 'California State University',
      degree: 'Bachelor of Science',
      field: 'Software Engineering',
      graduationDate: '2016',
    },
  ],
  skills: [
    {
      name: 'React',
      level: 'expert',
      category: 'Frontend',
    },
    {
      name: 'TypeScript',
      level: 'expert',
      category: 'Languages',
    },
    {
      name: 'Node.js',
      level: 'advanced',
      category: 'Backend',
    },
    {
      name: 'GraphQL',
      level: 'intermediate',
      category: 'API',
    },
    {
      name: 'Docker',
      level: 'beginner',
      category: 'DevOps',
    },
  ],
  // Extensions beyond the base type
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform with microservices architecture',
      technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
      url: 'https://github.com/janesmith/ecommerce',
    },
    {
      name: 'Task Management App',
      description: 'Developed a responsive task management application with real-time updates',
      technologies: ['React', 'Firebase', 'Material-UI'],
    },
  ],
  languages: [
    {
      language: 'English',
      proficiency: 'Native',
    },
    {
      language: 'Spanish',
      proficiency: 'Fluent',
    },
    {
      language: 'French',
      proficiency: 'Intermediate',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
    {
      name: 'Google Cloud Professional Developer',
      issuer: 'Google',
      date: '2021',
    },
  ],
};
