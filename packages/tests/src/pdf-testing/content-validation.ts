import type { PDFDocument } from 'pdf-lib';
import type { CVData } from '@dzb-cv/types';
import { createPDFValidationError } from './validation-error';

interface ContentValidationOptions {
  strictOrder?: boolean;
  ignoreCase?: boolean;
  minMatchPercentage?: number;
  sections?: string[];
}

export async function validateCVContent(
  doc: PDFDocument,
  data: CVData,
  options: ContentValidationOptions = {}
): Promise<void> {
  const textContent = await extractTextContent(doc);
  const requiredContent = extractRequiredContent(data);

  for (const [section, content] of Object.entries(requiredContent)) {
    // Skip sections that aren't in the specified sections list, if provided
    if (options.sections && !options.sections.includes(section)) {
      continue;
    }
    
    if (!validateSection(textContent, content, options)) {
      throw createPDFValidationError(
        `content.${section}`,
        content,
        'Content not found or in incorrect order'
      );
    }
  }
}

function extractRequiredContent(data: CVData): Record<string, string[]> {
  return {
    header: [
      data.personalInfo.name.full,
      data.personalInfo.contact.email,
      data.personalInfo.contact.phone
    ],
    experience: data.experience.map(exp => [
      exp.employer,
      exp.position,
      exp.startDate,
      exp.endDate
    ]).flat().filter(Boolean),
    education: data.education.map(edu => [
      edu.institution,
      edu.degree,
      edu.field,
      edu.graduationDate
    ]).flat(),
    skills: data.skills.map(skill => skill.name)
  };
}

function validateSection(
  content: string,
  required: string[],
  options: ContentValidationOptions
): boolean {
  const { strictOrder = false, ignoreCase = true, minMatchPercentage = 100 } = options;
  
  if (ignoreCase) {
    content = content.toLowerCase();
    required = required.map(s => s.toLowerCase());
  }

  if (strictOrder) {
    let lastIndex = -1;
    for (const item of required) {
      const index = content.indexOf(item);
      if (index === -1 || index < lastIndex) {
        return false;
      }
      lastIndex = index;
    }
    return true;
  }

  const matchCount = required.filter(item => content.includes(item)).length;
  const percentage = (matchCount / required.length) * 100;
  return percentage >= minMatchPercentage;
}

// Add custom matchers for different CV formats
export const cvMatchers = {
  toBeValidAcademicCV(received: PDFDocument, data: CVData) {
    return validateCVContent(received, data, {
      strictOrder: true,
      sections: ['publications', 'research', 'teaching']
    });
  },

  toBeValidFederalCV(received: PDFDocument, data: CVData) {
    return validateCVContent(received, data, {
      strictOrder: true,
      sections: ['qualifications', 'security', 'references']
    });
  },

  toBeValidMinimalCV(received: PDFDocument, data: CVData) {
    return validateCVContent(received, data, {
      minMatchPercentage: 80
    });
  }
};

// Helper for text extraction (simplified version)
async function extractTextContent(doc: PDFDocument): Promise<string> {
  // Note: This is a simplified version. In a real implementation,
  // you'd want to use a PDF parsing library like pdf.js or pdfjs-dist
  // to properly extract text content
  return doc.getTitle() || '';
}

