export interface ParsedCV {
  personalInfo: {
    name: {
      full: string;
      first?: string;
      last?: string;
    };
    title?: string;
    contact: {
      email: string;
      phone: string;
      location?: string;
    };
  };
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  certifications: string[];
}

export function parseCvMarkdown(markdown: string): ParsedCV {
  // Basic implementation
  const sections = markdown.split(/\n#{1,2}\s+/);
  
  const parsedCV: ParsedCV = {
    personalInfo: {
      name: {
        full: ''
      },
      contact: {
        email: '',
        phone: ''
      }
    },
    experience: [],
    education: [],
    skills: [],
    certifications: []
  };

  // Extract sections based on headers
  sections.forEach(section => {
    if (section.toLowerCase().includes('experience')) {
      // Parse experience section
      parsedCV.experience = parseExperienceSection(section);
    } else if (section.toLowerCase().includes('education')) {
      // Parse education section
      parsedCV.education = parseEducationSection(section);
    } else if (section.toLowerCase().includes('skills')) {
      // Parse skills section
      parsedCV.skills = parseSkillsSection(section);
    } else if (section.toLowerCase().includes('certifications')) {
      // Parse certifications section
      parsedCV.certifications = parseCertificationsSection(section);
    }
  });

  return parsedCV;
}

function parseExperienceSection(section: string): ParsedCV['experience'] {
  const items = section.split('\n').filter(line => line.trim().startsWith('-'));
  return items.map(item => {
    const match = item.match(/^-\s*(.+?)\s+at\s+(.+?)\s+\((.+?)(?:\s*-\s*(.+))?\)$/);
    if (match?.[1] && match?.[2] && match?.[3]) {
      const exp = {
        title: match[1].trim(),
        company: match[2].trim(),
        startDate: match[3].trim(),
        responsibilities: [] as string[]
      } as const;
      const endDate = match[4]?.trim();
      if (endDate) {
        return { ...exp, endDate };
      }
      return exp;
    }
    return {
      title: item.substring(1).trim(),
      company: 'Unknown',
      startDate: 'Unknown',
      responsibilities: [] as string[]
    };
  }) as ParsedCV['experience'];
}

function parseEducationSection(_section: string): ParsedCV['education'] {
  // Basic implementation
  return [];
}

function parseSkillsSection(_section: string): string[] {
  // Basic implementation
  return [];
}

function parseCertificationsSection(_section: string): string[] {
  // Basic implementation
  return [];
} 