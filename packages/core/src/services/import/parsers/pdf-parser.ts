import pdf from 'pdf-parse';
import type { DocumentParser, ParseResult } from './base-parser.js';
import type { CVData } from '../../../types/cv-base.js';

/**
 * Parser for PDF CV documents
 */
export class PdfParser implements DocumentParser {
  getFormat(): string {
    return 'pdf';
  }

  canParse(file: string, _content: string): boolean {
    return file.toLowerCase().endsWith('.pdf');
  }

  async parse(content: string | Buffer): Promise<ParseResult> {
    // Parse PDF to text
    const data = await pdf(Buffer.from(content));
    const text = data.text;

    // Split into sections
    const sections = this.splitSections(text);

    // Parse each section
    const cvData: CVData = {
      personalInfo: this.parsePersonalInfo(sections.personal),
      experience: this.parseExperience(sections.experience),
      education: this.parseEducation(sections.education),
      skills: this.parseSkills(sections.skills),
      certifications: this.parseCertifications(sections.certifications),
    };

    return {
      data: cvData,
      metadata: {
        format: this.getFormat(),
        originalFile: '',
        parseDate: new Date().toISOString(),
        confidence: this.calculateConfidence(cvData),
      },
    };
  }

  private splitSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {
      personal: '',
      experience: '',
      education: '',
      skills: '',
      certifications: '',
    };

    // Split text into lines
    const lines = text.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for section headers
      if (line.match(/^[A-Z\s]{2,}$/)) {
        // All caps section headers
        const sectionName = this.getSectionName(line.toLowerCase());
        if (sectionName) {
          currentSection = sectionName;
          continue;
        }
      }

      // Add content to current section
      if (currentSection && line) {
        sections[currentSection] += line + '\n';
      }
    }

    return sections;
  }

  private getSectionName(text: string): string | null {
    if (text.includes('personal') || text.includes('contact')) return 'personal';
    if (text.includes('experience') || text.includes('employment')) return 'experience';
    if (text.includes('education')) return 'education';
    if (text.includes('skills') || text.includes('competencies')) return 'skills';
    if (text.includes('certifications') || text.includes('certificates')) return 'certifications';
    return null;
  }

  private parsePersonalInfo(text: string): CVData['personalInfo'] {
    const info: CVData['personalInfo'] = {
      name: { full: '' },
      contact: {
        email: '',
        phone: '',
      },
    };

    const lines = text.split('\n');
    for (const line of lines) {
      // Look for email addresses
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        info.contact.email = emailMatch[0];
        continue;
      }

      // Look for phone numbers
      const phoneMatch = line.match(/[\d-()+ ]{10,}/);
      if (phoneMatch) {
        info.contact.phone = phoneMatch[0].trim();
        continue;
      }

      // Look for name (usually first non-contact line)
      if (!info.name.full && !line.includes('@') && !line.match(/[\d-()+ ]{10,}/)) {
        info.name.full = line.trim();
      }
    }

    return info;
  }

  private parseExperience(text: string): CVData['experience'] {
    const experiences: CVData['experience'] = [];
    const entries = text.split(/\n(?=[A-Z][^a-z\n]*\n)/); // Split on likely job titles

    for (const entry of entries) {
      const lines = entry.split('\n');
      if (lines.length < 2) continue;

      const title = lines[0].trim();
      let company = '';
      let startDate = '';
      let endDate = '';
      const responsibilities: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!company && line.includes(' at ')) {
          company = line.split(' at ')[1].trim();
        } else if (!startDate && line.match(/\d{4}/)) {
          const dates = line.match(/\d{4}/g);
          if (dates) {
            startDate = dates[0];
            endDate = dates[1] || 'Present';
          }
        } else if (line.startsWith('•') || line.startsWith('-')) {
          responsibilities.push(line.substring(1).trim());
        }
      }

      if (title && company) {
        experiences.push({
          title,
          company,
          startDate,
          endDate,
          responsibilities,
        });
      }
    }

    return experiences;
  }

  private parseEducation(text: string): CVData['education'] {
    const education: CVData['education'] = [];
    const entries = text.split(/\n(?=[A-Z][^a-z\n]*\n)/); // Split on likely degree names

    for (const entry of entries) {
      const lines = entry.split('\n');
      if (lines.length < 2) continue;

      const degree = lines[0].trim();
      let institution = '';
      let year = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!institution && !line.match(/\d{4}/)) {
          institution = line;
        } else if (!year && line.match(/\d{4}/)) {
          year = line.match(/\d{4}/)?.[0] || '';
        }
      }

      if (degree && institution) {
        education.push({
          degree,
          institution,
          year,
        });
      }
    }

    return education;
  }

  private parseSkills(text: string): string[] {
    const skills: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        skills.push(trimmed.substring(1).trim());
      } else if (trimmed && !trimmed.match(/^[A-Z\s]{2,}$/)) {
        // Add non-header lines that aren't bullet points as individual skills
        skills.push(trimmed);
      }
    }

    return skills;
  }

  private parseCertifications(text: string): string[] {
    const certifications: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        certifications.push(trimmed.substring(1).trim());
      } else if (trimmed && !trimmed.match(/^[A-Z\s]{2,}$/)) {
        // Add non-header lines that aren't bullet points as individual certifications
        certifications.push(trimmed);
      }
    }

    return certifications;
  }

  private calculateConfidence(data: CVData): number {
    let confidence = 0;
    const total = 5; // Number of main sections

    // Check personal info
    if (data.personalInfo.name.full && data.personalInfo.contact.email) {
      confidence++;
    }

    // Check experience
    if (data.experience.length > 0) {
      confidence++;
    }

    // Check education
    if (data.education.length > 0) {
      confidence++;
    }

    // Check skills
    if (data.skills.length > 0) {
      confidence++;
    }

    // Check certifications
    if (data.certifications.length > 0) {
      confidence++;
    }

    return (confidence / total) * 100;
  }
}
