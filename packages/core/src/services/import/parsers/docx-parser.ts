import mammoth from 'mammoth';
import type { DocumentParser, ParseResult } from './base-parser.js';
import type { CVData } from '../../../types/cv-base.js';

/**
 * Parser for DOCX CV documents
 */
export class DocxParser implements DocumentParser {
  getFormat(): string {
    return 'docx';
  }

  canParse(file: string, _content: string): boolean {
    return file.toLowerCase().endsWith('.docx');
  }

  async parse(content: string | Buffer): Promise<ParseResult> {
    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ buffer: Buffer.from(content) });
    const html = result.value;

    // Parse sections from HTML
    const sections = this.splitSections(html);

    // Extract data from sections
    const data: CVData = {
      personalInfo: this.parsePersonalInfo(sections.personal),
      experience: this.parseExperience(sections.experience),
      education: this.parseEducation(sections.education),
      skills: this.parseSkills(sections.skills),
      certifications: this.parseCertifications(sections.certifications),
    };

    return {
      data,
      metadata: {
        format: this.getFormat(),
        originalFile: '',
        parseDate: new Date().toISOString(),
        confidence: this.calculateConfidence(data),
      },
      warnings: result.messages,
    };
  }

  private splitSections(html: string): Record<string, string> {
    const sections: Record<string, string> = {
      personal: '',
      experience: '',
      education: '',
      skills: '',
      certifications: '',
    };

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find section headers (h1 elements) and extract content
    const headers = doc.querySelectorAll('h1');
    headers.forEach((header) => {
      const sectionName = this.getSectionName(header.textContent?.toLowerCase() || '');
      if (sectionName) {
        let content = '';
        let currentNode = header.nextElementSibling;

        while (currentNode && currentNode.tagName !== 'H1') {
          content += currentNode.outerHTML;
          currentNode = currentNode.nextElementSibling;
        }

        sections[sectionName] = content;
      }
    });

    return sections;
  }

  private getSectionName(headerText: string): string | null {
    if (headerText.includes('personal') || headerText.includes('contact')) return 'personal';
    if (headerText.includes('experience') || headerText.includes('employment')) return 'experience';
    if (headerText.includes('education')) return 'education';
    if (headerText.includes('skills') || headerText.includes('competencies')) return 'skills';
    if (headerText.includes('certifications') || headerText.includes('certificates'))
      return 'certifications';
    return null;
  }

  private parsePersonalInfo(html: string): CVData['personalInfo'] {
    const info: CVData['personalInfo'] = {
      name: { full: '' },
      contact: {
        email: '',
        phone: '',
      },
    };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for structured data in paragraphs
    doc.querySelectorAll('p').forEach((p) => {
      const text = p.textContent || '';
      if (text.includes('Name:')) {
        info.name.full = text.split('Name:')[1].trim();
      } else if (text.includes('Email:')) {
        info.contact.email = text.split('Email:')[1].trim();
      } else if (text.includes('Phone:')) {
        info.contact.phone = text.split('Phone:')[1].trim();
      }
    });

    return info;
  }

  private parseExperience(html: string): CVData['experience'] {
    const experiences: CVData['experience'] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for experience entries (typically h2 or strong elements followed by details)
    doc.querySelectorAll('h2, strong').forEach((header) => {
      const title = header.textContent?.trim() || '';
      let company = '';
      let startDate = '';
      let endDate = '';
      const responsibilities: string[] = [];

      // Get next siblings until next header
      let currentNode = header.nextElementSibling;
      while (currentNode && !['H2', 'STRONG'].includes(currentNode.tagName)) {
        const text = currentNode.textContent?.trim() || '';

        if (text.startsWith('Company:')) {
          company = text.substring(8).trim();
        } else if (text.startsWith('Period:')) {
          const period = text.substring(7).trim().split(' - ');
          startDate = period[0];
          endDate = period[1] || '';
        } else if (currentNode.tagName === 'LI') {
          responsibilities.push(text);
        }

        currentNode = currentNode.nextElementSibling;
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
    });

    return experiences;
  }

  private parseEducation(html: string): CVData['education'] {
    const education: CVData['education'] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('h2, strong').forEach((header) => {
      const degree = header.textContent?.trim() || '';
      let institution = '';
      let year = '';

      let currentNode = header.nextElementSibling;
      while (currentNode && !['H2', 'STRONG'].includes(currentNode.tagName)) {
        const text = currentNode.textContent?.trim() || '';

        if (text.startsWith('Institution:')) {
          institution = text.substring(12).trim();
        } else if (text.startsWith('Year:')) {
          year = text.substring(5).trim();
        }

        currentNode = currentNode.nextElementSibling;
      }

      if (degree && institution) {
        education.push({
          degree,
          institution,
          year,
        });
      }
    });

    return education;
  }

  private parseSkills(html: string): string[] {
    const skills: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for skills in list items
    doc.querySelectorAll('li').forEach((item) => {
      const skill = item.textContent?.trim();
      if (skill) {
        skills.push(skill);
      }
    });

    return skills;
  }

  private parseCertifications(html: string): string[] {
    const certifications: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Look for certifications in list items
    doc.querySelectorAll('li').forEach((item) => {
      const cert = item.textContent?.trim();
      if (cert) {
        certifications.push(cert);
      }
    });

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
