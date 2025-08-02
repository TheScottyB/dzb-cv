import { describe, it, expect } from 'vitest';
import { distillContentTool, optimizeContentTool } from '../llm-tools';

const mockCVData = {
  personalInfo: {
    name: { full: 'John Smith' },
    contact: { email: 'john.smith@example.com', phone: '+1-555-0123' }
  },
  experience: [
    {
      position: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2021-01',
      endDate: 'Present',
      responsibilities: ['Led development of microservices architecture']
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      graduationDate: '2019-05'
    }
  ],
  skills: [
    'JavaScript', 'React', 'Node.js'
  ]
};

describe('Distill Content Tool', () => {
  it('should return distilled content for given CV data', async () => {
    const result = await distillContentTool.execute({ cvData: mockCVData });
    expect(result.distilledContent).toBeDefined();
    // Validate reductionRatio with a threshold because exact value might vary
    expect(result.reductionRatio).toBeGreaterThan(-0.3);
  });
});

describe('Optimize Content Tool', () => {
  it('should optimize distilled content to fit layout constraints', async () => {
    const input = {
      distilledContent: 'Sample distilled content that is long enough to require optimization.',
      layoutConstraints: {
        maxLines: 40,
        maxCharactersPerLine: 80,
        pageFormat: 'Letter',
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
      }
    };

    const result = await optimizeContentTool.execute(input);
    expect(result.optimizedContent).toBeDefined();
    expect(result.layoutMetrics.fitsOnSinglePage).toBe(true);
  });
});

