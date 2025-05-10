import type { CVData, Template, PDFGenerationOptions } from '@dzb-cv/types';

export abstract class BaseTemplate implements Template {
  abstract id: string; // Add required id property
  abstract name: string;
  abstract description: string; // Add required description property

  abstract render(data: CVData, options?: PDFGenerationOptions): string; // Remove Promise<string>

  getStyles(): string {
    return '';
  }
}

export class DefaultTemplate extends BaseTemplate {
  id = 'default';
  name = 'default';
  description = 'Default CV template with clean, professional layout';
  render(data: CVData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${this.getStyles()}</style>
        </head>
        <body>
          <h1>${data.personalInfo.name.full}</h1>
          <p>${data.personalInfo.contact.email}</p>
          
          <h2>Experience</h2>
          ${data.experience
            .map(
              (exp) => `
            <div class="experience">
              <h3>${exp.position} at ${exp.employer}</h3>
              <p>${exp.startDate} - ${exp.endDate || 'Present'}</p>
              ${
                exp.responsibilities
                  ? `
                <ul>
                  ${exp.responsibilities.map((r) => `<li>${r}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
          
          <h2>Education</h2>
          ${data.education
            .map(
              (edu) => `
            <div class="education">
              <h3>${edu.degree}</h3>
              <p>${edu.institution}, ${edu.graduationDate}</p>
            </div>
          `
            )
            .join('')}
          
          <h2>Skills</h2>
          <ul>
            ${data.skills.map((skill) => `<li>${skill.name}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
  }

  getStyles(): string {
    return `
      body { font-family: Arial, sans-serif; margin: 40px; }
      h1 { color: #333; }
      h2 { color: #666; border-bottom: 1px solid #eee; }
      .experience, .education { margin-bottom: 20px; }
      ul { margin-top: 10px; }
    `;
  }
}

export const defaultTemplate = new DefaultTemplate();
