import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModernTemplate } from '../template.js';
import type { CVData } from '@dzb-cv/types';

describe('ModernTemplate', () => {
  // Mock the window.matchMedia function for testing responsive layouts
  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }
  const template = new ModernTemplate();

  // Minimal CV data for basic tests
  const minimalCVData: CVData = {
    personalInfo: {
      name: {
        first: 'John',
        last: 'Doe',
        full: 'John Doe'
      },
      contact: {
        email: 'john@example.com',
        phone: '(555) 123-4567'
      }
    },
    experience: [],
    education: [],
    skills: []
  };

  // Full CV data for comprehensive tests
  const fullCVData: CVData = {
    personalInfo: {
      name: {
        first: 'Jane',
        middle: 'Marie',
        last: 'Smith',
        full: 'Jane Marie Smith'
      },
      professionalTitle: 'Senior Software Engineer',
      summary: 'Experienced software engineer with expertise in web development and distributed systems.',
      contact: {
        email: 'jane.smith@example.com',
        phone: '(555) 987-6543',
        address: '123 Tech Street, San Francisco, CA 94107',
        linkedin: 'linkedin.com/in/janesmith',
        github: 'github.com/janesmith',
        website: 'janesmith.dev'
      }
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
          'Implement CI/CD pipelines for automated testing and deployment'
        ],
        achievements: [
          'Reduced API response time by 40% through optimized database queries',
          'Implemented authentication system that increased security compliance by 100%'
        ],
        employmentType: 'full-time'
      },
      {
        position: 'Software Developer',
        employer: 'InnovateTech',
        startDate: 'Mar 2018',
        endDate: 'Dec 2019',
        location: 'Seattle, WA',
        responsibilities: [
          'Developed front-end components using React and TypeScript',
          'Created RESTful APIs using Node.js and Express'
        ],
        employmentType: 'full-time'
      }
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'Master of Science',
        field: 'Computer Science',
        graduationDate: '2018',
        gpa: '3.92',
        honors: ['Magna Cum Laude', 'Dean\'s List']
      },
      {
        institution: 'California State University',
        degree: 'Bachelor of Science',
        field: 'Software Engineering',
        graduationDate: '2016'
      }
    ],
    skills: [
      {
        name: 'React',
        level: 'expert',
        category: 'Frontend'
      },
      {
        name: 'TypeScript',
        level: 'expert',
        category: 'Languages'
      },
      {
        name: 'Node.js',
        level: 'advanced',
        category: 'Backend'
      },
      {
        name: 'GraphQL',
        level: 'intermediate',
        category: 'API'
      },
      {
        name: 'Docker',
        level: 'beginner',
        category: 'DevOps'
      }
    ],
    // Extensions beyond the base type
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a scalable e-commerce platform with microservices architecture',
        technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
        url: 'https://github.com/janesmith/ecommerce'
      },
      {
        name: 'Task Management App',
        description: 'Developed a responsive task management application with real-time updates',
        technologies: ['React', 'Firebase', 'Material-UI']
      }
    ],
    languages: [
      {
        language: 'English',
        proficiency: 'Native'
      },
      {
        language: 'Spanish',
        proficiency: 'Fluent'
      },
      {
        language: 'French',
        proficiency: 'Intermediate'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022'
      },
      {
        name: 'Google Cloud Professional Developer',
        issuer: 'Google',
        date: '2021'
      }
    ]
  };

  beforeEach(() => {
    // Default to desktop viewport
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
  });

  // Basic template tests
  it('should have correct name and description', () => {
    expect(template.name).toBe('modern');
    expect(template.description).toBeTruthy();
  });

  it('should include CSS styles', () => {
    const styles = template.getStyles();
    expect(styles).toContain('font-family');
    expect(styles).toContain('media print');
    expect(styles).toContain('media (max-width: 768px)');
  });

  // 1. Basic render test with minimal CV data
  it('should render with minimal CV data', () => {
    const { container } = render(template.render(minimalCVData));
    
    // Basic structure should exist
    expect(container.querySelector('.modern-cv')).toBeInTheDocument();
    expect(container.querySelector('.cv-header')).toBeInTheDocument();
    expect(container.querySelector('.cv-content')).toBeInTheDocument();
    
    // Name should be displayed
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('John Doe');
    
    // Contact info should be displayed
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();

    // Snapshot for minimal data
    expect(container).toMatchSnapshot();
  });

  // 2. Full CV data render test
  it('should render all sections with full CV data', () => {
    const { container } = render(template.render(fullCVData));
    
    // Check for professional summary
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText(/Experienced software engineer/)).toBeInTheDocument();
    
    // Check for experience section
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions Inc.')).toBeInTheDocument();
    expect(screen.getByText('Jan 2020 - Present')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    
    // Check for responsibilities in experience
    expect(screen.getByText('Lead development of microservices architecture')).toBeInTheDocument();
    
    // Check for achievements in experience
    expect(screen.getByText('Key Achievements:')).toBeInTheDocument();
    expect(screen.getByText(/Reduced API response time by 40%/)).toBeInTheDocument();
    
    // Check for education section
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('University of Washington')).toBeInTheDocument();
    expect(screen.getByText('GPA: 3.92')).toBeInTheDocument();
    expect(screen.getByText('Magna Cum Laude')).toBeInTheDocument();
    
    // Check for skills section
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    
    // Check for projects section
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText(/Built a scalable e-commerce platform/)).toBeInTheDocument();
    
    // Check for languages section
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Native')).toBeInTheDocument();
    
    // Check for certifications section
    expect(screen.getByText('Certifications')).toBeInTheDocument();
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services, 2022')).toBeInTheDocument();

    // Snapshot for full data
    expect(container).toMatchSnapshot();
  });

  // 4. Test for responsive behavior
  it('should apply responsive styles on mobile viewport', () => {
    // Mock mobile viewport
    mockMatchMedia(true);
    
    const { container } = render(template.render(fullCVData));
    
    // In the mockMatchMedia implementation, true would match media queries like (max-width: 768px)
    // We can verify this by checking computed styles, but since we can't access computed styles in JSDOM,
    // we'll check if the responsive DOM structure is applied
    
    const cvContent = container.querySelector('.cv-content');
    
    // We would check if the grid columns are changed, but we can't directly test CSS applied
    // Instead, we verify the component still renders correctly in mobile view
    expect(cvContent).toBeInTheDocument();
    expect(screen.getByText('Jane Marie Smith')).toBeInTheDocument();
    
    // Snapshot should be different than desktop
    expect(container).toMatchSnapshot('mobile-view');
  });

  // 5. Verify individual sections render correctly
  
  // 5.1 Test header with contact info
  it('should render header with all contact information', () => {
    render(template.render(fullCVData));
    
    // Check name and title
    expect(screen.getByText('Jane Marie Smith')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    
    // Check all contact details
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 987-6543')).toBeInTheDocument();
    expect(screen.getByText('123 Tech Street, San Francisco, CA 94107')).toBeInTheDocument();
    expect(screen.getByText('linkedin.com/in/janesmith')).toBeInTheDocument();
    expect(screen.getByText('github.com/janesmith')).toBeInTheDocument();
  });
  
  // 5.2 Test experience items
  it('should render experience items with all details', () => {
    render(template.render(fullCVData));
    
    // Check for both experience entries
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
    
    // Check for dates
    expect(screen.getByText('Jan 2020 - Present')).toBeInTheDocument();
    expect(screen.getByText('Mar 2018 - Dec 2019')).toBeInTheDocument();
    
    // Check for responsibilities and achievements
    expect(screen.getByText('Lead development of microservices architecture')).toBeInTheDocument();
    expect(screen.getByText('Mentor junior developers and conduct code reviews')).toBeInTheDocument();
    expect(screen.getByText(/Reduced API response time by 40%/)).toBeInTheDocument();
  });
  
  // 5.3 Test education items
  it('should render education items with all details', () => {
    render(template.render(fullCVData));
    
    // Check for both education entries
    expect(screen.getByText('Master of Science in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science in Software Engineering')).toBeInTheDocument();
    
    // Check for institutions
    expect(screen.getByText('University of Washington')).toBeInTheDocument();
    expect(screen.getByText('California State University')).toBeInTheDocument();
    
    // Check for GPA and honors
    expect(screen.getByText('GPA: 3.92')).toBeInTheDocument();
    expect(screen.getByText('Magna Cum Laude')).toBeInTheDocument();
    expect(screen.getByText('Dean\'s List')).toBeInTheDocument();
  });
  
  // 5.4 Test skills with different levels
  it('should render skills with different levels and categories', () => {
    render(template.render(fullCVData));
    
    // Check for skill categories
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    
    // Check for skills with different levels
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('GraphQL')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    
    // We can't check directly for CSS classes for skill levels in JSDOM environment
    // but we can check if the elements exist
  });
  
  // 5.5 Test projects
  it('should render projects with all details', () => {
    render(template.render(fullCVData));
    
    // Check for project names
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Task Management App')).toBeInTheDocument();
    
    // Check for project descriptions
    expect(screen.getByText('Built a scalable e-commerce platform with microservices architecture')).toBeInTheDocument();
    expect(screen.getByText('Developed a responsive task management application with real-time updates')).toBeInTheDocument();
    
    // Check for project technologies
    expect(screen.getByText(/React, Node.js, MongoDB, Docker/)).toBeInTheDocument();
    expect(screen.getByText(/React, Firebase, Material-UI/)).toBeInTheDocument();
    
    // Check for project URL
    const linkElement = screen.getByText('https://github.com/janesmith/ecommerce');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', 'https://github.com/janesmith/ecommerce');
  });
  
  // 5.6 Test languages section
  it('should render languages with proficiency levels', () => {
    render(template.render(fullCVData));
    
    // Check for languages section header
    expect(screen.getByText('Languages')).toBeInTheDocument();
    
    // Check for individual languages
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    
    // Check for proficiency levels
    expect(screen.getByText('Native')).toBeInTheDocument();
    expect(screen.getByText('Fluent')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    
    // Verify they appear in the correct structure
    const languages = screen.getAllByTestId('language-item');
    expect(languages.length).toBe(3);
    
    // Check first language item has correct content
    const englishItem = languages[0];
    expect(englishItem).toHaveTextContent('English');
    expect(englishItem).toHaveTextContent('Native');
  });
  
  // 5.7 Test certifications section
  it('should render certifications with issuer and date', () => {
    render(template.render(fullCVData));
    
    // Check for certifications section header
    expect(screen.getByText('Certifications')).toBeInTheDocument();
    
    // Check for certification names
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
    expect(screen.getByText('Google Cloud Professional Developer')).toBeInTheDocument();
    
    // Check for certification issuers and dates
    expect(screen.getByText('Amazon Web Services, 2022')).toBeInTheDocument();
    expect(screen.getByText('Google, 2021')).toBeInTheDocument();
    
    // Verify they appear in the correct structure
    const certifications = screen.getAllByTestId('certification-item');
    expect(certifications.length).toBe(2);
    
    // Check first certification item has correct content
    const awsCert = certifications[0];
    expect(awsCert).toHaveTextContent('AWS Certified Solutions Architect');
    expect(awsCert).toHaveTextContent('Amazon Web Services');
    expect(awsCert).toHaveTextContent('2022');
  });
  
  // 6. Test print media styles
  it('should include print-specific styles', () => {
    const { container } = render(template.render(fullCVData));
    
    // Get the styles
    const styles = template.getStyles();
    
    // Check that print media query exists
    expect(styles).toContain('@media print');
    
    // Since we can't test actual CSS media queries in JSDOM,
    // we can check that print-specific classes exist
    
    // Common print classes that should exist
    expect(container.querySelector('.print-friendly')).toBeInTheDocument();
    
    // Check for print-hidden elements
    const printHiddenElements = container.querySelectorAll('.print-hidden');
    expect(printHiddenElements.length).toBeGreaterThan(0);
    
    // Check for print-only elements
    const printOnlyElements = container.querySelectorAll('.print-only');
    expect(printOnlyElements.length).toBeGreaterThan(0);
    
    // Check print page break classes
    expect(container.querySelector('.page-break-before')).toBeInTheDocument();
    expect(container.querySelector('.page-break-avoid')).toBeInTheDocument();
  });
});
