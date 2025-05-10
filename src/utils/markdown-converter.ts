import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { mangle } from 'marked-mangle';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { markedSmartypants } from 'marked-smartypants';

interface MarkdownTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  spacing: string;
}

const defaultTheme: MarkdownTheme = {
  primaryColor: '#006633', // Forest green
  secondaryColor: '#333333',
  accentColor: '#cc3333',
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  lineHeight: '1.6',
  spacing: '1.5rem',
};

export class MarkdownConverter {
  private theme: MarkdownTheme;
  private pdfMode: boolean;

  constructor(theme: Partial<MarkdownTheme> = {}, pdfMode = false) {
    this.theme = { ...defaultTheme, ...theme };
    this.pdfMode = pdfMode;
    this.configureMarked();
  }

  private configureMarked(): void {
    // Configure marked with extensions
    marked.use(
      gfmHeadingId(), // GitHub-style heading IDs
      mangle(), // Mangle email addresses
      markedSmartypants(), // Smart typography
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        },
      })
    );

    // Set options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Add <br> on single line breaks
    });
  }

  /**
   * Converts markdown to HTML, with options to suppress extra headings and optimize for PDF.
   * @param markdown The markdown content
   * @param title Optional document title
   * @param subtitle Optional document subtitle
   * @param opts Optional options: { suppressHeadings?: boolean, pdfMode?: boolean }
   */
  public convertToHTML(
    markdown: string,
    title?: string,
    subtitle?: string,
    opts: { suppressHeadings?: boolean; pdfMode?: boolean } = {}
  ): string {
    let content = markdown;
    let suppressHeadings = opts.suppressHeadings ?? false;
    let pdfMode = opts.pdfMode ?? this.pdfMode;

    // If suppressHeadings is true and markdown starts with a heading, remove it
    if (suppressHeadings) {
      content = content.replace(/^# .+\n?/, '').replace(/^## .+\n?/, '');
    }
    const htmlContent = marked(content);
    const css = this.generateCSS(pdfMode);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Generated Document'}</title>
  <style>${css}</style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
</head>
<body>
  ${title && !suppressHeadings ? `<h1 class="document-title">${title}</h1>` : ''}
  ${subtitle && !suppressHeadings ? `<h2 class="document-subtitle">${subtitle}</h2>` : ''}
  <div class="content">
    ${htmlContent}
  </div>
  <footer>
    Generated on ${new Date().toLocaleDateString()}
  </footer>
</body>
</html>`;
  }

  private generateCSS(pdfMode = false): string {
    return `
      :root {
        --primary-color: ${this.theme.primaryColor};
        --secondary-color: ${this.theme.secondaryColor};
        --accent-color: ${this.theme.accentColor};
        --background-color: ${this.theme.backgroundColor};
        --font-family: ${this.theme.fontFamily};
        --font-size: ${this.theme.fontSize};
        --line-height: ${this.theme.lineHeight};
        --spacing: ${this.theme.spacing};
      }

      body {
        font-family: var(--font-family);
        font-size: var(--font-size);
        line-height: var(--line-height);
        color: var(--secondary-color);
        background: var(--background-color);
        margin: 0;
        ${pdfMode ? 'padding: 0.5in 0.5in 0.5in 0.5in;' : 'padding: 2rem;'}
      }

      .document-title {
        color: var(--primary-color);
        font-size: 2.5em;
        margin-bottom: 0.5rem;
        border-bottom: none;
        ${pdfMode ? 'margin-top: 0.5em;' : ''}
      }

      .document-subtitle {
        color: var(--secondary-color);
        font-size: 1.5em;
        margin-bottom: var(--spacing);
        font-weight: normal;
      }

      .content {
        max-width: 800px;
        margin: 0 auto;
      }

      h1, h2, h3, h4, h5, h6 {
        color: var(--primary-color);
        margin-top: var(--spacing);
        margin-bottom: calc(var(--spacing) * 0.5);
        page-break-after: avoid;
        page-break-inside: avoid;
      }

      h1 { font-size: 2em; border-bottom: 2px solid var(--primary-color); }
      h2 { font-size: 1.75em; }
      h3 { font-size: 1.5em; }
      h4 { font-size: 1.25em; }

      p {
        margin-bottom: var(--spacing);
        orphans: 2;
        widows: 2;
      }

      ul, ol {
        margin-bottom: var(--spacing);
        padding-left: 1.5em;
      }

      li {
        margin-bottom: calc(var(--spacing) * 0.25);
        page-break-inside: avoid;
      }

      a {
        color: var(--accent-color);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      blockquote {
        border-left: 4px solid var(--primary-color);
        margin: 0 0 1.5em 0;
        padding-left: 1em;
        color: var(--secondary-color);
        font-size: 0.95em;
        background: #f7f7f7;
        font-style: normal;
        box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        border-radius: 4px;
        max-width: 400px;
        float: right;
        text-align: right;
        page-break-inside: avoid;
      }

      .signature-block {
        margin-top: 2em;
        margin-bottom: 0;
        page-break-inside: avoid;
        break-inside: avoid;
        text-align: left;
        font-size: 1em;
        font-family: var(--font-family);
      }

      .page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
        margin: 0;
        border: none;
      }

      code {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        background: #f5f5f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
      }

      pre code {
        display: block;
        padding: 1em;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: var(--spacing);
        page-break-inside: avoid;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 0.5em;
        text-align: left;
      }

      th {
        background: var(--primary-color);
        color: white;
      }

      tr:nth-child(even) {
        background: #f9f9f9;
      }

      footer {
        margin-top: calc(var(--spacing) * 2);
        padding-top: var(--spacing);
        border-top: 1px solid #ddd;
        text-align: center;
        color: var(--secondary-color);
        font-size: 0.9em;
        page-break-after: avoid;
      }

      /* Print styles */
      @media print {
        body {
          padding: 0.5in 0.5in 0.5in 0.5in;
        }
        .content {
          max-width: none;
        }
        a {
          text-decoration: none;
          color: var(--secondary-color);
        }
        footer {
          display: none;
        }
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        ul, ol, li, table, tr, td, th {
          page-break-inside: avoid;
        }
      }
    `;
  }
}
