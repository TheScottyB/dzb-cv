import { BaseTemplate } from './base-template.js';
import { CVData } from '../../../types/cv-base.js';
import { AcademicCVData } from '../../../types/academic-types.js';

/**
 * Academic CV template following standard academic formatting
 */
export class AcademicTemplate extends BaseTemplate {
  protected name = 'academic';

  protected generateHeader(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }

    const { personalInfo } = data;
    const website = data.profiles?.website ? `\n${data.profiles.website}` : '';

    return `
# ${personalInfo.name.full}
${personalInfo.title ? `<div style="color:#666;font-size:18px;">${personalInfo.title}</div>` : ''}

<div class="contact-info">
${[
  personalInfo.contact.email,
  personalInfo.contact.phone,
  personalInfo.contact.address
].filter(Boolean).join(' | ')}${website}
</div>
    `.trim();
  }

  protected generateProfessionalSummary(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.professionalSummary) return '';
    return `
## Professional Summary

${data.professionalSummary}
    `.trim();
  }

  protected generateExperience(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.experience?.length) return '';

    const experiences = data.experience.sort((a, b) => {
      const aEnd = a.endDate || 'Present';
      const bEnd = b.endDate || 'Present';
      return bEnd.localeCompare(aEnd);
    });

    return `
## Professional Experience

${experiences.map(exp => `
<div class="experience-item">
<div class="position">${exp.position}</div>
<div class="employer">${exp.employer}</div>
<div class="dates">${exp.startDate} - ${exp.endDate || 'Present'}</div>
${exp.responsibilities.length ? `<div class="responsibilities">${exp.responsibilities.map(r => `- ${r}`).join('\n')}</div>` : ''}
${exp.achievements?.length ? `<div class="achievements">${exp.achievements.map(a => `- ${a}`).join('\n')}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  protected generateEducation(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.education?.length) return '';

    const education = data.education.sort((a, b) => b.year.localeCompare(a.year));

    return `
## Education

${education.map(edu => `
<div class="education-item">
<div class="degree">${edu.degree}</div>
<div class="institution">${edu.institution}</div>
<div class="year">${edu.year}</div>
${edu.field ? `<div class="field">${edu.field}</div>` : ''}
${edu.notes ? `<div class="notes">${edu.notes}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  protected generateSkills(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.skills?.length) return '';

    return `
## Skills

<div class="skills-list">
${data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('\n')}
</div>
    `.trim();
  }

  protected generatePublications(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.publications?.length) return '';

    const publications = data.publications.sort((a, b) => b.year.localeCompare(a.year));
    
    return `
## Publications

${publications.map(pub => `
<div class="publication-item">
<div class="title">${pub.title}</div>
<div class="authors">${pub.authors}</div>
<div class="journal">${pub.journal}</div>
<div class="year">${pub.year}</div>
</div>
`).join('\n')}
    `.trim();
  }

  protected generateConferences(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.conferences?.length) return '';

    const conferences = data.conferences.sort((a, b) => b.year.localeCompare(a.year));
    
    return `
## Conference Presentations

${conferences.map(conf => `
<div class="conference-item">
<div class="title">${conf.title}</div>
<div class="authors">${conf.authors}</div>
<div class="conference">${conf.conferenceName}</div>
<div class="location">${conf.location}</div>
<div class="year">${conf.year}</div>
</div>
`).join('\n')}
    `.trim();
  }

  protected generateGrants(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.grants?.length) return '';

    const grants = data.grants.sort((a, b) => b.year.localeCompare(a.year));
    
    return `
## Grants and Funding

${grants.map(grant => `
<div class="grant-item">
<div class="title">${grant.title}</div>
<div class="agency">${grant.agency}</div>
<div class="amount">${grant.amount}</div>
<div class="year">${grant.year}</div>
</div>
`).join('\n')}
    `.trim();
  }

  protected generateAwards(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.awards?.length) return '';

    const awards = data.awards
      .filter(award => award.year)
      .sort((a, b) => (b.year || '').localeCompare(a.year || ''));
    
    return `
## Awards and Honors

${awards.map(award => `
<div class="award-item">
<div class="title">${award.title}</div>
<div class="organization">${award.organization}</div>
<div class="year">${award.year}</div>
${award.description ? `<div class="description">${award.description}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  protected generateResearchInterests(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.researchInterests?.length) return '';

    return `
## Research Interests

${data.researchInterests.map(interest => `- ${interest}`).join('\n')}
    `.trim();
  }

  protected generateAcademicService(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    if (!data.academicService?.length) return '';

    return `
## Academic Service

${data.academicService.map(service => `
<div class="service-item">
<div class="role">${service.role}</div>
<div class="organization">${service.organization}</div>
<div class="period">${service.period}</div>
${service.description ? `<div class="description">${service.description}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  public override generate(data: CVData): string {
    if (!this.isAcademicCVData(data)) {
      throw new Error('Invalid data type for academic template');
    }
    return `
${this.generateHeader(data)}
${this.generateProfessionalSummary(data)}
${this.generateResearchInterests(data)}
${this.generateEducation(data)}
${this.generateExperience(data)}
${this.generatePublications(data)}
${this.generateConferences(data)}
${this.generateGrants(data)}
${this.generateAwards(data)}
${this.generateSkills(data)}
${this.generateAcademicService(data)}
    `.trim();
  }

  private isAcademicCVData(data: CVData): data is AcademicCVData {
    return 'publications' in data && 'conferences' in data && 'grants' in data;
  }

  public getStyles(): string {
    return `
<style>
.contact-info {
  margin-bottom: 20px;
  color: #666;
}

.experience-item {
  margin-bottom: 15px;
}

.date-range {
  color: #666;
  font-size: 0.9em;
}

.institution {
  font-weight: bold;
}

.publication-item, .conference-item, .grant-item, .award-item {
  margin-bottom: 15px;
}

.title {
  font-weight: bold;
}

.authors, .journal, .conference, .location, .year, .type, .doi, .status, .organization, .description {
  color: #666;
  font-size: 0.9em;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-item {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
    `.trim();
  }
}