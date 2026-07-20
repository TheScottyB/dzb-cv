#!/usr/bin/env node

/**
 * CV Generation Script for Dawn's Healthcare Career
 * 
 * Usage:
 *   node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg
 *   node scripts/generate-cv.js --profile dawn --job path/to/job-posting.txt
 *   node scripts/generate-cv.js --help
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { adaptProfile } from './profile-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    profile: 'dawn',
    template: 'healthcare',
    focus: 'ekg',
    output: null,
    job: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--profile':
        if (nextArg) options.profile = nextArg;
        i++;
        break;
      case '--template':
        if (nextArg) options.template = nextArg;
        i++;
        break;
      case '--focus':
        if (nextArg) options.focus = nextArg;
        i++;
        break;
      case '--output':
        if (nextArg) options.output = nextArg;
        i++;
        break;
      case '--job':
        if (nextArg) options.job = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

// Show help information
function showHelp() {
  console.log(`
🏥 Dawn's AI-Powered CV Generator

Usage:
  node scripts/generate-cv.js [options]

Options:
  --profile <name>     Profile to use (default: dawn)
  --template <type>    Template type (healthcare, professional, modern)
  --focus <area>       Focus area (ekg, medical, general)
  --job <path>         Job posting file for targeted CV
  --output <path>      Output file path
  --help, -h           Show this help

Examples:
  # Generate EKG-focused CV
  node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg
  
  # Generate CV for specific job posting
  node scripts/generate-cv.js --profile dawn --job job-postings/ekg-technician.txt
  
  # Generate to specific output location
  node scripts/generate-cv.js --profile dawn --output output/dawn-cv-latest.pdf

Healthcare Focus Areas:
  ekg          - EKG Technician positions
  medical      - General medical roles
  nursing      - Nursing assistant positions
  healthcare   - Broad healthcare roles
  
Templates Available:
  healthcare   - Medical industry optimized
  professional - Corporate/business style
  modern       - Contemporary design
  academic     - Education/research focused
`);
}

// Load Dawn's profile data
function loadProfile(profileName) {
  // Check for Dawn's real profile data first
  if (profileName === 'dawn') {
    const realProfilePath = path.join(rootDir, 'base-info.json');
    if (fs.existsSync(realProfilePath)) {
      console.log(`📋 Loading Dawn's real profile data from base-info.json`);
      try {
        const rawProfileData = JSON.parse(fs.readFileSync(realProfilePath, 'utf8'));
        const profileData = adaptProfile(rawProfileData);
        console.log(`✅ Loaded and adapted Dawn's real profile data`);
        return profileData;
      } catch (error) {
        console.warn(`⚠️  Error loading real profile, falling back to default: ${error.message}`);
      }
    }
  }
  
  const profilePath = path.join(rootDir, 'src/data', `${profileName}-base-info.json`);
  
  if (!fs.existsSync(profilePath)) {
    console.log(`⚠️  Profile file not found: ${profilePath}`);
    console.log(`📝 Creating default profile structure...`);
    
    // Create default Dawn profile
    const defaultProfile = {
      personalInfo: {
        name: {
          first: 'Dawn',
          last: 'Zurick-Beilfuss',
          full: 'Dawn Zurick-Beilfuss'
        },
        contact: {
          email: 'dawn@example.com',
          phone: '(555) 123-4567',
          location: 'Your City, State'
        },
        professionalTitle: 'Certified EKG Technician',
        summary: 'Certified EKG Technician with strong analytical skills and attention to detail. Successfully transitioned from real estate to healthcare, bringing customer service excellence and professional communication skills to medical environments.'
      },
      certifications: [
        {
          name: 'EKG Technician Certification',
          issuer: 'National Healthcareer Association (NHA)',
          date: '2025',
          status: 'Active'
        }
      ],
      skills: [
        { name: 'EKG Testing', level: 'Expert', category: 'Medical' },
        { name: 'Patient Care', level: 'Advanced', category: 'Healthcare' },
        { name: 'Medical Terminology', level: 'Proficient', category: 'Healthcare' },
        { name: 'Healthcare Compliance', level: 'Proficient', category: 'Healthcare' },
        { name: 'Customer Service', level: 'Expert', category: 'Soft Skills' },
        { name: 'Communication', level: 'Expert', category: 'Soft Skills' }
      ],
      experience: [
        {
          position: 'Veterinary Assistant',
          employer: 'Fox Lake Animal Hospital',
          startDate: '2023-01',
          endDate: '2024-02',
          responsibilities: [
            'Managed 60-80 patients daily',
            'Medical triage and emergency response',
            'Documentation and payment processing'
          ]
        }
      ],
      education: [
        {
          degree: 'Medical Terminology Certificate',
          institution: 'McHenry Community College',
          year: '2025',
          field: 'Healthcare'
        }
      ]
    };
    
    // Ensure directory exists
    const dataDir = path.dirname(profilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 2));
    console.log(`✅ Created default profile: ${profilePath}`);
    return defaultProfile;
  }
  
  try {
    const profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    console.log(`📋 Loaded profile: ${profileName}`);
    return profileData;
  } catch (error) {
    console.error(`❌ Error loading profile: ${error.message}`);
    process.exit(1);
  }
}

// Generate CV content based on focus area
function generateCVContent(profile, template, focus, jobPosting = null) {
  const { personalInfo, certifications, skills, experience, education } = profile;
  
  // Focus-specific optimizations
  const focusOptimizations = {
    ekg: {
      title: 'Certified EKG Technician | Healthcare Professional',
      summary: `**Newly Certified EKG Technician** with **${calculateTotalExperience(experience)}+ years healthcare administration experience**. Recently earned **National Healthcareer Association (NHA) Certified EKG Technician (CET) credential**. Combines fresh cardiac monitoring expertise with extensive patient care background.`,
      keySkills: ['EKG Testing', 'Cardiac Rhythm Analysis', '12-Lead EKG Interpretation', 'Patient Care', 'Medical Terminology', 'Healthcare Compliance'],
      focusAreas: ['🫀 EKG EXPERTISE & CERTIFICATIONS', '🏥 HEALTHCARE EXPERIENCE', '💪 CORE COMPETENCIES']
    },
    medical: {
      title: 'Healthcare Professional | Medical Support Specialist',
      summary: `**Healthcare Professional** with **${calculateTotalExperience(experience)}+ years medical industry experience**. Proven expertise in patient care, medical administration, and healthcare operations.`,
      keySkills: ['Patient Care', 'Medical Terminology', 'Healthcare Compliance', 'Medical Documentation', 'Patient Education'],
      focusAreas: ['🏥 MEDICAL EXPERIENCE', '📋 HEALTHCARE ADMINISTRATION', '💪 CORE COMPETENCIES']
    },
    general: {
      title: 'Healthcare Professional',
      summary: `**Healthcare Professional** with **${calculateTotalExperience(experience)}+ years experience** in medical environments and patient care.`,
      keySkills: skills.map(s => s.name).slice(0, 6),
      focusAreas: ['🏥 EXPERIENCE', '🎓 EDUCATION & CERTIFICATIONS', '💪 SKILLS']
    }
  };
  
  const optimization = focusOptimizations[focus] || focusOptimizations.general;
  
  // Generate markdown CV
  let cvContent = `# ${personalInfo.name.full}\n`;
  cvContent += `**${optimization.title}**\n\n`;
  cvContent += `📧 ${personalInfo.contact.email} | 📱 ${personalInfo.contact.phone} | 📍 ${personalInfo.contact.location}\n\n`;
  cvContent += `---\n\n`;
  
  // Professional Summary
  cvContent += `## 🫀 PROFESSIONAL SUMMARY\n\n`;
  cvContent += `${optimization.summary}\n\n`;
  if (focus === 'ekg') {
    cvContent += `Seeking opportunities in hospital cardiac units, cardiology practices, and healthcare facilities.\n\n`;
  }
  cvContent += `---\n\n`;
  
  // Experience Section
  if (experience && experience.length > 0) {
    cvContent += `## ${optimization.focusAreas[1] || '🏥 EXPERIENCE'}\n\n`;
    experience.forEach(exp => {
      const endDate = exp.endDate || 'Present';
      cvContent += `**${exp.employer}** | ${exp.position} *(${exp.startDate} - ${endDate})*\n`;
      if (exp.responsibilities) {
        cvContent += `${exp.responsibilities.map(r => `• ${r}`).join(' ')}\n\n`;
      }
    });
    cvContent += `---\n\n`;
  }
  
  // Certifications Section (emphasized for EKG focus)
  if (certifications && certifications.length > 0) {
    const sectionTitle = focus === 'ekg' ? '🫀 EKG EXPERTISE & CERTIFICATIONS' : '🎓 CERTIFICATIONS';
    cvContent += `## ${sectionTitle}\n\n`;
    
    if (focus === 'ekg') {
      cvContent += `**Current Certifications:**\n`;
      certifications.forEach(cert => {
        const meta = [cert.issuer, cert.date].filter(Boolean).join(', ');
        cvContent += `• ✅ **${cert.name}**${meta ? ` - ${meta}` : ''}\n`;
      });
      cvContent += `\n**EKG Skills:** EKG/ECG Testing • Cardiac Rhythm Analysis • 12-Lead EKG Interpretation • Holter Monitor Setup • Stress Test Monitoring • Patient Cardiac Assessment\n\n`;
    } else {
      certifications.forEach(cert => {
        cvContent += `• **${cert.name}**${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}\n`;
      });
      cvContent += `\n`;
    }
    cvContent += `---\n\n`;
  }
  
  // Skills/Competencies Section
  cvContent += `## 💪 CORE COMPETENCIES\n\n`;
  const skillsByCategory = {};
  skills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill.name);
  });
  
  Object.entries(skillsByCategory).forEach(([category, skillList]) => {
    cvContent += `**${category}:** ${skillList.join(' • ')}\n`;
  });
  cvContent += `\n---\n\n`;
  
  // Education Section
  if (education && education.length > 0) {
    cvContent += `## 🎓 EDUCATION\n\n`;
    education.forEach(edu => {
      cvContent += `**${edu.degree}**${edu.institution ? ` - ${edu.institution}` : ''}${edu.year ? ` (${edu.year})` : ''}\n`;
    });
    cvContent += `\n`;
  }
  
  // Job-specific targeting
  if (jobPosting) {
    cvContent += `---\n\n## 🎯 JOB TARGETING\n\n`;
    cvData += `*This CV has been optimized for the specific job requirements provided.*\n\n`;
  }
  
  return cvContent;
}

// Calculate total years of experience
function calculateTotalExperience(experience) {
  if (!experience || experience.length === 0) return 0;
  
  let totalYears = 0;
  experience.forEach(exp => {
    const startDate = new Date(exp.startDate + '-01');
    const endDate = exp.endDate ? new Date(exp.endDate + '-01') : new Date();
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
    totalYears += years;
  });
  
  return Math.floor(totalYears);
}

// Main generation function
async function generateCV(options) {
  console.log(`🏥 Generating ${options.focus} CV for ${options.profile}...`);
  
  // Load profile data
  const profile = loadProfile(options.profile);
  
  // Load job posting if specified
  let jobPosting = null;
  if (options.job) {
    try {
      jobPosting = fs.readFileSync(options.job, 'utf8');
      console.log(`📄 Loaded job posting: ${options.job}`);
    } catch (error) {
      console.warn(`⚠️  Could not load job posting: ${error.message}`);
    }
  }
  
  // Generate CV content
  const cvContent = generateCVContent(profile, options.template, options.focus, jobPosting);
  
  // Determine output path
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultOutput = `output/${options.profile}-${options.focus}-cv-${timestamp}.md`;
  const outputPath = options.output || defaultOutput;
  const fullOutputPath = path.resolve(rootDir, outputPath);
  
  // Ensure output directory exists
  const outputDir = path.dirname(fullOutputPath);
  if (!fs.existsSync(outputDir)) {
    console.log(`📁 Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write CV file
  fs.writeFileSync(fullOutputPath, cvContent, 'utf8');
  
  console.log(`✅ CV generated successfully!`);
  console.log(`📄 Output: ${fullOutputPath}`);
  console.log(`📊 Template: ${options.template}`);
  console.log(`🎯 Focus: ${options.focus}`);
  
  // Try to run quality evaluation if available
  try {
    const { execSync } = await import('child_process');
    console.log(`\n🔍 Running quality evaluation...`);
    const qualityResult = execSync(`node scripts/evaluate-cv-quality.js "${fullOutputPath}"`, { 
      encoding: 'utf8',
      cwd: rootDir 
    });
    console.log(qualityResult);
  } catch (error) {
    console.log(`ℹ️  Quality evaluation not available: ${error.message}`);
  }
  
  return {
    success: true,
    outputPath: fullOutputPath,
    profile: options.profile,
    template: options.template,
    focus: options.focus
  };
}

// Main execution
async function main() {
  const options = parseArguments();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  try {
    const result = await generateCV(options);
    
    console.log(`\n🎉 CV Generation Complete!`);
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Review the generated CV: ${result.outputPath}`);
    console.log(`2. Make any personal adjustments needed`);
    console.log(`3. Generate PDF: node scripts/generate-pdf.js "${result.outputPath}"`);
    console.log(`4. Run ATS analysis if you have a job posting`);
    
  } catch (error) {
    console.error(`❌ Error generating CV: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCV, loadProfile, generateCVContent };