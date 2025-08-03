import { ChromePDFEngine, ChromePDFOptions } from '../core/chrome-engine.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface ScriptPDFOptions {
  /** Profile data file path (JSON) */
  profilePath?: string;
  /** Profile data object */
  profileData?: any;
  /** Output PDF path */
  outputPath: string;
  /** Template name */
  template?: 'basic' | 'modern' | 'professional';
  /** Simple quality setting */
  quality?: 'fast' | 'good' | 'best';
}

/**
 * Simple interface for end-user scripts
 * Provides the easiest possible PDF generation experience
 */
export class ScriptPDFInterface {
  private engine: ChromePDFEngine;

  constructor() {
    this.engine = new ChromePDFEngine();
  }

  /**
   * Generate PDF with minimal configuration
   */
  async generateCV(options: ScriptPDFOptions): Promise<{
    success: boolean;
    outputPath?: string;
    message: string;
  }> {
    try {
      console.log('🚀 Generating your CV PDF...');
      
      // Load profile data
      const profileData = options.profileData || this.loadProfileData(options.profilePath);
      
      // Generate HTML
      const html = this.generateHTML(profileData, options.template || 'basic');
      
      // Set quality preset
      const qualitySettings = this.getQualitySettings(options.quality || 'good');
      
      // Generate PDF
      const result = await this.engine.generatePDF({
        htmlContent: html,
        outputPath: options.outputPath,
        ...qualitySettings
      });

      if (result.success) {
        return {
          success: true,
          outputPath: result.outputPath || '',
          message: `✅ CV generated successfully! Saved as: ${result.outputPath}`
        };
      } else {
        return {
          success: false,
          message: `❌ Failed to generate PDF: ${result.error || 'Unknown error'}`
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Generate shell script wrapper
   */
  generateShellScript(scriptPath: string, options: {
    defaultProfile?: string;
    defaultOutput?: string;
    template?: string;
  } = {}): void {
    const shellScript = `#!/bin/bash

# DZB-CV PDF Generator Script
# Usage: ./generate-cv.sh [profile.json] [output.pdf]

set -e

# Default values
DEFAULT_PROFILE="${options.defaultProfile || 'profile.json'}"
DEFAULT_OUTPUT="${options.defaultOutput || 'cv.pdf'}"
TEMPLATE="${options.template || 'basic'}"

# Parse arguments
PROFILE_FILE="\${1:-$DEFAULT_PROFILE}"
OUTPUT_FILE="\${2:-$DEFAULT_OUTPUT}"

# Check if Chrome is available
if ! command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
    echo "❌ Google Chrome not found. Please install Google Chrome."
    exit 1
fi

# Check if profile file exists
if [ ! -f "$PROFILE_FILE" ]; then
    echo "❌ Profile file not found: $PROFILE_FILE"
    echo "📝 Create a profile.json file with your CV data, or specify a different file:"
    echo "   ./generate-cv.sh my-profile.json my-cv.pdf"
    exit 1
fi

echo "🚀 Generating CV PDF..."
echo "📄 Profile: $PROFILE_FILE"
echo "📋 Template: $TEMPLATE"
echo "💾 Output: $OUTPUT_FILE"

# Create temporary HTML file
TEMP_HTML="/tmp/cv-temp-$$.html"

# Generate HTML from profile (this would call the Node.js script)
node -e "
const fs = require('fs');
const profile = JSON.parse(fs.readFileSync('$PROFILE_FILE', 'utf8'));

const html = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>\${profile.personalInfo?.name?.full || 'CV'}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            margin: 0.75in; 
            line-height: 1.4; 
            color: #2c3e50; 
        }
        h1 { color: #2c3e50; margin-bottom: 0.3em; font-size: 1.8em; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.2em; margin-top: 1.5em; }
        .contact { margin-bottom: 1.5em; color: #7f8c8d; }
        .experience-item { margin-bottom: 1em; }
        .job-title { font-weight: bold; color: #2c3e50; }
        .company { color: #3498db; }
        .date { color: #7f8c8d; font-style: italic; }
    </style>
</head>
<body>
    <h1>\${profile.personalInfo?.name?.full || 'Curriculum Vitae'}</h1>
    <div class='contact'>
        \${profile.personalInfo?.contact?.email || ''}
        \${profile.personalInfo?.contact?.phone ? ' | ' + profile.personalInfo.contact.phone : ''}
    </div>
</body>
</html>
\`;

fs.writeFileSync('$TEMP_HTML', html);
"

# Generate PDF using Chrome
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\
    --headless \\
    --disable-gpu \\
    --print-to-pdf="$OUTPUT_FILE" \\
    --print-to-pdf-no-header \\
    --virtual-time-budget=5000 \\
    --window-size=1920,1080 \\
    --force-device-scale-factor=0.88 \\
    "file://$TEMP_HTML"

# Clean up
rm -f "$TEMP_HTML"

# Check if PDF was created
if [ -f "$OUTPUT_FILE" ]; then
    echo "✅ CV generated successfully!"
    echo "📄 Output: $OUTPUT_FILE"
    
    # Show file size
    FILE_SIZE=\$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "📊 File size: $FILE_SIZE"
else
    echo "❌ Failed to generate PDF"
    exit 1
fi
`;

    writeFileSync(scriptPath, shellScript, { mode: 0o755 });
    console.log(`✅ Shell script generated: ${scriptPath}`);
  }

  /**
   * Generate Windows batch script
   */
  generateBatchScript(scriptPath: string, options: {
    defaultProfile?: string;
    defaultOutput?: string;
  } = {}): void {
    const batchScript = `@echo off
REM DZB-CV PDF Generator Script
REM Usage: generate-cv.bat [profile.json] [output.pdf]

setlocal enabledelayedexpansion

REM Default values
set "DEFAULT_PROFILE=${options.defaultProfile || 'profile.json'}"
set "DEFAULT_OUTPUT=${options.defaultOutput || 'cv.pdf'}"

REM Parse arguments
if "%~1"=="" (
    set "PROFILE_FILE=%DEFAULT_PROFILE%"
) else (
    set "PROFILE_FILE=%~1"
)

if "%~2"=="" (
    set "OUTPUT_FILE=%DEFAULT_OUTPUT%"
) else (
    set "OUTPUT_FILE=%~2"
)

REM Check if Chrome is available
set "CHROME_PATH=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if not exist "%CHROME_PATH%" (
    set "CHROME_PATH=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
)
if not exist "%CHROME_PATH%" (
    echo ❌ Google Chrome not found. Please install Google Chrome.
    exit /b 1
)

REM Check if profile file exists
if not exist "%PROFILE_FILE%" (
    echo ❌ Profile file not found: %PROFILE_FILE%
    echo 📝 Create a profile.json file with your CV data
    exit /b 1
)

echo 🚀 Generating CV PDF...
echo 📄 Profile: %PROFILE_FILE%
echo 💾 Output: %OUTPUT_FILE%

REM Create temporary HTML file
set "TEMP_HTML=%TEMP%\\cv-temp.html"

REM Generate basic HTML (simplified for batch)
echo ^<!DOCTYPE html^> > "%TEMP_HTML%"
echo ^<html^>^<head^>^<title^>CV^</title^>^</head^> >> "%TEMP_HTML%"
echo ^<body^>^<h1^>CV Generated^</h1^>^</body^>^</html^> >> "%TEMP_HTML%"

REM Generate PDF using Chrome
"%CHROME_PATH%" ^
    --headless ^
    --disable-gpu ^
    --print-to-pdf="%OUTPUT_FILE%" ^
    --print-to-pdf-no-header ^
    --virtual-time-budget=5000 ^
    --window-size=1920,1080 ^
    "file:///%TEMP_HTML%"

REM Clean up
del "%TEMP_HTML%" 2>nul

REM Check if PDF was created
if exist "%OUTPUT_FILE%" (
    echo ✅ CV generated successfully!
    echo 📄 Output: %OUTPUT_FILE%
) else (
    echo ❌ Failed to generate PDF
    exit /b 1
)
`;

    writeFileSync(scriptPath, batchScript);
    console.log(`✅ Batch script generated: ${scriptPath}`);
  }

  /**
   * Create example profile JSON
   */
  createExampleProfile(profilePath: string): void {
    const exampleProfile = {
      personalInfo: {
        name: {
          full: "Jane Doe",
          first: "Jane",
          last: "Doe"
        },
        contact: {
          email: "jane.doe@email.com",
          phone: "(555) 123-4567"
        }
      },
      experience: [
        {
          position: "Software Developer",
          company: "Tech Company Inc.",
          startDate: "2020-01",
          endDate: "Present",
          description: "Developed web applications using modern technologies"
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University Name",
          graduationDate: "2020"
        }
      ],
      skills: [
        "JavaScript",
        "TypeScript", 
        "React",
        "Node.js"
      ]
    };

    writeFileSync(profilePath, JSON.stringify(exampleProfile, null, 2));
    console.log(`✅ Example profile created: ${profilePath}`);
  }

  /**
   * Load profile data from file
   */
  private loadProfileData(profilePath?: string): any {
    if (!profilePath) {
      throw new Error('Profile path is required');
    }

    try {
      const fs = require('fs');
      const data = fs.readFileSync(profilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get quality settings for simple presets
   */
  private getQualitySettings(quality: 'fast' | 'good' | 'best'): Partial<ChromePDFOptions> {
    switch (quality) {
      case 'fast':
        return {
          virtualTimeBudget: 2000,
          windowSize: '1280,720'
        };
      case 'good':
        return {
          virtualTimeBudget: 5000,
          windowSize: '1920,1080',
          scale: 0.88
        };
      case 'best':
        return {
          virtualTimeBudget: 10000,
          windowSize: '1920,1080',
          scale: 0.88,
          customFlags: ['--enable-javascript']
        };
      default:
        return this.getQualitySettings('good');
    }
  }

  /**
   * Generate simple HTML from profile data
   */
  private generateHTML(profileData: any, template: string): string {
    const name = profileData.personalInfo?.name?.full || 'CV';
    const email = profileData.personalInfo?.contact?.email || '';
    const phone = profileData.personalInfo?.contact?.phone || '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${name}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          margin: 0.75in;
          line-height: 1.4;
          color: #2c3e50;
        }
        h1 { color: #2c3e50; margin-bottom: 0.3em; font-size: 1.8em; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.2em; margin-top: 1.5em; }
        .contact { margin-bottom: 1.5em; color: #7f8c8d; }
        .experience-item { margin-bottom: 1em; }
        .job-title { font-weight: bold; color: #2c3e50; }
        .company { color: #3498db; }
        .date { color: #7f8c8d; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>${name}</h1>
      <div class="contact">
        ${email}${phone ? ' | ' + phone : ''}
      </div>
      
      ${profileData.experience && profileData.experience.length > 0 ? `
      <h2>Experience</h2>
      ${profileData.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="job-title">${exp.position || 'Position'}</div>
          <div class="company">${exp.company || 'Company'}</div>
          <div class="date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          ${exp.description ? `<div>${exp.description}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}
      
      ${profileData.education && profileData.education.length > 0 ? `
      <h2>Education</h2>
      ${profileData.education.map((edu: any) => `
        <div class="experience-item">
          <div class="job-title">${edu.degree || 'Degree'}</div>
          <div class="company">${edu.institution || 'Institution'}</div>
          <div class="date">${edu.graduationDate || ''}</div>
        </div>
      `).join('')}
      ` : ''}
      
      ${profileData.skills && profileData.skills.length > 0 ? `
      <h2>Skills</h2>
      <div>${profileData.skills.join(', ')}</div>
      ` : ''}
    </body>
    </html>
    `;
  }
}