import type { CVData } from '../types/cv-types.js';

export async function parseMarkdownProfile(markdown: string): Promise<CVData> {
  // Parse markdown content
  const lines = markdown.split('\n');
  const personalInfo = {
    name: { full: 'Dawn Zurick Beilfuss' },
    contact: { email: 'dawn@example.com', phone: '555-1234' }
  };
  const experience: CVData['experience'] = [];
  const education: CVData['education'] = [];
  const skills: string[] = [];
  const certifications: string[] = [];

  let currentSection = '';
  let currentItem: any = {};

  for (const line of lines) {
    if (line.startsWith('# ')) {
      const name = line.substring(2).trim();
      personalInfo.name.full = name;
    } else if (line.startsWith('## ')) {
      if (currentItem.title) {
        if (currentSection === 'experience') experience.push(currentItem);
        if (currentSection === 'education') education.push(currentItem);
        currentItem = {};
      }
      currentSection = line.substring(3).toLowerCase();
    } else if (line.startsWith('- ')) {
      const item = line.substring(2).trim();
      switch (currentSection) {
        case 'experience':
          // Assume format: "Title at Company (StartDate - EndDate)"
          const expMatch = item.match(/(.+) at (.+) \((.+?)(?:\s*-\s*(.+))?\)/);
          if (expMatch) {
            if (currentItem.title) experience.push(currentItem);
            currentItem = {
              title: expMatch[1],
              company: expMatch[2],
              startDate: expMatch[3],
              endDate: expMatch[4] || undefined,
              responsibilities: []
            };
          } else {
            if (currentItem.title) {
              currentItem.responsibilities.push(item);
            }
          }
          break;
        case 'education':
          // Assume format: "Degree from Institution (Year)"
          const eduMatch = item.match(/(.+) from (.+) \((.+)\)/);
          if (eduMatch) {
            if (currentItem.degree) education.push(currentItem);
            currentItem = {
              degree: eduMatch[1],
              institution: eduMatch[2],
              year: eduMatch[3]
            };
          }
          break;
        case 'skills':
          skills.push(item);
          break;
        case 'certifications':
          certifications.push(item);
          break;
      }
    }
  }

  // Add last item if exists
  if (currentItem.title && currentSection === 'experience') experience.push(currentItem);
  if (currentItem.degree && currentSection === 'education') education.push(currentItem);

  return {
    personalInfo,
    experience,
    education,
    skills,
    certifications
  };
} 