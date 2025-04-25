/**
 * Mock implementation of PDF generator for testing
 */
import type { CVData } from '../../types/cv-base.js';
import type { PDFOptions } from '../../types/cv-generation.js';
import type { PDFGenerationProvider } from '../cv-service.js';

export class MockPDFGenerator implements PDFGenerationProvider {
  async generate(data: CVData, options?: PDFOptions): Promise<Buffer> {
    // Create a simple representation of the CV data as text
    const content = [
      `Name: ${data.personalInfo.name.full}`,
      `Contact: ${data.personalInfo.contact.email} | ${data.personalInfo.contact.phone}`,
      '',
      'Experience:',
      ...data.experience.map(exp => 
        `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`
      ),
      '',
      'Education:',
      ...data.education.map(edu => 
        `- ${edu.degree} from ${edu.institution} (${edu.year})`
      ),
      '',
      'Skills:',
      ...data.skills.map(skill => `- ${skill}`),
      '',
      'Certifications:',
      ...data.certifications.map(cert => `- ${cert}`)
    ].join('\n');

    // For testing purposes, we'll just return the content as a buffer
    return Buffer.from(content, 'utf8');
  }
}

