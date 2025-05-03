/**
 * ML-based resume parser with advanced matching capabilities
 */
import { SKILLS_SET, SKILL_CATEGORIES } from './taxonomies/skills.js';

/**
 * Structure of parsed resume data
 */
export interface ParsedResume {
  structuredData: {
    personalInfo: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    summary?: string;
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
    };
    workExperience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description: string[];
      achievements: string[];
    }>;
    education: Array<{
      degree?: string;
      field?: string;
      institution: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      gpa?: number;
      achievements: string[];
    }>;
    certifications: Array<{
      name: string;
      issuer?: string;
      date?: string;
      expiryDate?: string;
    }>;
    projects: Array<{
      name: string;
      description: string[];
      technologies: string[];
      url?: string;
    }>;
  };
  metadata: {
    fileType: string;
    fileName: string;
    fileSize: number;
    parseDate: string;
    confidence: number;
  };
}

/**
 * Configuration options for the ML parser
 */
export interface MLParserOptions {
  modelPath?: string;
  taxonomyPath?: string;
  confidenceThreshold?: number;
  maxTokens?: number;
}

/**
 * Result of resume analysis against a job description
 */
export interface MLAnalysisResult {
  overallMatch: number;
  categoryMatches: {
    skills: number;
    experience: number;
    education: number;
  };
  missingSkills: string[];
  relevantExperience: Array<{
    role: string;
    relevance: number;
  }>;
  suggestions: string[];
}

/**
 * ML-based resume parser with advanced matching capabilities
 */
export class MLResumeParser {
  private options: Required<MLParserOptions>;
  private skillsSet: Set<string>;

  constructor(options: MLParserOptions = {}) {
    this.options = {
      modelPath: './models/resume-parser',
      taxonomyPath: './data/taxonomies',
      confidenceThreshold: 0.8,
      maxTokens: 1024,
      ...options
    };
    this.skillsSet = SKILLS_SET;
  }

  /**
   * Parses a resume file into structured data
   * @param buffer File buffer
   * @param mimeType File MIME type
   */
  async parseResume(buffer: Buffer, mimeType: string): Promise<ParsedResume> {
    let text = '';

    if (mimeType === 'application/pdf') {
      // TODO: Use real pdf text extraction (e.g. pdf-parse)
      text = await this.extractTextFromPDF(buffer);
    } else if (mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
      text = buffer.toString('utf-8');
    } else if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      // TODO: Add DOCX and other formats as needed
      throw new Error('Unsupported file format for parsing: ' + mimeType);
    }

    return this.parseSectionsFromText(text, buffer, mimeType);
  }

  /**
   * Extracts sections from plain text or markdown resumes
   */
  private parseSectionsFromText(text: string, buffer: Buffer, mimeType: string): ParsedResume {
    // Normalize line endings and split into lines
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    let personalInfoLines: string[] = [];
    let curSection = '';
    let curLines: string[] = [];
    const sections: Record<string, string[]> = {};

    // Identify section headings (case-insensitive, leading lines)
    const headingPattern = /^(SUMMARY|TECHNICAL SKILLS?|SKILLS?|WORK EXPERIENCE|EDUCATION|CERTIFICATIONS?|PROJECTS?)\s*$/i;
    let foundFirstSection = false;
    for (const line of lines) {
      if (!foundFirstSection && !headingPattern.test(line) && line.trim() !== '') {
        // Accumulate header lines before first section
        personalInfoLines.push(line);
        continue;
      }
      foundFirstSection = true;
      const match = line.match(headingPattern);
      if (match) {
        if (curSection && curLines.length) {
          sections[curSection] = curLines;
        }
        curSection = match[1].toUpperCase();
        curLines = [];
      } else if (curSection) {
        curLines.push(line);
      }
    }
    if (curSection && curLines.length) {
      sections[curSection] = curLines;
    }

    // Extract personal info
    const personalInfoText = personalInfoLines.join('\n');
    const emailMatch = personalInfoText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = personalInfoText.match(/(\(\d{3}\)\s*\d{3}-\d{4})|(\d{3}[-.\s]\d{3}[-.\s]\d{4})/);
    const nameMatch = personalInfoLines.length > 0 ? personalInfoLines[0].trim() : '';
    // Simplistic: "123 Main St" as location if found
    const locationMatch = personalInfoText.match(/\d{1,4}\s+\w+\s+\w+/);

    // Extract skills
    const skillsSection = sections['TECHNICAL SKILL'] || sections['TECHNICAL SKILLS'] || sections['SKILLS'] || [];
    const skillWords = skillsSection.flatMap(l => l.split(/[,;]+/).map(w => w.trim()));
    const technicalSkills = skillWords.filter(w => w && w.match(/[A-Za-z0-9]/));

    // Work Experience
    const workSection = sections['WORK EXPERIENCE'] || [];
    const workBlocks = [];
    let block: string[] = [];
    for (const line of workSection) {
      if (line.trim() === '') {
        if (block.length) {
          workBlocks.push(block);
          block = [];
        }
      } else {
        block.push(line);
      }
    }
    if (block.length) workBlocks.push(block);
    const workExperience = workBlocks.map(blockLines => {
      const title = (blockLines[0] || '').trim();
      const companyLine = blockLines[1] || '';
      const dateLine = blockLines.find(l => l.match(/\d{4}/)) || '';
      const bullets = blockLines.slice(2).filter(l => l.startsWith('-')).map(l => l.slice(1).trim());
      return {
        title,
        company: companyLine.trim(),
        description: bullets,
        achievements: [],
      };
    });

    // Education block (very basic)
    const educationSection = sections['EDUCATION'] || [];
    const educationBlocks = [];
    block = [];
    for (const line of educationSection) {
      if (line.trim() === '') {
        if (block.length) {
          educationBlocks.push(block);
          block = [];
        }
      } else {
        block.push(line);
      }
    }
    if (block.length) educationBlocks.push(block);
    const education = educationBlocks.map(b => ({
      degree: b[0] || '',
      institution: b[1] || '',
      achievements: [],
    }));

    // Certifications
    const certSection = sections['CERTIFICATIONS'] || [];
    const certifications = certSection.filter(Boolean).map(l => ({
      name: l.trim(),
    }));

    // Projects
    const projSection = sections['PROJECTS'] || [];
    const projects = projSection.filter(Boolean).map(l => ({
      name: l.trim().split(' - ')[0],
      description: [l.trim()],
      technologies: [],
    }));

    return {
      structuredData: {
        personalInfo: {
          name: nameMatch,
          email: emailMatch ? emailMatch[0].trim() : undefined,
          phone: phoneMatch ? phoneMatch[0].trim() : undefined,
          location: locationMatch ? locationMatch[0].trim() : undefined,
        },
        skills: {
          technical: technicalSkills,
          soft: [],
          languages: [],
        },
        workExperience,
        education,
        certifications,
        projects,
      },
      metadata: {
        fileType: mimeType,
        fileName: 'resume',
        fileSize: buffer.length,
        parseDate: new Date().toISOString(),
        confidence: 0.8
      }
    };
  }

  /**
   * Stub for PDF text extraction - to be implemented with a real PDF library.
   */
  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    // TODO: Use a PDF text extraction library here (e.g., pdf-parse), then parse
    // For now, just return a placeholder string
    return '';
  }

  /**
   * Analyzes a parsed resume against a job description
   * @param resume Parsed resume data
   * @param jobDescription Job description text
   */
  async analyzeResume(
    resume: ParsedResume,
    jobDescription: string
  ): Promise<MLAnalysisResult> {
    const skillsMatch = this.calculateSkillsMatch(
      resume.structuredData.skills,
      jobDescription
    );

    const experienceMatch = this.calculateExperienceMatch(
      resume.structuredData.workExperience,
      jobDescription
    );

    const educationMatch = this.calculateEducationMatch(
      resume.structuredData.education,
      jobDescription
    );

    // Calculate overall match with weighted scores
    const overallMatch = (
      skillsMatch * 0.4 +
      experienceMatch * 0.4 +
      educationMatch * 0.2
    ) * 100;

    // Extract missing skills
    const missingSkills = this.extractMissingSkills(
      resume.structuredData.skills.technical,
      jobDescription
    );

    // Calculate experience relevance
    const relevantExperience = resume.structuredData.workExperience.map(exp => ({
      role: exp.title,
      relevance: this.calculateRoleRelevance(exp, jobDescription)
    }));

    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(
      resume,
      jobDescription,
      missingSkills
    );

    return {
      overallMatch,
      categoryMatches: {
        skills: skillsMatch * 100,
        experience: experienceMatch * 100,
        education: educationMatch * 100
      },
      missingSkills,
      relevantExperience,
      suggestions
    };
  }

  /**
   * Extracts skills from text using the skills taxonomy
   * @param text Text to extract skills from
   */
  private extractSkillsFromText(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const foundSkills = new Set<string>();

    for (const word of words) {
      for (const skill of this.skillsSet) {
        if (word === skill.toLowerCase()) {
          foundSkills.add(skill);
        }
      }
    }

    return Array.from(foundSkills);
  }

  /**
   * Calculates match between resume skills and job description
   */
  private calculateSkillsMatch(
    skills: ParsedResume['structuredData']['skills'],
    jobDescription: string
  ): number {
    const jobDoc = jobDescription.toLowerCase();
    const requiredSkills = this.extractSkillsFromText(jobDescription);

    if (requiredSkills.length === 0) {
      return 0.5; // Neutral if no explicit skills in job desc
    }

    const resumeSkills = skills.technical.map(skill => skill.toLowerCase());
    const matchedSkills = requiredSkills.filter(skill => 
      resumeSkills.includes(skill.toLowerCase())
    );

    // Calculate match score with category bonuses
    let score = matchedSkills.length / requiredSkills.length;

    // Add bonus for having skills in the same categories
    const categoryBonus = this.calculateCategoryBonus(
      skills.technical,
      requiredSkills
    );

    return Math.min(1, score + categoryBonus);
  }

  /**
   * Calculates bonus score for having skills in the same categories
   */
  private calculateCategoryBonus(
    resumeSkills: string[],
    requiredSkills: string[]
  ): number {
    const resumeCategories = new Set<string>();
    const requiredCategories = new Set<string>();

    // Find categories for resume skills
    for (const skill of resumeSkills) {
      for (const category of SKILL_CATEGORIES) {
        if (category.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
          resumeCategories.add(category.name);
        }
      }
    }

    // Find categories for required skills
    for (const skill of requiredSkills) {
      for (const category of SKILL_CATEGORIES) {
        if (category.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
          requiredCategories.add(category.name);
        }
      }
    }

    // Calculate category overlap
    const matchedCategories = Array.from(requiredCategories).filter(cat =>
      resumeCategories.has(cat)
    );

    // Return bonus (max 0.2)
    return Math.min(0.2, matchedCategories.length * 0.05);
  }

  /**
   * Calculates match between work experience and job description
   */
  private calculateExperienceMatch(
    workExperience: ParsedResume['structuredData']['workExperience'],
    jobDescription: string
  ): number {
    const jobDoc = jobDescription.toLowerCase();
    if (workExperience.length === 0) {
      return 0;
    }

    let totalScore = 0;

    for (const exp of workExperience) {
      let expScore = 0;

      // Title match (40%)
      if (jobDoc.includes(exp.title.toLowerCase())) {
        expScore += 0.4;
      }

      // Company match (20%)
      if (jobDoc.includes(exp.company.toLowerCase())) {
        expScore += 0.2;
      }

      // Description match (40%)
      const descriptionMatch = exp.description.some(desc =>
        jobDoc.includes(desc.toLowerCase())
      );
      if (descriptionMatch) {
        expScore += 0.4;
      }

      // Skills match bonus
      const expSkills = this.extractSkillsFromText(
        exp.description.join(' ')
      );
      const jobSkills = this.extractSkillsFromText(jobDescription);
      const skillsOverlap = expSkills.filter(skill =>
        jobSkills.includes(skill)
      ).length;

      if (skillsOverlap > 0) {
        expScore += Math.min(0.2, skillsOverlap * 0.05);
      }

      totalScore += expScore;
    }

    return Math.min(1, totalScore / workExperience.length);
  }

  /**
   * Calculates match between education and job description
   */
  private calculateEducationMatch(
    education: ParsedResume['structuredData']['education'],
    jobDescription: string
  ): number {
    const jobDoc = jobDescription.toLowerCase();
    if (education.length === 0) {
      return 0;
    }

    let totalScore = 0;

    for (const edu of education) {
      let eduScore = 0;

      // Degree match (40%)
      if (edu.degree && jobDoc.includes(edu.degree.toLowerCase())) {
        eduScore += 0.4;
      }

      // Field match (40%)
      if (edu.field && jobDoc.includes(edu.field.toLowerCase())) {
        eduScore += 0.4;
      }

      // Institution match (20%)
      if (jobDoc.includes(edu.institution.toLowerCase())) {
        eduScore += 0.2;
      }

      // Achievement match bonus
      const achievementMatch = edu.achievements.some(achievement =>
        jobDoc.includes(achievement.toLowerCase())
      );
      if (achievementMatch) {
        eduScore += 0.1;
      }

      totalScore += eduScore;
    }

    return Math.min(1, totalScore / education.length);
  }

  /**
   * Extracts skills mentioned in job description but missing from resume
   */
  private extractMissingSkills(
    resumeSkills: string[],
    jobDescription: string
  ): string[] {
    // TODO: Implement skill extraction from job description
    // This would involve:
    // 1. Using NLP to extract skill keywords from job description
    // 2. Comparing against resume skills
    // 3. Filtering for relevant missing skills
    return [];
  }

  /**
   * Calculates relevance of a work experience entry to job description
   */
  private calculateRoleRelevance(
    experience: ParsedResume['structuredData']['workExperience'][0],
    jobDescription: string
  ): number {
    const lowerJobDesc = jobDescription.toLowerCase();
    const relevanceFactors = [
      lowerJobDesc.includes(experience.title.toLowerCase()) ? 0.4 : 0,
      lowerJobDesc.includes(experience.company.toLowerCase()) ? 0.2 : 0,
      experience.description.some(desc => 
        lowerJobDesc.includes(desc.toLowerCase())
      ) ? 0.4 : 0
    ];

    return relevanceFactors.reduce((sum, factor) => sum + factor, 0);
  }

  /**
   * Generates improvement suggestions based on analysis
   */
  private generateSuggestions(
    resume: ParsedResume,
    jobDescription: string,
    missingSkills: string[]
  ): string[] {
    const suggestions: string[] = [];

    // Add suggestions based on missing skills
    if (missingSkills.length > 0) {
      suggestions.push(
        `Consider adding these relevant skills: ${missingSkills.join(', ')}`
      );
    }

    // Add suggestions based on experience
    if (resume.structuredData.workExperience.length === 0) {
      suggestions.push('Add relevant work experience to your resume');
    }

    // Add suggestions based on education
    if (resume.structuredData.education.length === 0) {
      suggestions.push('Add your educational background');
    }

    return suggestions;
  }
} 