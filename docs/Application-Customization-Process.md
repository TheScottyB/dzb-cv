# Application & Cover Letter Customization Process

## Introduction

This document outlines the process for customizing job application materials—including CVs and cover letters—using both reverse engineering of previous applications and best practices for creating detailed, tailored versions. It covers file structure, CLI usage, and troubleshooting.

---

## Reverse Engineering Process

1. **Locate Previous Application Files**
   - Navigate to the `job-postings` directory and find existing application folders.
2. **Analyze Existing Cover Letters**
   - Compare base and detailed versions to identify:
     - Position-specific customizations
     - Local connections
     - Educational aspirations
     - Schedule/hours formatting
     - Company-specific program references
3. **Identify Customization Patterns**
   - Opening paragraph: Position title, schedule, local connection
   - Experience: Quantifiable achievements, relevant skills, industry terms
   - Education/Career growth: Certifications, programs, goals
4. **Create New Application Files**
   - Copy an existing folder as a template
   - Update company, position, schedule, local connection, and educational details
5. **Generate Documents**
   - Use the CLI to generate documents:
     ```bash
     pnpm cv generate federal
     pnpm cv generate state
     pnpm cv generate private
     ```
     - Outputs are saved in the `output/` directory by sector (e.g., `output/federal/`, `output/state/`, `output/private/`).
   - (Optional) Use scripts for custom generation.

---

## Cover Letter Customization

1. **Creating a Detailed Version**
   - Create a new markdown file with the suffix `_Detailed` (e.g., `Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md`).
   - Customize content to include:
     - Position-specific details
     - Local connection
     - Relevant experience
     - Educational aspirations and growth plans
     - Company-specific details
   - Key sections to customize:
     - Opening paragraph: Position, schedule, local connection
     - Current role: Experience, quantifiable achievements
     - Skills list: Position-specific requirements
     - Previous experience: Connect past roles
     - Closing: Alignment with company goals/programs
2. **Tips for Customization**
   - Maintain both base and detailed versions
   - Use specific numbers/metrics
   - Highlight local connection
   - Include educational/career growth
   - Connect experience to requirements
   - Emphasize company-specific programs

---

## Generating Documents

- **CLI Usage:**
  - Use the CLI for standard generation (see above).
- **Custom Scripts:**
  - (Optional) Use scripts like `scripts/generate-detailed-cv.js` for advanced workflows.
- **PDF Generation:**
  - Open generated HTML in a browser, print to PDF with correct settings (Letter, 0.75" margins, print backgrounds).
- **Output Structure:**
  - All outputs are organized by sector in the `output/` directory.

---

## Common Patterns to Preserve

- **Document Structure:** Base and detailed versions, consistent naming
- **Content Elements:** Local connection, schedule, education, achievements
- **Technical Setup:** Markdown for content, HTML/PDF generation, consistent formatting

---

## File Structure Example

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

---

## Key Customization Points

1. **Position Details:** Title, schedule, department/location
2. **Local Connection:** Proximity, community involvement, local knowledge
3. **Educational Alignment:** Certifications, goals, company programs
4. **Experience Highlights:** Skills, achievements, industry experience
5. **Company-Specific Elements:** Name, location, programs, mission alignment

---

## Troubleshooting & Quick Reference

- **File Generation:** Check script paths, markdown formatting, dependencies
- **Content Updates:** Double-check company/position names, schedule, local references
- **PDF Conversion:** Check HTML, browser settings, output locations
- **Quick Reference:**
  1. Find similar previous application
  2. Copy and modify as template
  3. Generate documents (CLI or script)
  4. Verify customization (company, position, schedule, location, programs) 