# Reverse Engineering Process for Job Applications

This document outlines how to work backwards from an existing successful job application to create new ones.

## Step 1: Locate Previous Application Files

1. Navigate to the job-postings directory:
   ```bash
   cd job-postings
   ```

2. Find existing application folders:
   ```bash
   # Example structure:
   careers.mercyhealthsystem.org-39454/
   ├── Dawn_Zurick_Beilfuss_Cover_Letter.md
   ├── Dawn_Zurick_Beilfuss_Cover_Letter_Detailed.md
   └── [other files]
   ```

## Step 2: Analyze Existing Cover Letters

1. Compare base and detailed versions:
   ```bash
   # View differences
   diff "base-version.md" "detailed-version.md"
   ```

2. Key elements to identify:
   - Position-specific customizations
   - Local connections mentioned
   - Educational aspirations
   - Schedule/hours formatting
   - Company-specific program references

## Step 3: Identify Customization Patterns

1. Opening paragraph patterns:
   - Position title format
   - Schedule mention
   - Local connection reference

2. Experience section patterns:
   - Quantifiable achievements
   - Relevant skills emphasis
   - Industry-specific terminology

3. Educational/Career growth sections:
   - Certification mentions
   - Educational program references
   - Career development goals

## Step 4: Create New Application Files

1. Copy existing structure:
   ```bash
   mkdir -p job-postings/[new-company-job-id]
   cp job-postings/careers.mercyhealthsystem.org-39454/Dawn_Zurick_Beilfuss_Cover_Letter* job-postings/[new-company-job-id]/
   ```

2. Update content:
   - Replace company name and details
   - Adjust position title
   - Modify schedule information
   - Update local connection details
   - Customize educational alignment

## Step 5: Generate Documents

1. Use existing generation script:
   ```bash
   node scripts/generate-detailed-cv.js
   ```

2. Or create new version:
   ```javascript
   // scripts/generate-detailed-cv.js
   import fs from 'fs';
   import { convertMarkdownToPdf } from './pdf-generator.js';

   async function generateDetailedCoverLetter() {
       // Copy structure from existing script
       // Update paths for new job posting
   }
   ```

## Common Patterns to Preserve

1. **Document Structure**:
   - Base version for general use
   - Detailed version with specific alignments
   - Consistent file naming

2. **Content Elements**:
   - Local community connection
   - Schedule compatibility
   - Educational goals
   - Career development plans
   - Quantifiable achievements

3. **Technical Setup**:
   - Markdown files for content
   - HTML generation step
   - PDF conversion process
   - Consistent formatting

## Quick Reference for New Applications

1. **Find Similar Previous Application**:
   - Similar industry
   - Similar role type
   - Similar location/community

2. **Copy and Modify**:
   - Use existing folder as template
   - Update company-specific details
   - Adjust position-specific information
   - Modify local connections
   - Update educational alignments

3. **Generate Documents**:
   - Run generation script
   - Verify HTML output
   - Create PDF version
   - Review all documents

4. **Verify Customization**:
   - Company name accuracy
   - Position title accuracy
   - Schedule details
   - Location references
   - Program mentions

## Troubleshooting Common Issues

1. **File Generation**:
   - Check file paths in scripts
   - Verify markdown formatting
   - Ensure all dependencies installed

2. **Content Updates**:
   - Double-check company names
   - Verify position titles
   - Confirm schedule details
   - Review local references

3. **PDF Conversion**:
   - Check HTML generation
   - Verify browser settings
   - Confirm output locations 