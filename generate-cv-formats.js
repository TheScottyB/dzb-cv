import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadBaseData() {
  try {
    const baseDataPath = path.join(__dirname, 'data', 'base-info.json');
    const rawData = JSON.parse(await fs.readFile(baseDataPath, 'utf-8'));
    return transformBaseInfoToCVData(rawData);
  } catch (error) {
    console.error('Failed to load base data:', error);
    return null;
  }
}

function transformBaseInfoToCVData(rawData) {
  // Extract work experience from nested structure
  const experience = [];
  
  if (rawData.workExperience) {
    // Combine all work experience categories
    const categories = ['healthcare', 'realEstate', 'foodIndustry'];
    categories.forEach(category => {
      if (rawData.workExperience[category] && Array.isArray(rawData.workExperience[category])) {
        rawData.workExperience[category].forEach((job) => {
          experience.push({
            title: job.position || job.title || 'Position',
            company: job.employer || job.company || 'Company',
            startDate: job.period ? job.period.split(' - ')[0] : (job.startDate || 'Unknown'),
            endDate: job.period ? (job.period.includes('Present') ? 'Present' : job.period.split(' - ')[1]) : (job.endDate || 'Present'),
            responsibilities: job.duties || job.responsibilities || []
          });
        });
      }
    });
  }
  
  // Extract skills from nested structure
  const skills = [];
  if (rawData.skills && typeof rawData.skills === 'object') {
    const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'leadership'];
    skillCategories.forEach(category => {
      if (rawData.skills[category] && Array.isArray(rawData.skills[category])) {
        skills.push(...rawData.skills[category]);
      }
    });
  } else if (Array.isArray(rawData.skills)) {
    skills.push(...rawData.skills);
  }
  
  // Extract certifications
  const certifications = [];
  if (rawData.skills?.certifications && Array.isArray(rawData.skills.certifications)) {
    certifications.push(...rawData.skills.certifications);
  }
  if (rawData.skills?.realEstateCertifications && Array.isArray(rawData.skills.realEstateCertifications)) {
    certifications.push(...rawData.skills.realEstateCertifications);
  }
  
  // Extract education
  const education = [];
  if (rawData.education && Array.isArray(rawData.education)) {
    rawData.education.forEach((edu) => {
      education.push({
        degree: edu.certification || edu.degree || 'Certification',
        institution: edu.institution || 'Institution',
        year: edu.year || edu.graduationDate || edu.endDate || 'N/A'
      });
    });
  }
  
  return {
    personalInfo: {
      name: {
        first: rawData.personalInfo?.name?.preferred?.split(' ')[0] || 'Unknown',
        last: rawData.personalInfo?.name?.full?.split(' ').slice(1).join(' ') || 'Unknown',
        full: rawData.personalInfo?.name?.full || 'Unknown Name'
      },
      contact: {
        email: rawData.personalInfo?.contact?.email || 'email@example.com',
        phone: rawData.personalInfo?.contact?.phone || 'Phone not available',
        address: rawData.personalInfo?.contact?.address || 'Address not available'
      },
      title: 'Professional'
    },
    professionalSummary: rawData.professionalSummary || 'Experienced professional with a strong background in delivering results.',
    experience: experience,
    education: education,
    skills: skills,
    certifications: certifications
  };
}

function generateMarkdown(cvData) {
  return `# ${cvData.personalInfo.name.full}

**Contact:** ${cvData.personalInfo.contact.email} | ${cvData.personalInfo.contact.phone}

## Professional Summary
${cvData.professionalSummary}

## Professional Experience
${cvData.experience.map(exp => `
### ${exp.title} at ${exp.company}
**${exp.startDate} - ${exp.endDate}**

${exp.responsibilities.map(resp => `- ${resp}`).join('\n')}
`).join('\n')}

## Education
${cvData.education.map(edu => `
### ${edu.degree} - ${edu.institution}
**${edu.year}**
`).join('\n')}

## Skills
${cvData.skills.map(skill => `- ${skill}`).join('\n')}

## Certifications
${cvData.certifications.map(cert => `- ${cert}`).join('\n')}
`;
}

function generateHTML(cvData) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${cvData.personalInfo.name.full} - CV</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.6;
    }
    h1 { 
      color: #333; 
      border-bottom: 2px solid #007acc;
      padding-bottom: 10px;
    }
    h2 {
      color: #444;
      margin-top: 25px;
    }
    h3 {
      color: #666;
      margin-bottom: 5px;
    }
    .contact-info { 
      margin-bottom: 20px;
      font-size: 14px;
      color: #666;
    }
    .experience-item {
      margin-bottom: 20px;
    }
    .date-range {
      font-style: italic;
      color: #777;
      margin-bottom: 10px;
    }
    ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    li {
      margin: 5px 0;
    }
    .skills-list, .certifications-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill-item, .cert-item {
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>${cvData.personalInfo.name.full}</h1>
  <div class="contact-info">
    ${cvData.personalInfo.contact.email} | ${cvData.personalInfo.contact.phone}
  </div>
  
  <h2>Professional Summary</h2>
  <p>${cvData.professionalSummary}</p>
  
  <h2>Professional Experience</h2>
  ${cvData.experience.map(exp => `
    <div class="experience-item">
      <h3>${exp.title} at ${exp.company}</h3>
      <div class="date-range">${exp.startDate} - ${exp.endDate}</div>
      <ul>
        ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
      </ul>
    </div>
  `).join('')}
  
  <h2>Education</h2>
  ${cvData.education.map(edu => `
    <div class="education-item">
      <h3>${edu.degree} - ${edu.institution}</h3>
      <div class="date-range">${edu.year}</div>
    </div>
  `).join('')}
  
  <h2>Skills</h2>
  <div class="skills-list">
    ${cvData.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
  </div>
  
  <h2>Certifications</h2>
  <div class="certifications-list">
    ${cvData.certifications.map(cert => `<span class="cert-item">${cert}</span>`).join('')}
  </div>
</body>
</html>`;
}

async function generateFiles() {
  console.log('Loading CV data...');
  const cvData = await loadBaseData();
  
  if (!cvData) {
    console.error('Failed to load CV data');
    return;
  }
  
  // Create output directory
  const outputDir = './test-output';
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate Markdown
  console.log('Generating Markdown...');
  const markdown = generateMarkdown(cvData);
  await fs.writeFile(path.join(outputDir, 'dawn-zurick-beilfuss-cv.md'), markdown);
  console.log('✅ Markdown saved: test-output/dawn-zurick-beilfuss-cv.md');
  
  // Generate HTML
  console.log('Generating HTML...');
  const html = generateHTML(cvData);
  await fs.writeFile(path.join(outputDir, 'dawn-zurick-beilfuss-cv.html'), html);
  console.log('✅ HTML saved: test-output/dawn-zurick-beilfuss-cv.html');
  
  console.log('\n🎉 CV files generated successfully!');
}

generateFiles().catch(console.error);
