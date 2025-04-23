import { v4 as uuidv4 } from 'uuid';
import {
  ProfileData, 
  BasicInfo, 
  ExperienceEntry, 
  EducationEntry, 
  SkillEntry, 
  CertificationEntry, 
  ProjectEntry 
} from '../types/profile-types.js';

/**
 * Specialized parser for Dawn's markdown CV format
 */
export class MarkdownProfileParser {
  private content: string;
  private lines: string[];
  private sectionMap: Map<string, { startIndex: number, endIndex: number }>;

  constructor(markdownContent: string) {
    this.content = markdownContent;
    this.lines = markdownContent.split('\n');
    this.sectionMap = this.mapSections();
  }

  /**
   * Main parse method - converts markdown to structured ProfileData
   */
  public parse(): ProfileData {
    const basicInfo = this.parseBasicInfo();
    const skills = this.parseSkills();
    const experience = this.parseWorkExperience();
    const education = this.parseEducation();
    const certifications = this.parseCertifications();
    const projects = this.parseVolunteerExperience();

    return {
      basicInfo,
      skills,
      experience,
      education,
      certifications,
      projects
    };
  }

  /**
   * Map all sections in the document to their line ranges
   */
  private mapSections(): Map<string, { startIndex: number, endIndex: number }> {
    const sectionMap = new Map<string, { startIndex: number, endIndex: number }>();
    const sectionHeadings = [
      '**SUMMARY OF SKILLS**',
      '**WORK EXPERIENCE**',
      '**EDUCATION**',
      '**CERTIFICATIONS & LICENSES**',
      '**PROFESSIONAL AFFILIATIONS & LEADERSHIP**',
      '**VOLUNTEER / COMMUNITY SERVICE EXPERIENCE**',
      '**AWARDS AND ACHIEVEMENTS**'
    ];

    // Find the start index of each section
    const sectionStartIndices: { heading: string, index: number }[] = [];
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      if (sectionHeadings.includes(line)) {
        sectionStartIndices.push({ heading: line, index: i });
      }
    }

    // Calculate the end index for each section (start of next section - 1)
    for (let i = 0; i < sectionStartIndices.length; i++) {
      const currentSection = sectionStartIndices[i];
      const nextSection = sectionStartIndices[i + 1];

      const endIndex = nextSection ? nextSection.index - 1 : this.lines.length - 1;
      
      sectionMap.set(currentSection.heading, {
        startIndex: currentSection.index,
        endIndex
      });
    }

    return sectionMap;
  }

  /**
   * Get lines within a specific section
   */
  private getSectionLines(sectionHeading: string): string[] {
    const section = this.sectionMap.get(sectionHeading);
    if (!section) {
      return [];
    }

    return this.lines.slice(section.startIndex + 1, section.endIndex + 1);
  }

  /**
   * Parse basic information (name, contact, etc.)
   */
  private parseBasicInfo(): BasicInfo {
    const basicInfo: BasicInfo = {
      name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
      links: {}
    };

    // Name is typically in the first line
    if (this.lines.length > 0) {
      const nameLine = this.lines[0].trim();
      basicInfo.name = nameLine.replace(/\*\*/g, '').trim();
    }

    // Location is typically in the second line
    if (this.lines.length > 1) {
      basicInfo.location = this.lines[1].trim();
    }

    // Extract phone and email from the first few lines
    for (let i = 0; i < Math.min(10, this.lines.length); i++) {
      const line = this.lines[i].trim();
      
      // Phone extraction
      if (line.toLowerCase().includes('phone') || line.toLowerCase().includes('home:')) {
        const phoneMatch = line.match(/(\d{3}[.-]?\d{3}[.-]?\d{4})/);
        if (phoneMatch) {
          basicInfo.phone = phoneMatch[1];
        }
      }
      
      // Email extraction
      if (line.toLowerCase().includes('email:')) {
        const emailMatch = line.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
        if (emailMatch) {
          basicInfo.email = emailMatch[0];
        }
      }
    }

    // Title - use the most recent position from work experience
    const experienceSection = this.getSectionLines('**WORK EXPERIENCE**');
    if (experienceSection.length > 0) {
      for (const line of experienceSection) {
        if (line.startsWith('*') && line.endsWith('*') && !line.includes('**') && 
            !line.includes('*Salary*') && !line.includes('*Grade*')) {
          basicInfo.title = line.replace(/\*/g, '').trim();
          break;
        }
      }
    }

    // Summary - extract from the skills section
    const skillsSection = this.getSectionLines('**SUMMARY OF SKILLS**');
    if (skillsSection.length > 0) {
      basicInfo.summary = skillsSection
        .filter(line => line.trim().startsWith('*'))
        .map(line => line.trim())
        .join(' ');
    }

    return basicInfo;
  }

  /**
   * Parse skills from the SUMMARY OF SKILLS section
   */
  private parseSkills(): SkillEntry[] {
    const skills: SkillEntry[] = [];
    const skillsSection = this.getSectionLines('**SUMMARY OF SKILLS**');

    if (skillsSection.length === 0) {
      return skills;
    }

    // Track the current category
    let currentCategory = '';

    for (const line of skillsSection) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Category pattern: * **Category:** Skills, Skills, Skills
      if (trimmedLine.startsWith('* **') && trimmedLine.includes(':**')) {
        // Extract category
        const categoryMatch = trimmedLine.match(/\* \*\*(.*?):\*\*/);
        if (categoryMatch) {
          currentCategory = categoryMatch[1].trim();
        }
        
        // Extract skills list after the category
        const skillsText = trimmedLine.replace(/\* \*\*.*?:\*\*/, '').trim();
        const skillsList = skillsText.split(',').map(s => s.trim().replace(/\*/g, ''));
        
        // Add each skill
        for (const skillText of skillsList) {
          if (skillText) {
            skills.push({
              id: uuidv4(),
              name: skillText,
              level: 'advanced', // Default level since not specified
              category: currentCategory,
              yearsOfExperience: 0 // Not specified in CV
            });
          }
        }
      }
    }

    return skills;
  }

  /**
   * Parse work experience entries
   */
  private parseWorkExperience(): ExperienceEntry[] {
    const experience: ExperienceEntry[] = [];
    const workSection = this.getSectionLines('**WORK EXPERIENCE**');
    
    if (workSection.length === 0) {
      return experience;
    }

    let currentCompany: string | null = null;
    let currentLocation: string | null = null;
    let currentSupervisor: string | null = null;
    let currentPosition: string | null = null;
    let currentStartDate: string | null = null;
    let currentEndDate: string | null = null;
    let currentAchievements: string[] = [];

    // Process lines to build complete experience entries
    for (let i = 0; i < workSection.length; i++) {
      const line = workSection[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Company name (bold format)
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('SUMMARY') && !line.includes('WORK EXPERIENCE')) {
        // If we were processing a company, save it first
        if (currentCompany && currentPosition) {
          this.addExperienceEntry(experience, currentCompany, currentPosition, currentLocation, 
            currentSupervisor, currentStartDate, currentEndDate, currentAchievements);
          
          // Reset for new company
          currentLocation = null;
          currentSupervisor = null;
          currentPosition = null;
          currentStartDate = null;
          currentEndDate = null;
          currentAchievements = [];
        }
        
        currentCompany = line.replace(/\*\*/g, '').trim();
        continue;
      }
      
      // Company location (line after company name)
      if (currentCompany && !currentLocation && !line.startsWith('*') && !line.startsWith('Supervisor:')) {
        currentLocation = line;
        continue;
      }
      
      // Supervisor info
      if (line.startsWith('Supervisor:')) {
        currentSupervisor = line;
        continue;
      }
      
      // Position title (in italics)
      if (line.startsWith('*') && line.endsWith('*') && !line.includes('**') && 
          !line.includes('*Salary*') && !line.includes('*Grade*')) {
        currentPosition = line.replace(/\*/g, '').trim();
        continue;
      }
      
      // Date range
      const dateMatch = line.match(/(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4}) - (Present|January|February|March|April|May|June|July|August|September|October|November|December) ?(\d{4})?/);
      if (dateMatch) {
        currentStartDate = `${dateMatch[1]} ${dateMatch[2]}`;
        currentEndDate = dateMatch[3] === 'Present' ? 'Present' : `${dateMatch[3]} ${dateMatch[4] || ''}`.trim();
        continue;
      }
      
      // Skip hours and salary/grade lines
      if (line.includes('hours per week') || line.includes('*Salary:') || line.includes('*Grade')) {
        continue;
      }
      
      // Achievement bullet points
      if (line.startsWith('*') && !line.startsWith('**')) {
        currentAchievements.push(line.replace(/^\* /, '').trim());
        continue;
      }
    }
    
    // Add the last company if it exists
    if (currentCompany && currentPosition) {
      this.addExperienceEntry(experience, currentCompany, currentPosition, currentLocation, 
        currentSupervisor, currentStartDate, currentEndDate, currentAchievements);
    }

    return experience;
  }

  /**
   * Helper to add an experience entry from parsed data
   */
  private addExperienceEntry(
    experience: ExperienceEntry[], 
    company: string, 
    position: string, 
    location: string | null, 
    supervisor: string | null,
    startDateStr: string | null, 
    endDateStr: string | null, 
    achievements: string[]
  ) {
    // Parse dates
    const startDate = startDateStr ? this.parseDate(startDateStr) : new Date();
    let endDate = null;
    if (endDateStr && endDateStr !== 'Present') {
      endDate = this.parseDate(endDateStr);
    }

    experience.push({
      id: uuidv4(),
      company,
      title: position,
      startDate,
      endDate,
      location: location || '',
      description: supervisor || '',
      achievements,
      technologies: [] // No specific technologies mentioned in CV
    });
  }

  /**
   * Parse education entries
   */
  private parseEducation(): EducationEntry[] {
    const education: EducationEntry[] = [];
    const educationSection = this.getSectionLines('**EDUCATION**');
    
    if (educationSection.length === 0) {
      return education;
    }

    let currentFieldOfStudy = '';
    let currentInstitution = '';
    let currentCompletionYear = '';
    
    for (let i = 0; i < educationSection.length; i++) {
      const line = educationSection[i].trim();
      
      // Field of study pattern: * **Coursework:** Field
      if (line.startsWith('* **') && line.includes(':**')) {
        if (currentFieldOfStudy && currentInstitution) {
          // Add previous entry if we're starting a new one
          this.addEducationEntry(education, currentFieldOfStudy, currentInstitution, currentCompletionYear);
          currentInstitution = '';
          currentCompletionYear = '';
        }
        
        const fieldMatch = line.match(/\* \*\*(.*?):\*\*/);
        if (fieldMatch) {
          currentFieldOfStudy = fieldMatch[1].trim();
        }
        continue;
      }
      
      // Institution line (follows field of study)
      if (line.startsWith('    * ')) {
        currentInstitution = line.replace(/^\s*\* /, '').trim();
        continue;
      }
      
      // Completion year
      if (line.includes('Completed:')) {
        const yearMatch = line.match(/Completed: (\d{4})/);
        if (yearMatch) {
          currentCompletionYear = yearMatch[1];
        }
        continue;
      }
    }
    
    // Add the last entry if it exists
    if (currentFieldOfStudy && currentInstitution) {
      this.addEducationEntry(education, currentFieldOfStudy, currentInstitution, currentCompletionYear);
    }

    return education;
  }

  /**
   * Helper to add an education entry from parsed data
   */
  private addEducationEntry(
    education: EducationEntry[],
    fieldOfStudy: string,
    institution: string,
    completionYear: string
  ) {
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Estimate 1 year for completion
    
    let endDate = null;
    if (completionYear) {
      endDate = new Date(parseInt(completionYear), 11, 31); // December 31st of completion year
    }

    education.push({
      id: uuidv4(),
      institution,
      degree: 'Certificate', // Default since specific degree not provided
      fieldOfStudy,
      startDate,
      endDate,
      gpa: null, // Not specified in CV
      activities: [],
      achievements: []
    });
  }

  /**
   * Parse certifications and licenses
   */
  private parseCertifications(): CertificationEntry[] {
    const certifications: CertificationEntry[] = [];
    const certSection = this.getSectionLines('**CERTIFICATIONS & LICENSES**');
    
    if (certSection.length === 0) {
      return certifications;
    }

    for (let i = 0; i < certSection.length; i++) {
      const line = certSection[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Certification pattern: * **Certification Name** (Issuer)
      if (line.startsWith('* **')) {
        // Extract certification name
        const nameMatch = line.match(/\* \*\*(.*?)[,\*]/);
        if (!nameMatch) continue;
        
        const name = nameMatch[1].trim();
        
        // Extract issuer if available on the same line
        let issuer = '';
        const issuerMatch = line.match(/\((.*?)\)/);
        if (issuerMatch) {
          issuer = issuerMatch[1].trim();
        }
        
        // Look for date information in subsequent lines
        let dateObtained = new Date();
        let expirationDate = null;
        let credentialId = null;
        let credentialURL = null;
        
        // Check the next few lines for date information
        for (let j = i + 1; j < Math.min(i + 5, certSection.length); j++) {
          const dateLine = certSection[j].trim();
          
          // Skip if we've reached a new certification
          if (dateLine.startsWith('* **')) break;
          
          // Look for issue dates
          if (dateLine.includes('Issued:') || dateLine.includes('Held:')) {
            const dateRangeMatch = dateLine.match(/(Issued|Held): (.*?) ?[-–] ?(Current|\d{4})/);
            if (dateRangeMatch) {
              // Parse start date
              const startDateStr = dateRangeMatch[2].trim();
              const startYearMatch = startDateStr.match(/\d{4}/);
              if (startYearMatch) {
                dateObtained = new Date(parseInt(startYearMatch[0]), 0, 1); // January 1st of year
              }
              
              // If there's an end date that's not "Current"
              if (dateRangeMatch[3] && dateRangeMatch[3] !== 'Current') {
                const endYear = parseInt(dateRangeMatch[3]);
                expirationDate = new Date(endYear, 11, 31); // December 31st of year
              }
            }
          }
        }
        
        // Add certification
        certifications.push({
          id: uuidv4(),
          name,
          issuer: issuer || 'Unknown',
          dateObtained,
          expirationDate,
          credentialId,
          credentialURL
        });
      }
    }
    
    return certifications;
  }

  /**
   * Parse volunteer experience as projects
   */
  private parseVolunteerExperience(): ProjectEntry[] {
    const projects: ProjectEntry[] = [];
    const volunteerSection = this.getSectionLines('**VOLUNTEER / COMMUNITY SERVICE EXPERIENCE**');
    
    if (volunteerSection.length === 0) {
      return projects;
    }

    let currentOrg: string | null = null;
    let currentLocation: string | null = null;
    let currentRole: string | null = null;
    let currentDates: string | null = null;
    let currentHighlights: string[] = [];
    
    for (let i = 0; i < volunteerSection.length; i++) {
      const line = volunteerSection[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Organization pattern: * **Organization Name**
      if (line.startsWith('* **') && line.endsWith('**')) {
        // If we were processing an organization, save it first
        if (currentOrg) {
          this.addProjectEntry(projects, currentOrg, currentLocation, currentRole, currentDates, currentHighlights);
          
          // Reset for new organization
          currentLocation = null;
          currentRole = null;
          currentDates = null;
          currentHighlights = [];
        }
        
        currentOrg = line.replace(/\* \*\*|\*\*/g, '').trim();
        continue;
      }
      
      // Location (usually follows organization)
      if (line.startsWith('    *') && !currentLocation) {
        currentLocation = line.replace(/^\s*\*\s*/, '').trim();
        continue;
      }
      
      // Role (volunteer position)
      if (line.includes('Volunteer') || line.includes('Service')) {
        currentRole = line.replace(/^\s*\*\s*/, '').trim();
        continue;
      }
      
      // Skip supervisor and hours lines
      if (line.includes('Supervisor:') || line.includes('Approx. Hours')) {
        continue;
      }
      
      // Dates of service
      if (line.includes('Dates of Service:')) {
        currentDates = line.replace('Dates of Service:', '').trim();
        continue;
      }
      
      // Highlights/Responsibilities
      if (line.startsWith('    *') && line.includes('Provided') || line.includes('Assisted') || line.includes('Managed')) {
        currentHighlights.push(line.replace(/^\s*\*\s*/, '').trim());
        continue;
      }
    }
    
    // Add the last organization if it exists
    if (currentOrg) {
      this.addProjectEntry(projects, currentOrg, currentLocation, currentRole, currentDates, currentHighlights);
    }
    
    return projects;
  }

  /**
   * Helper to add a project entry from parsed data
   */
  private addProjectEntry(
    projects: ProjectEntry[],
    name: string,
    location: string | null,
    role: string | null,
    dates: string | null,
    highlights: string[]
  ) {
    // Create description from role and location
    const description = [
      role ? `Role: ${role}` : '',
      location ? `Location: ${location}` : ''
    ].filter(Boolean).join(', ');
    
    // Parse dates if available
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Default to 1 year ago if dates unknown
    let endDate = null;
    
    // Extract date if available
    if (dates) {
      const dateMatch = dates.match(/(\d{4})/);
      if (dateMatch) {
        startDate = new Date(parseInt(dateMatch[1]), 0, 1);
      }
    }
    
    projects.push({
      id: uuidv4(),
      name,
      description,
      startDate,
      endDate,
      url: null,
      technologies: [],
      highlights
    });
  }

  /**
   * Parse a date string into a Date object
   */
  private parseDate(dateString: string): Date {
    if (!dateString) {
      return new Date();
    }
    
    // Month name to number mapping
    const months: {[key: string]: number} = {
      'January': 0,
      'February': 1,
      'March': 2,
      'April': 3,
      'May': 4,
      'June': 5,
      'July': 6,
      'August': 7,
      'September': 8,
      'October': 9,
      'November': 10,
      'December': 11
    };
    
    // Handle formats like "January 2023"
    const monthYearMatch = dateString.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
    if (monthYearMatch) {
      const month = months[monthYearMatch[1]] || 0;
      const year = parseInt(monthYearMatch[2]);
      return new Date(year, month, 1); // First day of month
    }
    
    // Handle just year like "2023"
    const yearMatch = dateString.match(/^\d{4}$/);
    if (yearMatch) {
      return new Date(parseInt(dateString), 0, 1); // January 1st of year
    }
    
    // Default return current date if format not recognized
    return new Date();
  }
}

// Export a factory function for easier use
export function createProfileFromMarkdown(markdownContent: string): ProfileData {
  const parser = new MarkdownProfileParser(markdownContent);
  return parser.parse();
}
