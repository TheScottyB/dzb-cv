// Test script generation functionality
import { writeFileSync } from 'fs';

function generateShellScript(scriptPath, options = {}) {
  const {
    defaultProfile = 'profile.json',
    defaultOutput = 'cv.pdf',
    template = 'basic'
  } = options;

  const shellScript = `#!/bin/bash

# DZB-CV PDF Generator Script
# Usage: ./generate-cv.sh [profile.json] [output.pdf]

set -e

# Default values
DEFAULT_PROFILE="${defaultProfile}"
DEFAULT_OUTPUT="${defaultOutput}"
TEMPLATE="${template}"

# Parse arguments
PROFILE_FILE="\${1:-$DEFAULT_PROFILE}"
OUTPUT_FILE="\${2:-$DEFAULT_OUTPUT}"

# Check if Chrome is available
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "$CHROME_PATH" ]; then
    echo "❌ Google Chrome not found at: $CHROME_PATH"
    echo "Please install Google Chrome or update the CHROME_PATH variable"
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

# Generate HTML from profile
node -e "
const fs = require('fs');
try {
  const profile = JSON.parse(fs.readFileSync('$PROFILE_FILE', 'utf8'));

  const html = \\\`
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>\\\${profile.personalInfo?.name?.full || 'CV'}</title>
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
    <h1>\\\${profile.personalInfo?.name?.full || 'Curriculum Vitae'}</h1>
    <div class='contact'>
        \\\${profile.personalInfo?.contact?.email || ''}
        \\\${profile.personalInfo?.contact?.phone ? ' | ' + profile.personalInfo.contact.phone : ''}
    </div>
    
    \\\${profile.experience && profile.experience.length > 0 ? \\\`
    <h2>Experience</h2>
    \\\${profile.experience.map(exp => \\\`
        <div class='experience-item'>
            <div class='job-title'>\\\${exp.position || 'Position'}</div>
            <div class='company'>\\\${exp.employer || exp.company || 'Company'}</div>
            <div class='date'>\\\${exp.startDate || ''} - \\\${exp.endDate || 'Present'}</div>
            \\\${exp.responsibilities && exp.responsibilities.length > 0 ? 
                '<div>' + exp.responsibilities[0] + '</div>' : 
                (exp.description ? '<div>' + exp.description + '</div>' : '')
            }
        </div>
    \\\`).join('')}
    \\\` : ''}
    
    \\\${profile.education && profile.education.length > 0 ? \\\`
    <h2>Education</h2>
    \\\${profile.education.map(edu => \\\`
        <div class='experience-item'>
            <div class='job-title'>\\\${edu.degree || 'Degree'}</div>
            <div class='company'>\\\${edu.institution || 'Institution'}</div>
            <div class='date'>\\\${edu.graduationDate || ''}</div>
        </div>
    \\\`).join('')}
    \\\` : ''}
    
    \\\${profile.skills && profile.skills.length > 0 ? \\\`
    <h2>Skills</h2>
    <div>\\\${profile.skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || 'Skill'
    ).join(' • ')}</div>
    \\\` : ''}
</body>
</html>
\\\`;

  fs.writeFileSync('$TEMP_HTML', html);
  console.log('✅ HTML generated successfully');
} catch (error) {
  console.error('❌ Error generating HTML:', error.message);
  process.exit(1);
}
"

# Generate PDF using Chrome
"$CHROME_PATH" \\
    --headless \\
    --disable-gpu \\
    --disable-dev-shm-usage \\
    --print-to-pdf="$OUTPUT_FILE" \\
    --print-to-pdf-no-header \\
    --virtual-time-budget=5000 \\
    --window-size=1920,1080 \\
    --force-device-scale-factor=0.88 \\
    --no-sandbox \\
    --disable-setuid-sandbox \\
    "file://$TEMP_HTML"

# Clean up
rm -f "$TEMP_HTML"

# Check if PDF was created
if [ -f "$OUTPUT_FILE" ]; then
    echo "✅ CV generated successfully!"
    echo "📄 Output: $OUTPUT_FILE"
    
    # Show file size
    FILE_SIZE=\$(ls -lh "$OUTPUT_FILE" | awk '{print \$5}')
    echo "📊 File size: $FILE_SIZE"
else
    echo "❌ Failed to generate PDF"
    exit 1
fi
`;

  return shellScript;
}

function createExampleProfile(profilePath) {
  const exampleProfile = {
    personalInfo: {
      name: {
        full: "Sarah Johnson",
        first: "Sarah",
        last: "Johnson"
      },
      contact: {
        email: "sarah.johnson@email.com",
        phone: "(555) 123-4567"
      }
    },
    experience: [
      {
        position: "Senior Frontend Developer",
        employer: "Tech Innovations LLC",
        startDate: "2021-03",
        endDate: "Present",
        responsibilities: [
          "Lead development of React-based web applications",
          "Mentored junior developers and improved team productivity",
          "Implemented modern CI/CD practices"
        ]
      },
      {
        position: "Frontend Developer",
        employer: "Digital Solutions Inc",
        startDate: "2019-01",
        endDate: "2021-02",
        responsibilities: [
          "Developed responsive web applications using JavaScript and React",
          "Collaborated with UX/UI designers to implement pixel-perfect designs"
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "State University",
        graduationDate: "2018"
      }
    ],
    skills: [
      "JavaScript",
      "TypeScript", 
      "React",
      "Node.js",
      "HTML/CSS",
      "Git",
      "AWS",
      "Docker"
    ]
  };

  return JSON.stringify(exampleProfile, null, 2);
}

// Test script generation
console.log('🧪 Testing Script Generation');
console.log('=============================');

// Generate shell script
console.log('\n📝 Generating shell script...');
const shellScript = generateShellScript('./test-generate-cv.sh', {
  defaultProfile: 'test-profile.json',
  defaultOutput: 'test-output.pdf',
  template: 'modern'
});

writeFileSync('/tmp/test-generate-cv.sh', shellScript, { mode: 0o755 });
console.log('✅ Shell script generated: /tmp/test-generate-cv.sh');

// Generate example profile
console.log('\n📝 Generating example profile...');
const exampleProfile = createExampleProfile('/tmp/test-profile.json');
writeFileSync('/tmp/test-profile.json', exampleProfile);
console.log('✅ Example profile generated: /tmp/test-profile.json');

console.log('\n🧪 Testing generated script...');
console.log('Script content preview:');
console.log('─'.repeat(50));
console.log(shellScript.split('\\n').slice(0, 20).join('\\n'));
console.log('─'.repeat(50));

console.log('\n📋 Profile content preview:');
console.log('─'.repeat(50));
console.log(exampleProfile.split('\\n').slice(0, 15).join('\\n'));
console.log('─'.repeat(50));

console.log('\n🎉 Script generation tests completed!');
console.log('');
console.log('📁 Generated files:');
console.log('   • /tmp/test-generate-cv.sh (executable shell script)');
console.log('   • /tmp/test-profile.json (example profile data)');
console.log('');
console.log('🚀 To test the generated script:');
console.log('   cd /tmp && ./test-generate-cv.sh');
console.log('   # or with custom files:');
console.log('   cd /tmp && ./test-generate-cv.sh test-profile.json my-cv.pdf');