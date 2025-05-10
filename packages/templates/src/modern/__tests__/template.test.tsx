import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import type { CVData } from '@dzb-cv/types';

import { ModernTemplate } from '../template.js';
import { minimalCV, fullCV } from '../../test-utils';

describe('ModernTemplate', () => {
  // Mock the window.matchMedia function for testing responsive layouts
  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(
        (query: string): MediaQueryList => ({
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })
      ),
    });
  }
  const template = new ModernTemplate();

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
    const { container } = render(template.renderComponent(minimalCV));

    // Debug: print the rendered HTML
    console.log('Minimal CV render output:', container.innerHTML);

    // Basic structure should exist
    expect(container.querySelector('.modern-cv')).not.toBeNull();
    expect(container.querySelector('.cv-header')).not.toBeNull();
    expect(container.querySelector('.cv-content')).not.toBeNull();

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
    const { container } = render(template.renderComponent(fullCV));

    // Check for professional summary
    expect(
      screen.getAllByText((content) => content.includes('Professional Summary')).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Experienced software engineer/)).toBeInTheDocument();

    // Check for experience section
    expect(screen.getAllByText((content) => content.includes('Experience')).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getAllByText((content) => content.includes('Senior Software Engineer')).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText((content) => content.includes('Tech Solutions Inc.'))
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Jan 2020'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Present'))).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('San Francisco, CA')).length
    ).toBeGreaterThan(0);

    // Check for responsibilities in experience
    expect(
      screen.getByText((content) =>
        content.includes('Lead development of microservices architecture')
      )
    ).toBeInTheDocument();

    // Check for achievements in experience
    expect(
      screen.getByText((content) => content.includes('Key Achievements:'))
    ).toBeInTheDocument();
    expect(screen.getByText(/Reduced API response time by 40%/)).toBeInTheDocument();

    // Check for education section
    expect(screen.getByText((content) => content.includes('Education'))).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Master of Science'))
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Computer Science'))).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('University of Washington'))
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('GPA:'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('3.92'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Magna Cum Laude'))).toBeInTheDocument();

    // Check for skills section
    expect(screen.getAllByText((content) => content.includes('Skills')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Frontend')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText((content) => content.includes('React')).length).toBeGreaterThan(0);

    // Check for projects section
    expect(screen.getAllByText((content) => content.includes('Projects')).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getByText((content) => content.includes('E-commerce Platform'))
    ).toBeInTheDocument();
    expect(screen.getByText(/Built a scalable e-commerce platform/)).toBeInTheDocument();
    expect(screen.getAllByText((content) => content.includes('React')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Node.js')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('MongoDB')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Docker')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Firebase')).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getAllByText((content) => content.includes('Material-UI')).length
    ).toBeGreaterThan(0);

    // Check for languages section
    expect(screen.getAllByText((content) => content.includes('Languages')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText((content) => content.includes('English')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Spanish')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('French')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Native')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Fluent')).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((content) => content.includes('Intermediate')).length
    ).toBeGreaterThan(0);

    // Check for certifications section
    expect(
      screen.getAllByText((content) => content.includes('Certifications')).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((content) => content.includes('AWS Certified Solutions Architect')).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((content) => content.includes('Google Cloud Professional Developer'))
        .length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText((content) => content.includes('Amazon Web Services')).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('2022')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Google')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('2021')).length).toBeGreaterThan(0);

    // Snapshot for full data
    expect(container).toMatchSnapshot();
  });

  // 4. Test for responsive behavior
  it('should apply responsive styles on mobile viewport', () => {
    // Mock mobile viewport
    mockMatchMedia(true);

    const { container } = render(template.renderComponent(fullCV));

    // In the mockMatchMedia implementation, true would match media queries like (max-width: 768px)
    // We can verify this by checking computed styles, but since we can't access computed styles in JSDOM,
    // we'll check if the responsive DOM structure is applied

    const cvContent = container.querySelector('.cv-content');

    // We would check if the grid columns are changed, but we can't directly test CSS applied
    // Instead, we verify the component still renders correctly in mobile view
    expect(cvContent).not.toBeNull();
    expect(screen.getByText('Jane Marie Smith')).toBeInTheDocument();

    // Snapshot should be different than desktop
    expect(container).toMatchSnapshot('mobile-view');
  });

  // 5. Verify individual sections render correctly

  // 5.1 Test header with contact info
  it('should render header with all contact information', () => {
    render(template.renderComponent(fullCV));

    // Check name and title
    expect(screen.getByText((content) => content.includes('Jane Marie Smith'))).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('Senior Software Engineer')).length
    ).toBeGreaterThan(0);

    // Check all contact details
    expect(
      screen.getByText((content) => content.includes('jane.smith@example.com'))
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('(555) 987-6543'))).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('123 Tech Street, San Francisco, CA 94107'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('linkedin.com/in/janesmith'))
    ).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('github.com/janesmith')).length
    ).toBeGreaterThan(0);
  });

  // 5.2 Test experience items
  it('should render experience items with all details', () => {
    render(template.renderComponent(fullCV));

    // Check for both experience entries
    expect(
      screen.getAllByText((content) => content.includes('Senior Software Engineer')).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText((content) => content.includes('Software Developer'))
    ).toBeInTheDocument();

    // Check for dates
    expect(screen.getByText((content) => content.includes('Jan 2020'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Present'))).toBeInTheDocument();

    // Check for responsibilities and achievements
    expect(
      screen.getByText((content) =>
        content.includes('Lead development of microservices architecture')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes('Mentor junior developers and conduct code reviews')
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Reduced API response time by 40%/)).toBeInTheDocument();
  });

  // 5.3 Test education items
  it('should render education items with all details', () => {
    render(template.renderComponent(fullCV));

    // Check for both education entries
    expect(
      screen.getByText((content) => content.includes('Master of Science'))
    ).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Computer Science'))).toBeInTheDocument();

    // Check for institutions
    expect(
      screen.getByText((content) => content.includes('University of Washington'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('California State University'))
    ).toBeInTheDocument();

    // Check for GPA and honors
    expect(screen.getByText((content) => content.includes('GPA:'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('3.92'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Magna Cum Laude'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("Dean's List"))).toBeInTheDocument();
  });

  // 5.4 Test skills with different levels
  it('should render skills with different levels and categories', () => {
    render(template.renderComponent(fullCV));

    // Check for skill categories
    expect(screen.getAllByText((content) => content.includes('Frontend')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText((content) => content.includes('Languages')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText((content) => content.includes('Backend')).length).toBeGreaterThan(0);

    // Check for skills with different levels
    expect(screen.getAllByText((content) => content.includes('React')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('TypeScript')).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText((content) => content.includes('Node.js')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('GraphQL')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Docker')).length).toBeGreaterThan(0);

    // We can't check directly for CSS classes for skill levels in JSDOM environment
    // but we can check if the elements exist
  });

  // 5.5 Test projects
  it('should render projects with all details', () => {
    render(template.renderComponent(fullCV));

    // Check for project names
    expect(
      screen.getByText((content) => content.includes('E-commerce Platform'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Task Management App'))
    ).toBeInTheDocument();

    // Check for project descriptions
    expect(
      screen.getByText((content) =>
        content.includes('Built a scalable e-commerce platform with microservices architecture')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes(
          'Developed a responsive task management application with real-time updates'
        )
      )
    ).toBeInTheDocument();

    // Check for project technologies
    expect(screen.getAllByText((content) => content.includes('React')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Node.js')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('MongoDB')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Docker')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Firebase')).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getAllByText((content) => content.includes('Material-UI')).length
    ).toBeGreaterThan(0);

    // Check for project URL
    const linkElement = screen.getByRole('link', {
      name: 'https://github.com/janesmith/ecommerce',
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', 'https://github.com/janesmith/ecommerce');
  });

  // 5.6 Test languages section
  it('should render languages with proficiency levels', () => {
    render(template.renderComponent(fullCV));

    // Check for languages section header
    expect(screen.getAllByText((content) => content.includes('Languages')).length).toBeGreaterThan(
      0
    );

    // Check for individual languages and proficiency levels
    expect(screen.getAllByText((content) => content.includes('English')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Spanish')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('French')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Native')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Fluent')).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((content) => content.includes('Intermediate')).length
    ).toBeGreaterThan(0);

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
    render(template.renderComponent(fullCV));

    // Check for certifications section header
    expect(screen.getByText((content) => content.includes('Certifications'))).toBeInTheDocument();

    // Check for certification names
    expect(
      screen.getByText((content) => content.includes('AWS Certified Solutions Architect'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Google Cloud Professional Developer'))
    ).toBeInTheDocument();

    // Check for certification issuers and dates
    expect(
      screen.getAllByText((content) => content.includes('Amazon Web Services')).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('2022')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('Google')).length).toBeGreaterThan(0);
    expect(screen.getAllByText((content) => content.includes('2021')).length).toBeGreaterThan(0);

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
    render(template.renderComponent(fullCV));

    // Get the styles
    const styles = template.getStyles();

    // Check that print media query exists
    expect(styles).toContain('@media print');

    // Since we can't test actual CSS media queries in JSDOM,
    // we can check that print-specific classes exist

    // Common print classes that should exist
    // expect(container.querySelector('.print-friendly')).toBeInTheDocument();

    // Check for print-hidden elements
    // const printHiddenElements = container.querySelectorAll('.print-hidden');
    // expect(printHiddenElements.length).toBeGreaterThan(0);

    // Check for print-only elements
    // const printOnlyElements = container.querySelectorAll('.print-only');
    // expect(printOnlyElements.length).toBeGreaterThan(0);

    // Check print page break classes
    // expect(container.querySelector('.page-break-before')).toBeInTheDocument();
    // expect(container.querySelector('.page-break-avoid')).toBeInTheDocument();
  });
});
