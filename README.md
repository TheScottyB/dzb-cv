# Multi-Language Job Scraper

A versatile job posting scraper implemented in TypeScript, Python, and JavaScript. This tool can be used by agents to extract job information from various job posting websites.

## Features

- **Multi-language Support**: Choose between TypeScript, Python, or JavaScript implementations
- **Comprehensive Data Extraction**: Extracts title, company, location, description, responsibilities, qualifications, skills, education, and experience
- **Multiple Output Formats**: Saves data as JSON, HTML, screenshots, and PDFs
- **Browser Automation**: Handles dynamic content and JavaScript-rendered pages
- **Configurable Options**: Customize scraping behavior through options
- **Error Handling**: Robust error handling and logging
- **Type Safety**: TypeScript implementation with full type definitions

## Development Setup

### Prerequisites

- [Volta](https://volta.sh/) for JavaScript/TypeScript tooling
- Python 3.11+ for Python components
- Git for version control

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/job-scraper.git
   cd job-scraper
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

The setup script will:
- Install Volta if not present
- Install pnpm via Volta
- Set up TypeScript dependencies
- Set up Python dependencies
- Configure Git hooks

### Development Workflow

#### TypeScript/JavaScript Development

```bash
# Start development server
cd typescript
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

#### Python Development

```bash
# Install dependencies
cd python
pip install -r requirements.txt

# Run tests
pytest
```

### Tooling

- **Node.js**: Managed by Volta (version 20.10.0)
- **Package Manager**: pnpm (version 8.12.1)
- **TypeScript**: Version 5.0.0
- **Python**: Version 3.11+

### Git Hooks

The project uses Husky and lint-staged to ensure code quality:
- Pre-commit: Runs ESLint and Prettier on staged files
- Pre-push: Runs tests

## Project Structure

```
.
├── typescript/          # TypeScript implementation
│   ├── src/            # Source code
│   ├── tests/          # Tests
│   └── package.json    # Dependencies and scripts
├── python/             # Python implementation
│   ├── src/            # Source code
│   ├── tests/          # Tests
│   └── requirements.txt # Dependencies
└── scripts/            # Utility scripts
```

## Installation

### TypeScript

```bash
cd typescript
npm install
```

### Python

```bash
cd python
pip install -r requirements.txt
```

### JavaScript

```bash
cd javascript
npm install
```

## Usage

### TypeScript

```typescript
import { JobScraper } from './src/scraper';

const scraper = new JobScraper({
  headless: true,
  waitTime: 5000,
  outputDir: 'job-postings'
});

const result = await scraper.scrape('https://example.com/jobs/12345');
console.log(result);
```

### Python

```python
from scraper import JobScraper, ScraperOptions

options = ScraperOptions(
  headless=True,
  wait_time=5000,
  output_dir='job-postings'
)

scraper = JobScraper(options)
result = scraper.scrape('https://example.com/jobs/12345')
print(result.to_dict())
```

### JavaScript (Browser)

```javascript
// Copy the contents of browser.js into your browser's console
const scraper = new BrowserJobScraper();
const data = scraper.scrape();
BrowserJobScraper.saveData(data);
```

## Output Format

All implementations produce the same output format:

```json
{
  "url": "https://example.com/jobs/12345",
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "description": "Job description...",
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "qualifications": ["Qualification 1", "Qualification 2"],
  "skills": ["Skill 1", "Skill 2"],
  "education": ["Education 1", "Education 2"],
  "experience": ["Experience 1", "Experience 2"],
  "htmlPath": "path/to/html/file",
  "screenshotPath": "path/to/screenshot",
  "pdfPath": "path/to/pdf",
  "metadata": {
    "postedDate": "2023-01-01",
    "closingDate": "2023-02-01",
    "salary": "$50,000 - $70,000",
    "employmentType": "Full-time"
  }
}
```

## Configuration Options

All implementations support the following options:

- `headless`: Run browser in headless mode (default: true)
- `waitTime`: Time to wait for page load in milliseconds (default: 5000)
- `outputDir`: Directory to save output files (default: 'job-postings')
- `saveHtml`: Save HTML content (default: true)
- `saveScreenshot`: Save page screenshot (default: true)
- `savePdf`: Save page as PDF (default: true)
- `customUserAgent`: Custom user agent string

## Error Handling

All implementations include comprehensive error handling:

```typescript
{
  "success": false,
  "error": "Error message",
  "metadata": {
    "timestamp": "2023-01-01T12:00:00Z",
    "duration": 1234,
    "url": "https://example.com/jobs/12345"
  }
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test` and `pytest`
4. Commit with a descriptive message
5. Push to your branch
6. Create a pull request

## License

MIT

