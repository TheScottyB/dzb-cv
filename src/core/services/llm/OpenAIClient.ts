import OpenAI from 'openai';
// Local CVData type definition for OpenAI integration
interface CVData {
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
  private defaultModel: string = 'gpt-4o-mini';
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
          temperature: 0.3, // More focused, less creative
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
          temperature: 0.2, // Very focused formatting
        });
      });

      const optimizedContent = response.choices[0]?.message?.content?.trim() || content;
      
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
    
    return `Please distill the following CV into a concise, single-page format (approximately ${maxLength} characters).

Requirements:
- Maintain the most impactful information
- Keep it ${style} in tone
- Preserve key achievements and skills
- Ensure readability and flow
- Focus on results and quantifiable accomplishments

Original CV:\n\n${cvText}`;
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
}

export default new OpenAIClient();

