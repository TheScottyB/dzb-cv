import React, { useMemo, useRef } from 'react';
import { marked } from 'marked';
import { BasicTemplate, ModernTemplate } from '@dzb-cv/templates';
import type { useCVStore } from '../hooks/useCVStore';
import './PreviewPage.css';

interface Props {
  store: ReturnType<typeof useCVStore>;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render the CV through the selected template into a standalone HTML document. */
function renderDocument(store: Props['store']): string {
  const { cvData, template } = store;
  const title = `CV - ${escapeHTML(cvData.personalInfo.name.full.trim() || 'Untitled')}`;

  let body: string;
  let styles: string;
  if (template === 'basic') {
    const basic = new BasicTemplate();
    body = marked.parse(basic.render(cvData), { async: false });
    styles = basic.getStyles();
  } else {
    const modern = new ModernTemplate();
    body = modern.render(cvData);
    styles = modern.getStyles();
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>${styles}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function PreviewPage({ store }: Props) {
  const { cvData, template } = store;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = useMemo(() => renderDocument(store), [cvData, template]);

  function handlePrint() {
    // sandbox="allow-same-origin" (without allow-scripts) keeps the document
    // inert while still letting the parent invoke the print dialog, where the
    // user can save as a real PDF.
    iframeRef.current?.contentWindow?.print();
  }

  function handleDownloadHTML() {
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
        <div className="preview-meta">
          <span className="template-badge">Template: {template}</span>
          <button className="btn btn-primary" onClick={handlePrint}>
            Print / Save as PDF
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadHTML}>
            Download HTML
          </button>
        </div>
      </div>

      <div className="preview-container">
        <iframe
          ref={iframeRef}
          title="CV Preview"
          srcDoc={htmlContent}
          sandbox="allow-same-origin allow-modals"
          className="preview-iframe"
        />
      </div>
    </div>
  );
}
