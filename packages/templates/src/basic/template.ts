import type { CVData, Template, PDFGenerationOptions } from '@dzb-cv/types';

export class BasicTemplate implements Template {
  readonly name = 'basic';

  render(data: CVData, _options?: PDFGenerationOptions): string {
    let output = '';

    // Personal Info
    output += `# ${data.personalInfo.name.full}\n\n`;
    if (data.personalInfo.contact) {
      const contact = data.personalInfo.contact;
      output += `${contact.email}${contact.phone ? ` | ${contact.phone}` : ''}\n`;
      if (contact.address) output += `${contact.address}\n`;
      if (contact.linkedin) output += `LinkedIn: ${contact.linkedin}\n`;
    }
    output += '\n';

    // Experience
    if (data.experience.length > 0) {
      output += '## Experience\n\n';
      for (const exp of data.experience) {
        output += `### ${exp.position} at ${exp.employer}\n`;
        output += `${exp.startDate} - ${exp.endDate || 'Present'}\n\n`;
        if (exp.responsibilities?.length) {
          output += exp.responsibilities.map(r => `- ${r}`).join('\n');
          output += '\n\n';
        }
      }
    }

    // Education
    if (data.education.length > 0) {
      output += '## Education\n\n';
      for (const edu of data.education) {
        output += `### ${edu.degree}\n`;
        output += `${edu.institution}, ${edu.year}\n\n`;
      }
    }

    // Skills
    if (data.skills.length > 0) {
      output += '## Skills\n\n';
      output += data.skills.map(skill => `- ${skill.name}`).join('\n');
      output += '\n\n';
    }

    return output;
  }

  getStyles(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        color: #333;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 20px;
        color: #1a1a1a;
      }
      h2 {
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #ccc;
        color: #444;
      }
      h3 {
        font-size: 16px;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #666;
      }
      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      li {
        margin: 5px 0;
      }
    `;
  }
}
