import type { DocumentParser, ParseResult } from './base-parser.js';
import type { CVData } from '../../../types/cv-base.js';

/**
 * Parser for markdown CV documents
 */
export class MarkdownParser implements DocumentParser {
  getFormat(): string {
    return 'markdown';
  }

  canParse(file: string, content: string): boolean {
    return file.endsWith('.md') || file.endsWith('.markdown') || this.looksLikeMarkdown(content);
  }

  private looksLikeMarkdown(content: string): boolean {
    // Check for common markdown indicators
    return (
      content.includes('#') || // Headers
      content.includes('- ') || // Lists
      content.includes('```') || // Code blocks
      content.includes('*') || // Emphasis
      content.includes('|')
    ); // Tables
  }

  async parse(content: string | Buffer): Promise<ParseResult> {
    // Convert Buffer to string if needed
    const textContent = Buffer.isBuffer(content) ? content.toString('utf-8') : content;

    const sections = this.splitSections(textContent);
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
    };
  }

  private splitSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {
      personal: '',
      experience: '',
      education: '',
      skills: '',
      certifications: '',
    };

    let currentSection = '';
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('# ')) {
        const header = line.substring(2).toLowerCase();
        switch (header) {
          case 'personal information':
            currentSection = 'personal';
            break;
          case 'experience':
          case 'work experience':
            currentSection = 'experience';
            break;
          case 'education':
            currentSection = 'education';
            break;
          case 'skills':
            currentSection = 'skills';
            break;
          case 'certifications':
            currentSection = 'certifications';
            break;
        }
      } else if (currentSection) {
        sections[currentSection] += line + '\n';
      }
    }

    return sections;
  }

  private parsePersonalInfo(content: string): CVData['personalInfo'] {
    const lines = content.split('\n');
    const info: CVData['personalInfo'] = {
      name: { full: '' },
      contact: {
        email: '',
        phone: '',
      },
    };

    for (const line of lines) {
      if (line.startsWith('Name:')) {
        info.name.full = line.substring(5).trim();
      } else if (line.startsWith('Email:')) {
        info.contact.email = line.substring(6).trim();
      } else if (line.startsWith('Phone:')) {
        info.contact.phone = line.substring(6).trim();
      }
    }

    return info;
  }

  private parseExperience(content: string): CVData['experience'] {
    const experiences: CVData['experience'] = [];
    const entries = content.split('\n## ').filter(Boolean);

    for (const entry of entries) {
      const lines = entry.split('\n');
      const title = lines[0].trim();
      let company = '';
      let startDate = '';
      let endDate = '';
      const responsibilities: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('Company:')) {
          company = line.substring(8).trim();
        } else if (line.startsWith('Period:')) {
          const period = line.substring(7).trim().split(' - ');
          startDate = period[0];
          endDate = period[1] || '';
        } else if (line.startsWith('- ')) {
          responsibilities.push(line.substring(2));
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

  private parseEducation(content: string): CVData['education'] {
    const education: CVData['education'] = [];
    const entries = content.split('\n## ').filter(Boolean);

    for (const entry of entries) {
      const lines = entry.split('\n');
      const degree = lines[0].trim();
      let institution = '';
      let year = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('Institution:')) {
          institution = line.substring(12).trim();
        } else if (line.startsWith('Year:')) {
          year = line.substring(5).trim();
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

  private parseSkills(content: string): string[] {
    const skills: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('- ')) {
        skills.push(line.substring(2).trim());
      }
    }

    return skills;
  }

  private parseCertifications(content: string): string[] {
    const certifications: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('- ')) {
        certifications.push(line.substring(2).trim());
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
