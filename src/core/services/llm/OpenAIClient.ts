import OpenAI from 'openai';
import type { CVData } from '@dzb-cv/types';

// Legacy interface - now using consolidated types
/*interface CVData {
  personalInfo: {
    name: {
      first: string;
      last: string;
      full: string;
    };
    contact: {
      email: string;
      phone?: string;
      address?: string;
    };
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    employer: string;
    responsibilities?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    graduationDate?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
  } | string>;
}

/**
 * Options for LLM content processing
 */
export interface LLMProcessingOptions {
  style?: 'professional' | 'academic' | 'technical' | 'executive';
  targetSections?: string[];
  maxLength?: number;
  model?: string;
}

/**
 * Result from LLM processing
 */
export interface LLMProcessingResult {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Service for interacting with OpenAI's API for CV content processing
 */
export class OpenAIClient {
  private client: OpenAI;
  private defaultModel: string = 'gpt-4o';
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. LLM features will use fallback simulation.');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey || 'dummy-key', // Use dummy key for graceful degradation
      dangerouslyAllowBrowser: true, // Allow browser-like environments for testing
    });
  }

  /**
   * Distills CV content into a concise single-page format
   * @param cvData Structured CV data to distill
   * @param options Processing options
   * @returns Distilled content with metadata
   */
  async distill(cvData: CVData, options: LLMProcessingOptions = {}): Promise<LLMProcessingResult> {
    const { style = 'professional', maxLength = 2000, model = this.defaultModel } = options;
    
    if (!process.env.OPENAI_API_KEY) {
      return this.fallbackDistill(cvData, options);
    }

    const prompt = this.buildDistillationPrompt(cvData, style, maxLength);
    
    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(style)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: Math.min(maxLength * 2, 4000), // Allow for expansion  
          temperature: 0.1, // Optimized for consistency and precision based on A/B testing
          top_p: 0.9, // Slightly restrict token choices for better quality
        });
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      return {
        content,
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
        model: response.model,
      };
    } catch (error) {
      console.error('OpenAI Distillation Error:', error);
      return this.fallbackDistill(cvData, options);
    }
  }

  /**
   * Optimizes distilled content for single-page layout
   * @param content Content to optimize
   * @param constraints Layout constraints
   * @returns Optimized content
   */
  async optimize(
    content: string, 
    constraints: {
      maxLines?: number;
      maxCharactersPerLine?: number;
      pageFormat?: 'A4' | 'Letter';
    } = {}
  ): Promise<LLMProcessingResult> {
    const { maxLines = 45, maxCharactersPerLine = 80, pageFormat = 'Letter' } = constraints;
    
    if (!process.env.OPENAI_API_KEY) {
      return this.fallbackOptimize(content, constraints);
    }

    const prompt = this.buildOptimizationPrompt(content, maxLines, maxCharactersPerLine, pageFormat);
    
    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.chat.completions.create({
          model: this.defaultModel,
          messages: [
            {
              role: 'system',
              content: 'You are a professional document formatter specializing in CV optimization for single-page layouts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1, // Optimized for consistent precise formatting
          top_p: 0.9, // Restrict token choices for better formatting quality
        });
      });

      let optimizedContent = response.choices[0]?.message?.content?.trim() || content;
      
      // Validate and fix any orphaned headers
      optimizedContent = this.validateAndFixOrphanedHeaders(optimizedContent);
      
      return {
        content: optimizedContent,
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
        model: response.model,
      };
    } catch (error) {
      console.error('OpenAI Optimization Error:', error);
      return this.fallbackOptimize(content, constraints);
    }
  }

  /**
   * Get system prompt based on CV style
   */
  private getSystemPrompt(style: string): string {
    const basePrompt = 'You are an expert CV writer specializing in creating concise, impactful single-page resumes.';
    
    switch (style) {
      case 'executive':
        return `${basePrompt} Focus on leadership achievements, strategic impact, and quantifiable results. Use executive-level language.`;
      case 'academic':
        return `${basePrompt} Emphasize research, publications, teaching, and academic achievements. Maintain scholarly tone.`;
      case 'technical':
        return `${basePrompt} Highlight technical skills, projects, and hands-on experience. Use precise technical terminology.`;
      default: // professional
        return `${basePrompt} Create a professional, well-balanced CV suitable for corporate environments.`;
    }
  }

  /**
   * Build distillation prompt for CV content
   */
  private buildDistillationPrompt(cvData: CVData, style: string, maxLength: number): string {
    const cvText = this.cvDataToText(cvData);
    
    return `You are a senior CV strategist with deep expertise in content prioritization and single-page optimization. Analyze the following CV and create a strategic distillation.

**STRATEGIC ANALYSIS REQUIRED:**
1. **Content Audit**: Identify the 3-5 most impactful achievements, skills, and experiences
2. **Relevance Scoring**: Rank sections by their value to target employers
3. **Impact Assessment**: Prioritize quantifiable results and measurable outcomes
4. **Space Allocation**: Distribute ~${maxLength} characters across sections based on strategic importance

**DISTILLATION CRITERIA:**
- **Style**: ${style} - adapt language and emphasis accordingly
- **Priority Order**: Most recent and relevant first
- **Impact Focus**: Lead with achievements that demonstrate ROI, efficiency gains, or problem-solving
- **Skill Relevance**: Include only skills that align with career trajectory and add unique value
- **Experience Depth**: Vary detail level - more for recent/relevant roles, less for older/tangential ones

**SECTION INCLUSION LOGIC:**
For each potential section, apply this decision matrix:
- **INCLUDE** if: High relevance to target role + Substantial content (3+ meaningful bullet points)
- **CONDENSE** if: Medium relevance + Limited space (combine with other sections)
- **EXCLUDE** if: Low relevance OR insufficient content for standalone section

**CRITICAL QUALITY CONTROLS:**
❌ **NEVER DO**: Include section headers without 2-3 substantial bullet points underneath
❌ **NEVER DO**: Add filler content or generic statements to pad sections
❌ **NEVER DO**: Include outdated skills or irrelevant experiences just to fill space

✅ **ALWAYS DO**: Every section must justify its inclusion with concrete value
✅ **ALWAYS DO**: Prioritize recent, quantifiable achievements with clear business impact
✅ **ALWAYS DO**: Ensure each bullet point adds unique information and demonstrates capability

**EXAMPLE STRATEGIC THINKING:**

For Healthcare Professional:
- Core Competencies section: INCLUDE if demonstrates 3+ distinct skill areas with years of experience
- Recent Certifications: HIGH PRIORITY - shows current capabilities
- Older Experience: CONDENSE to 1-2 lines focusing on transferable skills
- Technical Skills: INCLUDE only those relevant to target healthcare environment

**FORMAT EXPECTATIONS:**
- Use professional markdown formatting with clear section headers
- Bullet points should be concise but information-dense
- Include quantifiable metrics where available (years, percentages, volumes)
- Maintain consistent tense and formatting throughout

**Original CV for Analysis:**
${cvText}

**Task**: Create a strategically optimized single-page CV that maximizes impact while respecting the ${maxLength} character limit. Focus on content that tells a compelling professional story and demonstrates clear value to potential employers.`;
  }

  /**
   * Build optimization prompt for layout formatting
   */
  private buildOptimizationPrompt(
    content: string, 
    maxLines: number, 
    maxCharactersPerLine: number, 
    pageFormat: string
  ): string {
    return `Optimize the following CV content for single-page ${pageFormat} format:

Constraints:
- Maximum ${maxLines} lines
- Maximum ${maxCharactersPerLine} characters per line
- Must fit on one page
- Maintain professional formatting
- Use bullet points and concise language
- Preserve all essential information

Content to optimize:\n\n${content}`;
  }

  /**
   * Convert CV data to text format
   */
  private cvDataToText(cvData: CVData): string {
    const sections = [];
    
    // Personal info
    sections.push(`Name: ${cvData.personalInfo.name.full}`);
    sections.push(`Email: ${cvData.personalInfo.contact.email}`);
    if (cvData.personalInfo.contact.phone) {
      sections.push(`Phone: ${cvData.personalInfo.contact.phone}`);
    }
    
    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      sections.push('\nEXPERIENCE:');
      cvData.experience.forEach(exp => {
        const title = exp.title || exp.position || 'Position';
        const company = exp.company || exp.employer || 'Company';
        sections.push(`${title} at ${company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
        if (exp.responsibilities) {
          exp.responsibilities.forEach(resp => sections.push(`• ${resp}`));
        }
        if (exp.description) {
          sections.push(exp.description);
        }
      });
    }
    
    // Education
    if (cvData.education.length > 0) {
      sections.push('\nEDUCATION:');
      cvData.education.forEach(edu => {
        const graduationDate = edu.graduationDate || edu.endDate || 'N/A';
        sections.push(`${edu.degree} from ${edu.institution} (${graduationDate})`);
      });
    }
    
    // Skills
    if (cvData.skills.length > 0) {
      const skillNames = cvData.skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name
      );
      sections.push(`\nSKILLS: ${skillNames.join(', ')}`);
    }
    
    return sections.join('\n');
  }

  /**
   * Make OpenAI request with retry logic
   */
  private async makeRequestWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('401')) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          console.warn(`OpenAI request attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Fallback distillation when OpenAI is unavailable
   */
  private async fallbackDistill(cvData: CVData, options: LLMProcessingOptions): Promise<LLMProcessingResult> {
    const { style = 'professional', maxLength = 2000 } = options;
    const name = cvData.personalInfo.name.full;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let template = '';
    
    switch (style) {
      case 'executive':
        template = `${name} - Executive Summary\n\nSeasoned professional with extensive leadership experience and proven track record of driving organizational success.`;
        break;
      case 'academic':
        template = `${name}\n\nAcademic researcher with specialized expertise and commitment to advancing knowledge in the field.`;
        break;
      case 'technical':
        template = `${name}\n\nTechnical specialist with hands-on experience in cutting-edge technologies and methodologies.`;
        break;
      default: // professional
        template = `${name}\n\nDedicated professional with proven track record of delivering results and driving innovation.`;
    }
    
    // Add condensed experience
    if (cvData.experience && cvData.experience.length > 0) {
      const primaryRole = cvData.experience[0];
      const title = primaryRole.title || primaryRole.position || 'Position';
      const company = primaryRole.company || primaryRole.employer || 'Company';
      template += ` Currently serving as ${title} at ${company}, bringing expertise in strategic planning and execution.`;
    }
    
    // Add key skills
    if (cvData.skills.length > 0) {
      const topSkillNames = cvData.skills.slice(0, 5).map(skill => 
        typeof skill === 'string' ? skill : skill.name
      );
      template += ` Core competencies include: ${topSkillNames.join(', ')}.`;
    }
    
    // Add education
    if (cvData.education.length > 0) {
      const degree = cvData.education[0];
      template += ` Educational background: ${degree.degree} from ${degree.institution}.`;
    }
    
    // Truncate to max length if necessary
    const content = template.length > maxLength ? template.substring(0, maxLength - 3) + '...' : template;
    
    return {
      content,
      model: 'fallback-simulation',
    };
  }

  /**
   * Fallback optimization when OpenAI is unavailable
   */
  private async fallbackOptimize(
    content: string, 
    constraints: {
      maxLines?: number;
      maxCharactersPerLine?: number;
      pageFormat?: 'A4' | 'Letter';
    }
  ): Promise<LLMProcessingResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    let optimized = content;
    
    // Apply basic optimizations
    optimized = optimized.replace(/\n\s*\n/g, '\n'); // Remove extra whitespace
    optimized = optimized.replace(/\n•\s*/g, ' • '); // Condense bullet points
    
    // Apply abbreviations
    const abbreviations: Record<string, string> = {
      'University': 'Univ.',
      'Bachelor': 'B.',
      'Master': 'M.',
      'Management': 'Mgmt',
      'Development': 'Dev',
      'Engineering': 'Eng',
      'Technology': 'Tech',
      'Experience': 'Exp',
    };
    
    for (const [full, abbrev] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${full}\\b`, 'g');
      optimized = optimized.replace(regex, abbrev);
    }
    
    return {
      content: optimized,
      model: 'fallback-optimization',
    };
  }

  /**
   * Validate and fix orphaned headers (headers without meaningful content)
   */
  private validateAndFixOrphanedHeaders(content: string): string {
    const lines = content.split('\n');
    const fixedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a header (starts with # or ##)
      if (line.match(/^#+\s/)) {
        // Look ahead to see if there's meaningful content
        let hasContent = false;
        let contentLines = 0;
        
        for (let j = i + 1; j < lines.length && j < i + 8; j++) {
          const nextLine = lines[j].trim();
          
          // Stop if we hit another header
          if (nextLine.match(/^#+\s/)) break;
          
          // Skip empty lines
          if (!nextLine) continue;
          
          // Count meaningful content lines
          if (nextLine.length > 15) { // Meaningful content threshold
            contentLines++;
          }
        }
        
        // Header needs at least 2 lines of meaningful content or 1 very substantial line
        hasContent = contentLines >= 2 || (contentLines >= 1 && this.hasSubstantialContent(lines, i + 1, i + 8));
        
        // Only include header if it has meaningful content
        if (hasContent) {
          fixedLines.push(line);
        } else {
          console.warn(`Removing orphaned header: ${line}`);
          // Skip the header and its minimal content
          while (i + 1 < lines.length && !lines[i + 1].match(/^#+\s/) && lines[i + 1].trim()) {
            i++; // Skip the insufficient content
          }
        }
      } else {
        fixedLines.push(line);
      }
    }
    
    return fixedLines.join('\n');
  }

  /**
   * Check if there's substantial content in a range of lines
   */
  private hasSubstantialContent(lines: string[], startIdx: number, endIdx: number): boolean {
    let totalContent = 0;
    let bulletPoints = 0;
    
    for (let i = startIdx; i < Math.min(endIdx, lines.length); i++) {
      const line = lines[i].trim();
      if (!line || line.match(/^#+\s/)) break;
      
      totalContent += line.length;
      if (line.match(/^[•\-\*]\s/)) {
        bulletPoints++;
      }
    }
    
    // Substantial if: total content > 100 chars OR 3+ bullet points OR 1 very long line (>50 chars)
    return totalContent > 100 || bulletPoints >= 3 || lines.slice(startIdx, endIdx).some(line => line.trim().length > 50);
  }
}

export default new OpenAIClient();

