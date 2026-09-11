# Mercyhealth Harvard Hospital - Medical Laboratory Position

## Job Details
- **Position**: Medical Laboratory Scientist/Medical Laboratory Technician
- **Type**: Part-time (40 hours/2 weeks)
- **Shift**: Day Shift
- **Location**: 901 Grant Street, Harvard, IL 60033
- **Benefits**: Includes $10,000 Sign-On Bonus and Educational Assistance Program

## Directory Structure
```
.
├── README.md                 # This file
├── source/                   # Original markdown files
│   ├── Dawn_Zurick_Beilfuss_Cover_Letter.md
│   └── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md
└── generated/                # Generated HTML and PDF files
    ├── Dawn_Zurick_Beilfuss_Cover_Letter.html
    ├── Dawn_Zurick_Beilfuss_Cover_Letter.pdf
    ├── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.html
    └── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.pdf
```

## Source Files

### Cover Letter Versions
1. `source/Dawn_Zurick_Beilfuss_Cover_Letter.md`
   - Base version of the cover letter
   - General qualifications and experience
   - Standard formatting

2. `source/Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md`
   - Enhanced version with:
     * Part-time schedule alignment
     * Local Harvard resident connection
     * Educational aspirations
     * Laboratory-specific skills
     * Quantifiable achievements (60-80 daily interactions)
     * Interest in educational programs

## Generated Files

### HTML Files (`generated/`)
- `Dawn_Zurick_Beilfuss_Cover_Letter.html`
- `Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.html`
- Generated from markdown using pdf-generator.js
- Include proper formatting and styles

### PDF Files (`generated/`)
- `Dawn_Zurick_Beilfuss_Cover_Letter.pdf`
- `Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.pdf`
- Generated from HTML using browser print function
- Letter size with 0.75" margins

## Generation Process
1. Original markdown files created and customized in `source/`
2. HTML generated using `scripts/generate-detailed-cv.js` into `generated/`
3. PDFs created using browser print function with specific settings:
   - Paper size: Letter
   - Margins: 0.75 inches all around
   - Background colors/images enabled

## Key Customizations
1. **Local Connection**
   - Harvard resident emphasis
   - Community healthcare focus
   - Local impact potential

2. **Schedule Alignment**
   - Part-time schedule (40 hours/2 weeks)
   - Day shift preference
   - Work-education balance

3. **Educational Goals**
   - Interest in certifications
   - Laboratory science focus
   - Use of educational assistance program

4. **Experience Highlights**
   - Laboratory coordination
   - Medical documentation
   - Quality control experience
   - Patient interaction metrics

## File Generation Commands
```bash
# Generate base version
node scripts/generate-mls-cv.js

# Generate detailed version
node scripts/generate-detailed-cv.js
```

## Notes
- Created: April 25, 2024
- Based on job posting from Mercyhealth careers portal
- Customized for local Harvard position
- Emphasizes laboratory skills and educational goals
- Includes both standard and detailed versions for different submission contexts 