# Cover Letter Customization Process

This document outlines the process for creating customized cover letters with different versions and generating the corresponding PDF files.

## Creating a Detailed Version

1. Create a new markdown file with the suffix `_Detailed` (or other appropriate descriptor):
   ```bash
   # Example:
   Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md
   ```

2. Customize the content to include:
   - Position-specific details (e.g., part-time, schedule)
   - Local connection (e.g., residence proximity)
   - Relevant experience
   - Educational aspirations and growth plans
   - Company-specific details (e.g., educational assistance programs)

3. Key sections to customize:
   - Opening paragraph: Include position title, schedule, and local connection
   - Current role: Highlight relevant experience and quantifiable achievements
   - Skills list: Focus on position-specific requirements
   - Previous experience: Connect past roles to current position
   - Closing paragraph: Emphasize alignment with company goals and programs

## Generating PDF Files

1. Create a generation script (example: `scripts/generate-detailed-cv.js`):
   ```javascript
   import fs from 'fs';
   import path from 'path';
   import { fileURLToPath } from 'url';
   import { dirname } from 'path';
   import { convertMarkdownToPdf } from './pdf-generator.js';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

   async function generateDetailedCoverLetter() {
       const inputPath = '[JOB_POSTING_DIR]/[FILENAME]_Detailed.md';
       const outputPath = '[JOB_POSTING_DIR]/[FILENAME]_Detailed.pdf';
       
       try {
           const markdown = fs.readFileSync(inputPath, 'utf8');
           await convertMarkdownToPdf(markdown, outputPath, {
               paperSize: 'Letter',
               margins: {
                   top: 0.75,
                   right: 0.75,
                   bottom: 0.75,
                   left: 0.75
               },
               fontFamily: 'Georgia, serif',
               fontSize: 11,
               includeHeaderFooter: false
           });
       } catch (error) {
           console.error('Error generating detailed cover letter:', error);
           process.exit(1);
       }
   }

   generateDetailedCoverLetter();
   ```

2. Run the generation script:
   ```bash
   node scripts/generate-detailed-cv.js
   ```

3. Convert HTML to PDF:
   - Open the generated HTML file in a web browser
   - Use browser's print function (Cmd+P on Mac, Ctrl+P on Windows)
   - Configure print settings:
     * Paper size: Letter
     * Margins: 0.75 inches on all sides
     * Enable "Print background colors and images"
   - Choose "Save as PDF" as destination
   - Save in the same directory as the HTML file

## File Structure

```
job-postings/
└── [company-job-id]/
    ├── Dawn_Zurick_Beilfuss_Cover_Letter.md        # Base version
    ├── Dawn_Zurick_Beilfuss_Cover_Letter.html
    ├── Dawn_Zurick_Beilfuss_Cover_Letter.pdf
    ├── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md   # Detailed version
    ├── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.html
    └── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.pdf
```

## Key Customization Points

1. **Position Details**:
   - Full position title
   - Schedule/hours
   - Department/location

2. **Local Connection**:
   - Residence proximity
   - Community involvement
   - Knowledge of local healthcare system

3. **Educational Alignment**:
   - Current certifications
   - Educational goals
   - Interest in company's educational programs

4. **Experience Highlights**:
   - Relevant skills
   - Quantifiable achievements
   - Industry-specific experience

5. **Company-Specific Elements**:
   - Company name and location
   - Company programs (e.g., educational assistance)
   - Company mission alignment

## Tips for Customization

1. Always maintain both a base version and detailed version
2. Use specific numbers and metrics when possible
3. Highlight local connection when applicable
4. Include educational and career growth plans
5. Connect previous experience to current role requirements
6. Emphasize company-specific programs and opportunities 