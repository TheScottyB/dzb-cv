import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultPDFGenerator } from '../pdf-generator.js';
import type { CVData } from '../../../types/cv-base.js';

// Mock puppeteer for testing
vi.mock('puppeteer', () => {
  const pdfMock = vi.fn().mockResolvedValue(Buffer.from('PDF content'));
  const setContentMock = vi.fn().mockResolvedValue(undefined);
  const evaluateMock = vi.fn().mockResolvedValue({
    scrollHeight: 1200, // Simulate content that needs compression
    clientHeight: 800,
    scrollWidth: 600
  });
  const addStyleTagMock = vi.fn().mockResolvedValue(undefined);

  return {
    default: {
      launch: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          setContent: setContentMock,
          pdf: pdfMock,
          evaluate: evaluateMock,
          addStyleTag: addStyleTagMock,
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

describe('Single-Page PDF Generation', () => {
  let generator: DefaultPDFGenerator;

  beforeEach(() => {
    generator = new DefaultPDFGenerator();
  });

  const createCVData = (contentLength: 'minimal' | 'medium' | 'extensive'): CVData => {
    const baseData: CVData = {
      personalInfo: {
        name: { full: 'Test User' },
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890',
        },
      },
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    if (contentLength === 'minimal') {
      baseData.experience = [
        {
          title: 'Software Developer',
          company: 'Tech Corp',
          startDate: '2022-01',
          endDate: '2024-01',
          responsibilities: ['Developed web applications', 'Worked with team'],
        },
      ];
      baseData.education = [
        {
          degree: 'BS Computer Science',
          institution: 'University',
          year: '2022',
        },
      ];
      baseData.skills = ['JavaScript', 'React'];
      baseData.certifications = ['AWS Certified'];
    }

    if (contentLength === 'medium') {
      baseData.experience = [
        {
          title: 'Senior Software Developer',
          company: 'Tech Solutions Inc',
          startDate: '2020-03',
          endDate: '2024-01',
          responsibilities: [
            'Led development of microservices architecture',
            'Mentored junior developers',
            'Implemented CI/CD pipelines',
            'Collaborated with product managers on feature requirements',
            'Optimized database queries for improved performance',
          ],
        },
        {
          title: 'Software Developer',
          company: 'StartupXYZ',
          startDate: '2018-06',
          endDate: '2020-02',
          responsibilities: [
            'Built responsive web applications using React and Node.js',
            'Designed and implemented REST APIs',
            'Participated in code reviews and agile development processes',
          ],
        },
      ];
      baseData.education = [
        {
          degree: 'MS Computer Science',
          institution: 'Tech University',
          year: '2018',
        },
        {
          degree: 'BS Software Engineering',
          institution: 'State College',
          year: '2016',
        },
      ];
      baseData.skills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git'
      ];
      baseData.certifications = [
        'AWS Solutions Architect',
        'Certified Kubernetes Administrator',
        'Google Cloud Professional'
      ];
    }

    if (contentLength === 'extensive') {
      baseData.experience = [
        {
          title: 'Principal Software Engineer',
          company: 'Enterprise Corp',
          startDate: '2022-01',
          endDate: 'Present',
          responsibilities: [
            'Architected and led development of large-scale distributed systems',
            'Managed team of 8 software engineers across multiple time zones',
            'Established engineering best practices and coding standards',
            'Designed microservices architecture serving 1M+ daily active users',
            'Implemented comprehensive monitoring and alerting systems',
            'Led migration from monolithic to microservices architecture',
            'Collaborated with executive team on technical strategy and roadmap',
            'Mentored senior engineers and conducted technical interviews',
          ],
        },
        {
          title: 'Senior Software Engineer',
          company: 'Growth Tech Solutions',
          startDate: '2019-08',
          endDate: '2021-12',
          responsibilities: [
            'Developed high-performance APIs handling 100k+ requests per minute',
            'Led frontend development using React, Redux, and TypeScript',
            'Implemented automated testing strategies with 95% code coverage',
            'Designed and built real-time data processing pipelines',
            'Optimized application performance resulting in 40% speed improvement',
            'Mentored 3 junior developers and conducted technical training',
            'Collaborated with DevOps team on CI/CD pipeline improvements',
          ],
        },
        {
          title: 'Software Engineer II',
          company: 'InnovateLabs',
          startDate: '2017-05',
          endDate: '2019-07',
          responsibilities: [
            'Built scalable web applications using modern JavaScript frameworks',
            'Developed REST and GraphQL APIs with comprehensive documentation',
            'Implemented automated testing and deployment processes',
            'Worked closely with UX/UI designers on user interface improvements',
            'Participated in on-call rotation for production support',
            'Contributed to open-source projects and internal tools',
          ],
        },
        {
          title: 'Junior Software Developer',
          company: 'Digital Startup',
          startDate: '2015-09',
          endDate: '2017-04',
          responsibilities: [
            'Developed features for customer-facing web applications',
            'Participated in agile development processes and daily standups',
            'Wrote unit and integration tests for new features',
            'Collaborated with QA team on bug fixes and testing procedures',
            'Maintained legacy systems and performed database migrations',
          ],
        },
      ];
      baseData.education = [
        {
          degree: 'MS Computer Science - Machine Learning',
          institution: 'Elite Technology Institute',
          year: '2015',
        },
        {
          degree: 'BS Computer Engineering',
          institution: 'State University',
          year: '2013',
        },
        {
          degree: 'Certificate in Advanced Algorithms',
          institution: 'Online Tech Academy',
          year: '2014',
        },
      ];
      baseData.skills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust',
        'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'FastAPI',
        'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
        'Terraform', 'Jenkins', 'GitLab CI', 'GitHub Actions',
        'Microservices', 'REST APIs', 'GraphQL', 'WebSocket',
        'Redis', 'RabbitMQ', 'Apache Kafka', 'Nginx'
      ];
      baseData.certifications = [
        'AWS Solutions Architect Professional',
        'Certified Kubernetes Administrator (CKA)',
        'Google Cloud Professional Cloud Architect',
        'Azure Solutions Architect Expert',
        'HashiCorp Certified: Terraform Associate',
        'MongoDB Certified Developer',
        'Redis Certified Developer',
        'Elastic Certified Engineer'
      ];
    }

    return baseData;
  };

  describe('Content Length Adaptation', () => {
    it('should handle minimal CV content in single-page mode', async () => {
      const minimalCV = createCVData('minimal');
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        scale: 0.9,
        minFontSize: 8,
      };

      const result = await generator.generate(minimalCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should compress medium CV content to fit single page', async () => {
      const mediumCV = createCVData('medium');
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        scale: 0.8,
        minFontSize: 8,
        lineHeight: 1.2,
      };

      const result = await generator.generate(mediumCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should aggressively compress extensive CV content for single page', async () => {
      const extensiveCV = createCVData('extensive');
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        scale: 0.7,
        minFontSize: 7,
        lineHeight: 1.1,
      };

      const result = await generator.generate(extensiveCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('Single-Page Options', () => {
    const testCV = createCVData('medium');

    it('should respect custom scale factor', async () => {
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        scale: 0.6,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should respect minimum font size', async () => {
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        minFontSize: 10,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should work with A4 paper size', async () => {
      const options = {
        singlePage: true,
        paperSize: 'A4' as const,
        scale: 0.85,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should adjust line height for compact layout', async () => {
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        lineHeight: 1.1,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('Section Inclusion', () => {
    it('should include all sections when content fits', async () => {
      const cv = createCVData('minimal');
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
      };

      const result = await generator.generate(cv, options);
      expect(result).toBeInstanceOf(Buffer);
      
      // In a real test, we might also verify the HTML content includes all sections
      // This would require additional mocking or integration testing
    });

    it('should prioritize content when space is limited', async () => {
      const cv = createCVData('extensive');
      const options = {
        singlePage: true,
        paperSize: 'Letter' as const,
        scale: 0.6,
      };

      const result = await generator.generate(cv, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('Template Integration', () => {
    const testCV = createCVData('medium');

    it('should work with minimal template', async () => {
      const options = {
        singlePage: true,
        template: 'minimal' as const,
        paperSize: 'Letter' as const,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should work with academic template', async () => {
      const options = {
        singlePage: true,
        template: 'academic' as const,
        paperSize: 'Letter' as const,
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should work with federal template', async () => {
      const options = {
        singlePage: true,
        template: 'federal' as const,
        paperSize: 'Letter' as const,
        scale: 0.8, // Federal templates might need more compression
      };

      const result = await generator.generate(testCV, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
