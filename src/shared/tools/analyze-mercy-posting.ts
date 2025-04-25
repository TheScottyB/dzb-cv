// Generic work experience
export interface WorkExperience {
  employer: string;
  position: string;
  period: string;
  responsibilities: string[];
  address?: string | undefined;
  hours?: string | undefined;
  supervisor?: string | undefined;
  mayContact?: boolean | undefined;
}

// Skills breakdown by category
export interface Skills {
  healthcareAdministration: string[];
  managementAndLeadership: string[];
  technical: string[];
  certifications: string[];
}

// Personal information structure

export interface PersonalInfo {
  name: {
    full: string;
    preferred: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

// Education + optional metadata
export interface EducationEntry {
  certification: string;
  institution?: string;
  year?: string;
}

// Base information from applicant profile
export interface BaseInfo {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: {
    healthcare: WorkExperience[];
    realEstate: WorkExperience[];
    foodIndustry: WorkExperience[];
  };
  education: EducationEntry[];
  skills: Skills;
}

// Parsed job data for tailoring purposes
export interface JobData {
  position: string;
  employer: string;
  location: string;
  education: string[];
  experience: string[];
  certifications: string[];
  skills: string[];
  responsibilities: string[];
  realExperience: WorkExperience[];
}

// Final output passed to CV generator & ATS analyzer
export interface ATSContent {
  header: {
    name: string;
    title: string;
    contact: {
      email: string;
      phone: string;
      location: string;
    };
  };
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
  realExperience: WorkExperience[];
}

interface ATSIssue {
  type: 'missing' | 'mismatch' | 'format' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string | undefined;
}

// Output from ATS compatibility analysis
export interface ATSAnalysis {
  score: number;
  improvements: string[];
  issues: ATSIssue[];
  warnings: string[];
}



function generateCVMarkdown(atsContent: ATSContent): string {
  const { header, summary, skills, realExperience, education, certifications } = atsContent;

  let markdown = `# ${header.name}\n\n`;
  markdown += `${header.contact.email} | ${header.contact.phone} | ${header.contact.location}\n`;
  markdown += `${header.title}\n\n`;

  // Summary
  markdown += `## Summary\n\n${summary}\n\n`;

  // Skills
  markdown += `## Skills\n\n`;
  skills.forEach(skill => {
    markdown += `- ${skill}\n`;
  });
  markdown += '\n';

  // Experience
  markdown += `## Experience\n\n`;
  realExperience.forEach(exp => {
    markdown += `### ${exp.position}\n`;
    markdown += `${exp.employer} | ${exp.period}\n`;
    if (exp.address) markdown += `Location: ${exp.address}\n`;
    if (exp.supervisor) markdown += `Supervisor: ${exp.supervisor}${exp.mayContact === false ? ' (Do Not Contact)' : ''}\n`;
    if (exp.hours) markdown += `Hours/Week: ${exp.hours}\n`;
    markdown += '\n';
    exp.responsibilities.forEach(duty => {
      markdown += `- ${duty}\n`;
    });
    markdown += '\n';
  });

  // Education & Certifications
  markdown += `## Education & Certifications\n\n`;
  education.forEach(ed => {
    markdown += `- ${ed.certification}`;
    if (ed.institution) markdown += ` | ${ed.institution}`;
    if (ed.year) markdown += ` | ${ed.year}`;
    markdown += '\n';
  });

  certifications.forEach(cert => {
    if (!education.find(ed => ed.certification === cert)) {
      markdown += `- ${cert}\n`;
    }
  });

  return markdown;
}