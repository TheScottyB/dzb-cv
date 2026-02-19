import React, { useRef } from 'react';
import type { useCVStore } from '../hooks/useCVStore';
import './PreviewPage.css';

interface Props {
  store: ReturnType<typeof useCVStore>;
}

function buildHTMLDocument(store: Props['store']): string {
  const { cvData } = store;
  const pi = cvData.personalInfo;

  const contactParts: string[] = [];
  if (pi.contact.email) contactParts.push(pi.contact.email);
  if (pi.contact.phone) contactParts.push(pi.contact.phone);
  if (pi.contact.address) contactParts.push(pi.contact.address);

  let body = '';
  body += `<h1>${escapeHTML(pi.name.full)}</h1>\n`;
  if (pi.professionalTitle) {
    body += `<p class="title">${escapeHTML(pi.professionalTitle)}</p>\n`;
  }
  if (contactParts.length > 0) {
    body += `<p class="contact">${contactParts.map(escapeHTML).join(' | ')}</p>\n`;
  }
  if (pi.summary) {
    body += `<h2>Summary</h2>\n<p>${escapeHTML(pi.summary)}</p>\n`;
  }

  if (cvData.experience.length > 0) {
    body += `<h2>Experience</h2>\n`;
    for (const exp of cvData.experience) {
      body += `<h3>${escapeHTML(exp.position)} at ${escapeHTML(exp.employer)}</h3>\n`;
      body += `<p class="date">${escapeHTML(exp.startDate)} - ${escapeHTML(exp.endDate || 'Present')}</p>\n`;
      if (exp.responsibilities.length > 0) {
        body += '<ul>\n';
        for (const r of exp.responsibilities) {
          body += `  <li>${escapeHTML(r)}</li>\n`;
        }
        body += '</ul>\n';
      }
    }
  }

  if (cvData.education.length > 0) {
    body += `<h2>Education</h2>\n`;
    for (const edu of cvData.education) {
      const field = edu.field ? ` in ${escapeHTML(edu.field)}` : '';
      body += `<h3>${escapeHTML(edu.degree)}${field}</h3>\n`;
      body += `<p>${escapeHTML(edu.institution)}`;
      if (edu.graduationDate) body += `, ${escapeHTML(edu.graduationDate)}`;
      body += `</p>\n`;
    }
  }

  if (cvData.skills.length > 0) {
    body += `<h2>Skills</h2>\n<ul>\n`;
    for (const skill of cvData.skills) {
      if (skill.name) {
        const level = skill.level ? ` (${escapeHTML(skill.level)})` : '';
        body += `  <li>${escapeHTML(skill.name)}${level}</li>\n`;
      }
    }
    body += '</ul>\n';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CV - ${escapeHTML(pi.name.full || 'Untitled')}</title>
<style>
  body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
  h1 { font-size: 22pt; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; color: #1a1a1a; }
  h2 { font-size: 14pt; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; margin-top: 1.5rem; }
  h3 { font-size: 12pt; color: #374151; margin-bottom: 0.25rem; }
  .title { font-size: 12pt; color: #2563eb; margin-top: -0.5rem; }
  .contact { font-size: 10pt; color: #6b7280; }
  .date { font-size: 10pt; color: #6b7280; font-style: italic; margin-top: -0.5rem; }
  ul { padding-left: 1.25rem; }
  li { margin: 0.25rem 0; }
  @media print { body { padding: 15mm; font-size: 10pt; } h1 { font-size: 18pt; } h2 { font-size: 13pt; } h3 { font-size: 11pt; } }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function PreviewPage({ store }: Props) {
  const { cvData } = store;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = buildHTMLDocument(store);

  function handleDownload() {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = cvData.personalInfo.name.full.trim() || 'Untitled';
    a.href = url;
    a.download = `CV-${name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="preview-page">
      <div className="preview-header">
        <h1>Preview</h1>
        <button className="btn btn-primary" onClick={handleDownload}>
          Download PDF
        </button>
      </div>

      <div className="preview-container">
        <iframe
          ref={iframeRef}
          title="CV Preview"
          srcDoc={htmlContent}
          className="preview-iframe"
        />
      </div>
    </div>
  );
}
