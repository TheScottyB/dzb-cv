 
// No Template or PDFGenerationOptions imports needed here
import type { CVData } from '@dzb-cv/types';
interface MarkdownTemplate {
  name: string;
  description: string;
  render(_cv: CVData, _options?: Record<string, unknown>): string;
  getStyles?(): string;
}

export class BasicTemplate implements MarkdownTemplate {
  readonly name = 'basic';
  readonly description = 'A basic, clean Markdown template.'; // Corrected syntax

  // Method to render CV data into Markdown string
  render(cv: CVData, _options?: Record<string, unknown>): string {
    let output = '';
    output += `# ${cv.personalInfo.name.full}\n\n`;

    const contact = cv.personalInfo.contact;
    const contactParts = [];
    if (contact.email !== '') contactParts.push(contact.email);
    if (contact.phone !== '') contactParts.push(contact.phone);
    if (contactParts.length > 0) {
      output += `${contactParts.join(' | ')}\n`;
    }
    if (contact.address != null && contact.address !== '') output += `${contact.address}\n`;
    if (contact.linkedin != null && contact.linkedin !== '')
      output += `LinkedIn: ${contact.linkedin}\n`;
    output += '\n';

    // Experience - always include section header
    output += '## Experience\n\n';
    if (cv.experience.length > 0) {
      for (const exp of cv.experience) {
        const position = exp.position || 'Position';
        const employer = exp.employer || 'Employer';
        const startDate = exp.startDate || '';
        const endDate = exp.endDate ?? 'Present';

        output += `### ${position} at ${employer}\n`;
        if (startDate !== '' || endDate !== '') {
          output += `${startDate}${startDate !== '' ? ' - ' : ''}${endDate}\n\n`;
        }

        if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
          output += exp.responsibilities
            .filter((r: string) => r !== '')
            .map((r: string) => `- ${r}`)
            .join('\n');
          output += '\n\n';
        } else {
          output += '\n';
        }
      }
    } else {
      output += '\n';
    }

    // Education - always include section header
    output += '## Education\n\n';
    if (cv.education.length > 0) {
      for (const edu of cv.education) {
        const degree = edu.degree || 'Degree';
        const field = edu.field ? ` (${edu.field})` : '';
        const institution = edu.institution || 'Institution';
        const graduationDate = edu.graduationDate || '';

        output += `### ${degree}${field}\n`;
        if (institution !== '' || graduationDate !== '') {
          output += `${institution}${institution !== '' && graduationDate !== '' ? ', ' : ''}${graduationDate}\n\n`;
        } else {
          output += '\n';
        }
      }
    } else {
      output += '\n';
    }

    // Skills - always include section header
    output += '## Skills\n\n';
    if (cv.skills.length > 0) {
      output += cv.skills
        .filter((skill: { name?: string }) => skill.name != null && skill.name !== '')
        .map((skill: { name: string }) => `- ${skill.name}`)
        .join('\n');
      output += '\n\n';
    } else {
      output += '\n';
    }

    return output;
  }

  getStyles(): string {
    return `
      /* Base styles with improved typography */
      body {
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 25mm 20mm;
        color: #333;
        max-width: 210mm; /* A4 width */
        margin: 0 auto;
        background-color: #fff;
        font-size: 10.5pt; /* Optimal size for reading */
      }
      
      /* Header - Name styling */
      h1 {
        font-size: 22pt;
        font-weight: 700;
        margin: 0 0 12pt 0;
        color: #1a1a1a;
        letter-spacing: -0.01em;
        border-bottom: 1pt solid #ddd;
        padding-bottom: 8pt;
      }
      
      /* Contact information styling */
      .contact-info {
        font-size: 10pt;
        color: #505050;
        margin-bottom: 15pt;
        display: flex;
        flex-wrap: wrap;
        gap: 10pt;
      }
      
      .contact-info a {
        color: #2c5282;
        text-decoration: none;
      }
      
      .contact-info a:hover {
        text-decoration: underline;
      }
      
      /* Section headers */
      h2 {
        font-size: 14pt;
        font-weight: 600;
        margin: 20pt 0 10pt 0;
        padding-bottom: 5pt;
        border-bottom: 0.75pt solid #e5e5e5;
        color: #2d3748;
        page-break-after: avoid;
      }
      
      /* Subsections - experience and education items */
      h3 {
        font-size: 12pt;
        font-weight: 600;
        margin: 12pt 0 5pt 0;
        color: #4a5568;
        page-break-after: avoid;
      }
      
      /* Date ranges and institutions */
      .date-range, .institution {
        font-size: 10pt;
        font-style: italic;
        color: #666;
        margin-bottom: 5pt;
      }
      
      /* Lists styling - better bullets and spacing */
      ul {
        margin: 8pt 0 12pt 0;
        padding-left: 18pt;
        list-style-type: square;
      }
      
      li {
        margin: 3pt 0;
        padding-left: 3pt;
      }
      
      /* Skills section styling */
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8pt;
        margin-top: 5pt;
      }
      
      .skill-item {
        background-color: #f5f5f5;
        padding: 3pt 8pt;
        border-radius: 3pt;
        font-size: 9.5pt;
      }
      
      /* Print optimization */
      @media print {
        body {
          padding: 15mm;
          font-size: 10pt;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        
        h1 {
          font-size: 18pt;
        }
        
        h2 {
          font-size: 13pt;
        }
        
        h3 {
          font-size: 11pt;
        }
        
        a {
          text-decoration: none;
          color: #333;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        /* Avoid page breaks inside items */
        li, h3, h2 + p {
          page-break-inside: avoid;
        }
      }
      
      /* Responsive design for smaller screens */
      @media screen and (max-width: 600px) {
        body {
          padding: 15px;
          font-size: 14px;
        }
        
        h1 {
          font-size: 20px;
        }
        
        h2 {
          font-size: 18px;
        }
        
        h3 {
          font-size: 16px;
        }
      }
    `;
  }
}
