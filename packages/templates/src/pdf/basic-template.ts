import { BaseTemplate } from './base-template.js';
import type { CVData } from '@dzb-cv/core/types';
import type { TemplateOptions } from '@dzb-cv/core/types';

export class BasicTemplate extends BaseTemplate {
  protected name = 'basic';

  protected generatePersonalInfo(data: CVData, options?: TemplateOptions): string {
    if (!data.personalInfo?.name?.full || options?.hidePersonalInfo) return '';
    return `# ${data.personalInfo.name.full}\n\n${data.personalInfo.summary || ''}`;
  }

  protected generateExperience(data: CVData, options?: TemplateOptions): string {
    if (!data.experience?.length || options?.hideExperience) return '';
    
    let md = '## Professional Experience\n\n';
    for (const exp of data.experience) {
      const position = exp.title || exp.position || '';
      const employer = exp.company || exp.employer || '';
      const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
      
      md += `### ${position} at ${employer}\n`;
      md += `${dateRange}\n\n`;
      
      if (exp.responsibilities?.length) {
        for (const r of exp.responsibilities) {
          md += `- ${r}\n`;
        }
        md += '\n';
      }
    }
    return md;
  }

  protected generateEducation(data: CVData, options?: TemplateOptions): string {
    if (!data.education?.length || options?.hideEducation) return '';
    
    let md = '## Education\n\n';
    for (const edu of data.education) {
      md += `### ${edu.degree} - ${edu.institution}\n`;
      md += `${edu.completionDate || edu.year || ''}\n\n`;
    }
    return md;
  }

  protected generateSkills(data: CVData, options?: TemplateOptions): string {
    if (!data.skills?.length || options?.hideSkills) return '';
    
    let md = '## Skills\n\n';
    for (const skill of data.skills) {
      md += `- ${skill}\n`;
    }
    return md;
  }

  protected generateProjects(data: CVData, options?: TemplateOptions): string {
    if (!data.projects?.length || options?.hideProjects) return '';
    
    let md = '## Projects\n\n';
    for (const project of data.projects) {
      md += `### ${project.name}\n`;
      if (project.description) md += `${project.description}\n\n`;
    }
    return md;
  }

  protected generatePublications(data: CVData, options?: TemplateOptions): string {
    if (!data.publications?.length || options?.hidePublications) return '';
    
    let md = '## Publications\n\n';
    for (const pub of data.publications) {
      md += `- ${pub.title} (${pub.year})\n`;
      if (pub.citation) md += `  ${pub.citation}\n`;
    }
    return md;
  }

  protected generateCertifications(data: CVData, options?: TemplateOptions): string {
    if (!data.certifications?.length || options?.hideCertifications) return '';
    
    let md = '## Certifications\n\n';
    for (const cert of data.certifications) {
      md += `- ${cert.name} (${cert.year})\n`;
      if (cert.issuer) md += `  Issued by: ${cert.issuer}\n`;
    }
    return md;
  }

  protected generateLanguages(data: CVData, options?: TemplateOptions): string {
    if (!data.languages?.length || options?.hideLanguages) return '';
    
    let md = '## Languages\n\n';
    for (const lang of data.languages) {
      md += `- ${lang.name}: ${lang.proficiency}\n`;
    }
    return md;
  }

  protected generateVolunteer(data: CVData, options?: TemplateOptions): string {
    if (!data.volunteer?.length || options?.hideVolunteer) return '';
    
    let md = '## Volunteer Work\n\n';
    for (const vol of data.volunteer) {
      md += `### ${vol.organization}\n`;
      md += `${vol.position} (${vol.startDate} - ${vol.endDate || 'Present'})\n`;
      if (vol.description) md += `${vol.description}\n\n`;
    }
    return md;
  }

  protected generateAwards(data: CVData, options?: TemplateOptions): string {
    if (!data.awards?.length || options?.hideAwards) return '';
    
    let md = '## Awards & Honors\n\n';
    for (const award of data.awards) {
      md += `- ${award.name} (${award.year})\n`;
      if (award.issuer) md += `  Awarded by: ${award.issuer}\n`;
    }
    return md;
  }

  protected generateReferences(data: CVData, options?: TemplateOptions): string {
    if (!data.references?.length || options?.hideReferences) return '';
    
    let md = '## References\n\n';
    for (const ref of data.references) {
      md += `### ${ref.name}\n`;
      md += `${ref.title} at ${ref.organization}\n`;
      if (ref.contact) md += `Contact: ${ref.contact}\n\n`;
    }
    return md;
  }

  protected generateConferences(data: CVData, options?: TemplateOptions): string {
    if (!data.conferences?.length || options?.hideConferences) return '';
    
    let md = '## Conference Presentations\n\n';
    for (const conf of data.conferences) {
      md += `- ${conf.title} (${conf.year})\n`;
      md += `  ${conf.conference}, ${conf.location}\n`;
    }
    return md;
  }

  protected generateGrants(data: CVData, options?: TemplateOptions): string {
    if (!data.grants?.length || options?.hideGrants) return '';
    
    let md = '## Grants & Funding\n\n';
    for (const grant of data.grants) {
      md += `- ${grant.title} (${grant.year})\n`;
      md += `  Amount: ${grant.amount}, Funded by: ${grant.funder}\n`;
    }
    return md;
  }

  getStyles(): string {
    return `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #fff;
        color: #333;
        padding: 20mm;
      }
      @media print {
        body {
          padding: 10mm;
        }
      }
    `;
  }
}
