import { BasicTemplate } from './template-provider.js';
import type { CVData } from '../../../types/cv-base.js';
import type { TemplateOptions } from '../../../types/cv-generation.js';
import type { 
  AcademicCVData,
  Publication,
  Conference,
  Grant,
  Award
} from '../../../types/academic-types.js';

/**
 * Academic CV template following standard academic formatting
 */
export class AcademicTemplate extends BasicTemplate {
  name = 'academic';

  getStyles(): string {
    return `
      body {
        font-family: 'Garamond', 'Georgia', serif;
        line-height: 1.5;
        margin: 0;
        padding: 25mm;
        color: #000;
        font-size: 11pt;
      }
      h1 {
        font-size: 16pt;
        text-align: center;
        margin-bottom: 6mm;
        font-weight: normal;
      }
      h2 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 10mm;
        margin-bottom: 5mm;
        border-bottom: 0.5pt solid #000;
        text-transform: uppercase;
        letter-spacing: 1pt;
      }
      h3 {
        font-size: 11pt;
        font-weight: bold;
        margin-bottom: 2mm;
        margin-top: 4mm;
      }
      .contact-info {
        text-align: center;
        margin-bottom: 10mm;
        font-size: 10pt;
      }
      .institution {
        font-weight: bold;
      }
      .date-range {
        float: right;
        font-style: italic;
      }
      .experience-item {
        margin-bottom: 8mm;
        page-break-inside: avoid;
        clear: both;
      }
      .publication {
        margin-bottom: 4mm;
        padding-left: 12mm;
        text-indent: -12mm;
      }
      ul {
        margin: 2mm 0;
        padding-left: 6mm;
      }
      li {
        margin-bottom: 2mm;
      }
      .section-break {
        margin-top: 6mm;
      }
      @media print {
        body {
          padding: 20mm;
        }
        .page-break {
          page-break-after: always;
        }
      }
    `;
  }

  protected generateHeader(data: CVData, options?: TemplateOptions): string {
    if (options?.includePersonalInfo === false) return '';

    const { personalInfo } = data;
    return `
# ${personalInfo.name.full}${personalInfo.title ? `, ${personalInfo.title}` : ''}

<div class="contact-info">
${personalInfo.contact.address || ''}\n
${personalInfo.contact.email} | ${personalInfo.contact.phone}
${data.profiles?.linkedIn ? `\nLinkedIn: ${data.profiles.linkedIn}` : ''}
</div>
    `.trim();
  }

  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    if (options?.includeEducation === false || !data.education.length) return '';

    return `
## Education

${data.education.map(edu => `
<div class="experience-item">
<span class="date-range">${edu.year}</span>
<div class="institution">${edu.institution}</div>
<div>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
${edu.notes ? `<div>${edu.notes}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  protected generateExperience(data: CVData, options?: TemplateOptions): string {
    if (options?.includeExperience === false || !data.experience.length) return '';

    const academicExperience = data.experience.filter(exp => 
      (exp as any).employment_type === 'academic' || 
      (exp as any).employment_type === 'research'
    );

    const teachingExperience = data.experience.filter(exp => 
      (exp as any).employment_type === 'teaching'
    );

    return `
## Academic Appointments

${this.formatExperienceSection(academicExperience)}

${teachingExperience.length ? `
## Teaching Experience

${this.formatExperienceSection(teachingExperience)}
` : ''}
    `.trim();
  }

  private formatExperienceSection(experience: any[]): string {
    return experience.map(exp => `
<div class="experience-item">
<span class="date-range">${exp.startDate} - ${exp.endDate || 'Present'}</span>
<div class="institution">${exp.company}</div>
<div>${exp.title}</div>
${exp.responsibilities.map((r: string) => `- ${r}`).join('\n')}
</div>
`).join('\n');
  }

  private generatePublications(data: AcademicCVData): string {
    if (!data.publications?.length) return '';

    return `
## Publications

${data.publications.map((pub) => `
<div class="publication">
${pub.authors} (${pub.year}). ${pub.title}. *${pub.journal}*, ${pub.volume}${pub.issue ? `(${pub.issue})` : ''}, ${pub.pages}.
</div>
`).join('\n')}
    `.trim();
  }

  private generateGrants(data: AcademicCVData): string {
    if (!data.grants?.length) return '';

    return `
## Grants and Funding

${data.grants.map((grant) => `
<div class="experience-item">
<span class="date-range">${grant.year}</span>
<div>${grant.title}</div>
<div>${grant.amount}, ${grant.agency}</div>
${grant.description ? `<div>${grant.description}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  /**
   * Generate conferences section
   */
  private generateConferences(data: AcademicCVData): string {
    if (!data.conferences?.length) return '';

    return `
## Conference Presentations

${data.conferences.map((conf) => `
<div class="experience-item">
<span class="date-range">${conf.year}</span>
<div class="publication">
${conf.authors}. <em>${conf.title}</em>. ${conf.conferenceName}, ${conf.location}.
</div>
${conf.description ? `<div>${conf.description}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  /**
   * Generate awards and honors section
   */
  private generateAwards(data: AcademicCVData): string {
    if (!data.awards?.length) return '';

    return `
## Awards and Honors

${data.awards.map((award) => `
<div class="experience-item">
<span class="date-range">${award.year}</span>
<div><strong>${award.title}</strong>${award.organization ? `, ${award.organization}` : ''}</div>
${award.description ? `<div>${award.description}</div>` : ''}
</div>
`).join('\n')}
    `.trim();
  }

  generateMarkdown(data: CVData, options?: TemplateOptions): string {
    const academicData = data as AcademicCVData;
    const sections = [
      this.generateHeader(data, options),
      this.generateEducation(data, options),
      this.generateExperience(data, options),
      this.generatePublications(academicData),
      this.generateConferences(academicData),
      this.generateGrants(academicData),
      this.generateAwards(academicData),
      this.generateSkills(data, options)
    ].filter(Boolean);

    return sections.join('\n\n');
  }
}

