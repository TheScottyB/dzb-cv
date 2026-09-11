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
      focusAreas: ['EKG EXPERTISE & CERTIFICATIONS', 'HEALTHCARE EXPERIENCE', 'CORE COMPETENCIES']
    },
    medical: {
      title: 'Healthcare Professional | Medical Support Specialist',
      summary: `**Healthcare Professional** with **${calculateTotalExperience(experience)}+ years medical industry experience**. Proven expertise in patient care, medical administration, and healthcare operations.`,
      keySkills: ['Patient Care', 'Medical Terminology', 'Healthcare Compliance', 'Medical Documentation', 'Patient Education'],
      focusAreas: ['MEDICAL EXPERIENCE', 'HEALTHCARE ADMINISTRATION', 'CORE COMPETENCIES']
    },
    general: {
      title: 'Healthcare Professional',
      summary: `**Healthcare Professional** with **${calculateTotalExperience(experience)}+ years experience** in medical environments and patient care.`,
      keySkills: skills.map(s => s.name).slice(0, 6),
      focusAreas: ['EXPERIENCE', 'EDUCATION & CERTIFICATIONS', 'SKILLS']
    }
  };
  
  const optimization = focusOptimizations[focus] || focusOptimizations.general;
  
  // Format "YYYY-MM" as "Mon YYYY" for human-readable dates
  const fmtDate = (d) => {
    if (!d || d === 'Present') return 'Present';
    const m = /^(\d{4})-(\d{2})$/.exec(d);
    if (!m) return d;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[Number(m[2]) - 1]} ${m[1]}`;
  };

  // Generate markdown CV. One bullet per line, period-terminated, no emoji:
  // ATS parsers and the readability scorer both prefer real list items.
  const bullet = (text) => `- ${String(text).replace(/[.\s]+$/, '')}.\n`;

  let cvContent = `# ${personalInfo.name.full}\n`;
  cvContent += `**${optimization.title}**\n\n`;
  cvContent += `${personalInfo.contact.email} | ${personalInfo.contact.phone} | ${personalInfo.contact.location}\n\n`;
  cvContent += `---\n\n`;

  // Professional Summary
  cvContent += `## PROFESSIONAL SUMMARY\n\n`;
  cvContent += `${optimization.summary}\n\n`;
  if (focus === 'ekg') {
    cvContent += `Seeking opportunities in hospital cardiac units, cardiology practices, and healthcare facilities.\n\n`;
  }
  cvContent += `---\n\n`;

  // Experience Section
  if (experience && experience.length > 0) {
    cvContent += `## ${optimization.focusAreas[1] || 'EXPERIENCE'}\n\n`;
    experience.forEach(exp => {
      cvContent += `**${exp.position}** — ${exp.employer}\n`;
      const range = exp.endDate == null && !/present/i.test(exp.startDate)
        ? fmtDate(exp.startDate)
        : `${fmtDate(exp.startDate)} to ${fmtDate(exp.endDate)}`;
      cvContent += `${range}\n\n`;
      if (exp.responsibilities) {
        exp.responsibilities.forEach(r => { cvContent += bullet(r); });
        cvContent += `\n`;
      }
    });
    cvContent += `---\n\n`;
  }

  // Certifications Section (emphasized for EKG focus)
  if (certifications && certifications.length > 0) {
    const sectionTitle = focus === 'ekg' ? 'EKG EXPERTISE & CERTIFICATIONS' : 'CERTIFICATIONS';
    cvContent += `## ${sectionTitle}\n\n`;
    certifications.forEach(cert => {
      const detail = [cert.issuer, cert.date].filter(Boolean).join(', ');
      cvContent += bullet(`**${cert.name}**${detail ? ` — ${detail}` : ''}`);
    });
    cvContent += `\n`;
    if (focus === 'ekg') {
      cvContent += `**EKG Skills**\n\n`;
      ['EKG/ECG Testing', 'Cardiac Rhythm Analysis', '12-Lead EKG Interpretation',
       'Holter Monitor Setup and Analysis', 'Stress Test Monitoring',
       'Patient Cardiac Assessment'].forEach(s => { cvContent += bullet(s); });
      cvContent += `\n`;
    }
    cvContent += `---\n\n`;
  }

  // Skills/Competencies Section
  cvContent += `## CORE COMPETENCIES\n\n`;
  const skillsByCategory = {};
  skills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill.name);
  });

  Object.entries(skillsByCategory).forEach(([category, skillList]) => {
    cvContent += bullet(`**${category}:** ${skillList.join(', ')}`);
  });
  cvContent += `\n---\n\n`;

  // Education Section
  if (education && education.length > 0) {
    cvContent += `## EDUCATION\n\n`;
    education.forEach(edu => {
      const detail = [edu.institution, edu.year].filter(Boolean).join(', ');
      cvContent += bullet(`**${edu.degree}**${detail ? ` — ${detail}` : ''}`);
    });
    cvContent += `\n`;
  }

  // Job-specific targeting
  if (jobPosting) {
    cvContent += `---\n\nThis CV has been tailored to the specific job requirements provided.\n\n`;
  }

  return cvContent;
}

// Parse a period token into a Date. Accepts "YYYY-MM", "YYYY", "Month YYYY",
// and "Present" / "Current" (=> now). Returns null when unparseable.
function parsePeriodDate(token, { endOfPeriod = false } = {}) {
  if (token == null) return null;
  const t = String(token).trim();
  if (/^(present|current|now)$/i.test(t)) return new Date();
  let m;
  if ((m = t.match(/^(\d{4})-(\d{1,2})$/))) {
    return new Date(Number(m[1]), Number(m[2]) - 1, 1);
  }
  if ((m = t.match(/^(\d{4})$/))) {
    // Bare year: start => Jan 1, end => Dec 31 of that year
    return endOfPeriod ? new Date(Number(m[1]), 11, 31) : new Date(Number(m[1]), 0, 1);
  }
  if ((m = t.match(/^([A-Za-z]+)\.?\s+(\d{4})$/))) {
    const d = new Date(`${m[1]} 1, ${m[2]}`);
    return isNaN(d) ? null : d;
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

// Calculate total years of experience (sum of role durations, floored).
// A role with a start but no end is treated as spanning its start period
// (e.g. "2002" alone => calendar year 2002), not as ongoing.
function calculateTotalExperience(experience) {
  if (!experience || experience.length === 0) return 0;

  let totalMs = 0;
  experience.forEach(exp => {
    const start = parsePeriodDate(exp.startDate);
    if (!start) return;
    let end = exp.endDate
      ? parsePeriodDate(exp.endDate, { endOfPeriod: true })
      : parsePeriodDate(exp.startDate, { endOfPeriod: true });
    if (!end || end < start) return;
    totalMs += end - start;
  });

  return Math.max(0, Math.floor(totalMs / (1000 * 60 * 60 * 24 * 365.25)));
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