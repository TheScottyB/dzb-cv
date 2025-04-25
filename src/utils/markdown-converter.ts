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
  primaryColor: '#006633',  // Forest green
  secondaryColor: '#333333',
  accentColor: '#cc3333',
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  lineHeight: '1.6',
  spacing: '1.5rem'
};

export class MarkdownConverter {
  private theme: MarkdownTheme;

  constructor(theme: Partial<MarkdownTheme> = {}) {
    this.theme = { ...defaultTheme, ...theme };
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
        }
      })
    );

    // Set options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true // Add <br> on single line breaks
    });
  }

  public convertToHTML(markdown: string, title?: string, subtitle?: string): string {
    const css = this.generateCSS();
    const content = marked(markdown);
    
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
  ${title ? `<h1 class="document-title">${title}</h1>` : ''}
  ${subtitle ? `<h2 class="document-subtitle">${subtitle}</h2>` : ''}
  <div class="content">
    ${content}
  </div>
  <footer>
    Generated on ${new Date().toLocaleDateString()}
  </footer>
</body>
</html>`;
  }

  private generateCSS(): string {
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
        padding: 2rem;
      }

      .document-title {
        color: var(--primary-color);
        font-size: 2.5em;
        margin-bottom: 0.5rem;
        border-bottom: none;
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
      }

      h1 { font-size: 2em; border-bottom: 2px solid var(--primary-color); }
      h2 { font-size: 1.75em; }
      h3 { font-size: 1.5em; }
      h4 { font-size: 1.25em; }

      p {
        margin-bottom: var(--spacing);
      }

      ul, ol {
        margin-bottom: var(--spacing);
        padding-left: 1.5em;
      }

      li {
        margin-bottom: calc(var(--spacing) * 0.25);
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
        margin: 0;
        padding-left: 1em;
        color: var(--secondary-color);
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
      }

      /* Print styles */
      @media print {
        body {
          padding: 0;
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
      }
    `;
  }
} 