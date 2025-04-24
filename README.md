# Dawn Zurick Beilfuss CV Repository

A structured repository for managing multiple CV formats and job-specific applications for Dawn Zurick (Dawn Zurick Beilfuss).

## Repository Structure

- `src/`: Source files and templates
  - `templates/`: CV templates for different application types
  - `components/`: Reusable CV sections
  - `data/`: Core CV data and job-specific information
  - `utils/`: Core utility functions

- `cv-versions/`: Version-controlled Markdown CV files
  - Contains all job-specific CVs in Markdown format

- `output/`: Generated CVs and application materials
  - `federal/`: Federal job applications
  - `state/`: State job applications
  - `private/`: Private sector applications
  - `sites/`: Job site optimized versions

- `assets/`: Supporting materials
  - `images/`: Photos and graphics
  - `documents/`: Supporting documentation

- `utils/`: Helper scripts and tools
  - `generate-job-pdf-template.js`: Template for creating PDF generators
  - Various job-specific PDF generators

- `docs/`: Documentation and guides

## Workflow for New Job Applications

1. **Analyze the job posting**:
   ```bash
   pnpm cv -- analyze <job-url>
   ```

2. **Create tailored CV in Markdown**:
   - Create a new file in `cv-versions/dawn-position-employer-cv.md`
   - Customize content based on job requirements

3. **Create matching cover letter**:
   - Create in `output/<sector>/<position>/dawn-position-cover-letter.md`

4. **Generate PDFs**:
   - Copy `utils/generate-job-pdf-template.js` to a new file
   - Update variables for the specific job
   - Run the generator:
     ```bash
     node utils/generate-position-employer-pdf.js
     ```

5. **Track in agent-comments.md**:
   - Update with details about the application

## PDF Generation

When generating PDFs for job applications:

1. Always use a script in the `utils/` directory
2. Ensure it imports from `../dist/utils/pdf-generator.js`
3. Use the template file as a starting point
4. Make the script executable: `chmod +x utils/your-script.js`

## Key Documentation

- `CLAUDE.md`: Quick reference for common commands
- `docs/USAGE.md`: Detailed usage instructions
- `docs/technical-design-formatting.md`: Formatting specifications
