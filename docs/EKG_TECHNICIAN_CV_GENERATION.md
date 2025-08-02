# EKG Technician CV Generation Guide

## Quick Start - Generate Dawn's EKG Technician CV

### For Multi-Page Version:
```bash
node scripts/generate-ekg-technician-pdf.js
```

### For Single-Page Version:
```bash
node scripts/generate-ekg-technician-single-page-pdf.js
```

## Output Locations
- **Multi-page PDF:** `generated/cvs/personal/healthcare/ekg-technician/Dawn_Zurick_Beilfuss_ekg-technician-cv.pdf`
- **Single-page PDF:** `generated/cvs/personal/healthcare/ekg-technician/Dawn_Zurick_Beilfuss_ekg-technician-cv_SinglePage.pdf`

## How It Works

### 1. Source Content
- **Markdown file:** `cv-versions/dawn-ekg-technician-cv.md`
- Contains Dawn's complete EKG Technician profile with:
  - New EKG certification credentials
  - 40+ years healthcare experience
  - Cardiac monitoring expertise
  - Professional healthcare background

### 2. Generation Scripts
- **Multi-page script:** `scripts/generate-ekg-technician-pdf.js`
  - Professional formatting with cardiac red theme
  - Standard margins and readable fonts
  - Headers and footers included
  
- **Single-page script:** `scripts/generate-ekg-technician-single-page-pdf.js`
  - Compact formatting for one page
  - Smaller fonts and tight spacing
  - ATS-friendly for online applications

### 3. PDF Generator Engine
- **Core module:** `dist/utils/pdf-generator.js`
- Uses Puppeteer for HTML-to-PDF conversion
- Supports custom CSS styling and single-page optimization

## Prerequisites
- Node.js installed
- All dependencies installed (`npm install` or `pnpm install`)
- Puppeteer for PDF generation (included in dependencies)

## Customization Options

### To modify the EKG CV content:
1. Edit `cv-versions/dawn-ekg-technician-cv.md`
2. Run the generation script
3. New PDF will be created with updated content

### To change styling:
1. Edit the `customCss` section in either script
2. Modify colors, fonts, or layout
3. Regenerate the PDF

### Color Scheme (Cardiac Theme):
- **Primary Color:** `#DC143C` (Crimson red for main headings)
- **Secondary Color:** `#B22222` (Fire brick for section headings)  
- **Accent Color:** `#8B0000` (Dark red for emphasis)
- **Background:** `#FFE4E6` (Light pink for header areas)

## Troubleshooting

### Common Issues:
1. **Module not found error:** Ensure `dist/utils/pdf-generator.js` exists
2. **No output file:** Check directory permissions and disk space
3. **Puppeteer errors:** Try running with `--no-sandbox` flag

### Dependencies:
- `markdown-it` - Markdown to HTML conversion
- `puppeteer` - PDF generation
- `fs/promises` - File system operations

## Success Indicators
- ✅ Script runs without errors
- ✅ PDF file created in expected location
- ✅ File size reasonable (200-300KB range)
- ✅ Creation timestamp shows recent generation

## Next Steps
This system is now **fully repeatable** and the user can:
1. Generate PDFs on demand with simple commands
2. Modify content by editing the markdown file
3. Customize styling by editing the script files
4. Create new CV versions using the same pattern
