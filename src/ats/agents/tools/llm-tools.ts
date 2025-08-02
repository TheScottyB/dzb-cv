import { Tool } from '../types';
import type { CVData } from '@dzb-cv/types';
import OpenAIClient from '../../../core/services/llm/OpenAIClient';
import type { LLMProcessingOptions } from '../../../core/services/llm/OpenAIClient';

interface DistillContentInput {
  cvData: CVData;
  targetSections?: string[]; // Optional list of sections to prioritize
  maxLength?: number; // Target character/word count
  style?: 'professional' | 'academic' | 'technical' | 'executive';
}

interface DistillContentOutput {
  distilledContent: string;
  sectionsIncluded: string[];
  reductionRatio: number; // How much content was reduced (0-1)
  metadata: {
    originalLength: number;
    distilledLength: number;
    processingTime: number;
    llmModel?: string;
    confidence: number;
  };
}

/**
 * Tool for distilling CV content to a single page using an LLM
 */
export const distillContentTool: Tool<DistillContentInput, DistillContentOutput> = {
  name: 'distill_content',
  description: 'Distills multi-page CV content into a single-page summary',
  parameters: {
    type: 'object',
    required: ['cvData'],
    properties: {
      cvData: {
        type: 'object',
        description: 'Structured CV data',
      },
    },
  },
  async execute(input: DistillContentInput): Promise<DistillContentOutput> {
    const startTime = Date.now();
    const { cvData, targetSections = [], maxLength = 2000, style = 'professional' } = input;
    
    // Calculate original content length
    const originalText = stringifyCV(cvData);
    const originalLength = originalText.length;
    
    // Use OpenAI client for actual content distillation
    const llmOptions: LLMProcessingOptions = {
      style,
      targetSections,
      maxLength
    };
    
    const llmResult = await OpenAIClient.distill(cvData, llmOptions);
    const distilledContent = llmResult.content;
    
    const distilledLength = distilledContent.length;
    const reductionRatio = originalLength > 0 ? 1 - (distilledLength / originalLength) : 0;
    const processingTime = Date.now() - startTime;
    
    // Determine which sections were included based on content analysis
    const sectionsIncluded = determineSectionsIncluded(cvData, distilledContent);
    
    return {
      distilledContent,
      sectionsIncluded,
      reductionRatio,
      metadata: {
        originalLength,
        distilledLength,
        processingTime,
        llmModel: llmResult.model,
        confidence: 0.90 // High confidence with actual LLM
      }
    };
  },
};

interface OptimizeContentInput {
  distilledContent: string;
  layoutConstraints?: {
    maxLines: number;
    maxCharactersPerLine: number;
    pageFormat: 'A4' | 'Letter';
    margins: { top: number; right: number; bottom: number; left: number; };
  };
  prioritySections?: string[];
}

interface OptimizeContentOutput {
  optimizedContent: string;
  layoutMetrics: {
    estimatedLines: number;
    fitsOnSinglePage: boolean;
    compressionRatio: number;
  };
  optimizations: string[]; // List of optimizations applied
}

/**
 * Tool for optimizing distilled content to fit a single-page layout
 */
export const optimizeContentTool: Tool<OptimizeContentInput, OptimizeContentOutput> = {
  name: 'optimize_content',
  description: 'Optimizes distilled content for single-page layout',
  parameters: {
    type: 'object',
    required: ['distilledContent'],
    properties: {
      distilledContent: {
        type: 'string',
        description: 'Content distilled by LLM',
      },
    },
  },
  async execute(input: OptimizeContentInput): Promise<OptimizeContentOutput> {
    const { distilledContent, layoutConstraints, prioritySections = [] } = input;
    
    // Default layout constraints for single-page PDF
    const constraints = layoutConstraints || {
      maxLines: 45, // Typical single-page limit
      maxCharactersPerLine: 80,
      pageFormat: 'Letter' as const,
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
    };
    
    const optimizations: string[] = [];
    const originalLength = distilledContent.length;
    
    // First try OpenAI optimization
    try {
      const llmResult = await OpenAIClient.optimize(distilledContent, {
        maxLines: constraints.maxLines,
        maxCharactersPerLine: constraints.maxCharactersPerLine,
        pageFormat: constraints.pageFormat
      });
      
      let optimizedContent = llmResult.content;
      optimizations.push('Applied LLM-based layout optimization');
      
      // Apply additional local optimizations if needed
      const preliminaryLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
      
      if (preliminaryLines > constraints.maxLines) {
        // Apply fallback optimizations
        optimizedContent = optimizedContent.replace(/\n\s*\n/g, '\n');
        optimizations.push('Removed excessive whitespace');
        
        optimizedContent = optimizedContent.replace(/\n•\s*/g, ' • ');
        optimizations.push('Condensed bullet points to inline format');
        
        if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
          optimizedContent = applyAbbreviations(optimizedContent);
          optimizations.push('Applied common abbreviations');
        }
        
        // Final truncation if still too long
        if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
          const targetLength = Math.floor(originalLength * 0.7);
          optimizedContent = optimizedContent.substring(0, targetLength) + '...';
          optimizations.push('Applied aggressive truncation to fit page');
        }
      }
      
      const finalLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
      const compressionRatio = 1 - (optimizedContent.length / originalLength);
      
      return {
        optimizedContent,
        layoutMetrics: {
          estimatedLines: finalLines,
          fitsOnSinglePage: finalLines <= constraints.maxLines,
          compressionRatio
        },
        optimizations
      };
    } catch (error) {
      console.warn('LLM optimization failed, falling back to local optimization:', error);
      
      // Fallback to local optimization
      let optimizedContent = distilledContent;
      
      // Apply local optimization strategies
      optimizedContent = optimizedContent.replace(/\n\s*\n/g, '\n');
      if (optimizedContent.length < originalLength) {
        optimizations.push('Removed excessive whitespace');
      }
      
      optimizedContent = optimizedContent.replace(/\n•\s*/g, ' • ');
      if (optimizedContent.includes(' • ')) {
        optimizations.push('Condensed bullet points to inline format');
      }
      
      if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
        optimizedContent = applyAbbreviations(optimizedContent);
        optimizations.push('Applied common abbreviations');
      }
      
      const estimatedLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
      const fitsOnSinglePage = estimatedLines <= constraints.maxLines;
      const compressionRatio = 1 - (optimizedContent.length / originalLength);
      
      if (!fitsOnSinglePage) {
        const targetLength = Math.floor(originalLength * 0.7);
        optimizedContent = optimizedContent.substring(0, targetLength) + '...';
        optimizations.push('Applied aggressive truncation to fit page');
      }
      
      return {
        optimizedContent,
        layoutMetrics: {
          estimatedLines: estimateLines(optimizedContent, constraints.maxCharactersPerLine),
          fitsOnSinglePage: estimateLines(optimizedContent, constraints.maxCharactersPerLine) <= constraints.maxLines,
          compressionRatio
        },
        optimizations
      };
    }
  },
};

/**
 * Helper function to convert CV data to text for length calculation
 */
function stringifyCV(cvData: CVData): string {
  const sections = [];
  
  // Personal info
  sections.push(`Name: ${cvData.personalInfo.name.full}`);
  sections.push(`Email: ${cvData.personalInfo.contact.email}`);
  if (cvData.personalInfo.contact.phone) {
    sections.push(`Phone: ${cvData.personalInfo.contact.phone}`);
  }
  
  // Experience
  if (cvData.experience.length > 0) {
    sections.push('EXPERIENCE:');
    cvData.experience.forEach(exp => {
      sections.push(`${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
      if (exp.responsibilities) {
        sections.push(...exp.responsibilities);
      }
      if (exp.description) {
        sections.push(exp.description);
      }
    });
  }
  
  // Education
  if (cvData.education.length > 0) {
    sections.push('EDUCATION:');
    cvData.education.forEach(edu => {
      const graduationDate = edu.graduationDate || edu.endDate || 'N/A';
      sections.push(`${edu.degree} from ${edu.institution} (${graduationDate})`);
    });
  }
  
  // Skills
  if (cvData.skills.length > 0) {
    const skillNames = cvData.skills.map(skill => typeof skill === 'string' ? skill : skill.name);
    sections.push(`SKILLS: ${skillNames.join(', ')}`);
  }
  
  return sections.join('\n');
}


/**
 * Determine which sections were included in the distilled content
 */
function determineSectionsIncluded(cvData: CVData, distilledContent: string): string[] {
  const sections: string[] = [];
  
  if (distilledContent.includes(cvData.personalInfo.name.full)) {
    sections.push('personalInfo');
  }
  
  if (cvData.experience.some(exp => distilledContent.includes(exp.company))) {
    sections.push('experience');
  }
  
  if (cvData.education.some(edu => distilledContent.includes(edu.institution))) {
    sections.push('education');
  }
  
  if (cvData.skills.some(skill => {
    const skillName = typeof skill === 'string' ? skill : skill.name;
    return distilledContent.includes(skillName);
  })) {
    sections.push('skills');
  }
  
  return sections;
}

/**
 * Estimate number of lines for given text and character limit per line
 */
function estimateLines(text: string, maxCharactersPerLine: number): number {
  const lines = text.split('\n');
  let totalLines = 0;
  
  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1; // Empty line
    } else {
      totalLines += Math.ceil(line.length / maxCharactersPerLine);
    }
  }
  
  return totalLines;
}

/**
 * Apply common abbreviations to reduce text length
 */
function applyAbbreviations(text: string): string {
  const abbreviations: Record<string, string> = {
    'University': 'Univ.',
    'Bachelor': 'B.',
    'Master': 'M.',
    'Doctor': 'Dr.',
    'Management': 'Mgmt',
    'Development': 'Dev',
    'Engineering': 'Eng',
    'Technology': 'Tech',
    'Information': 'Info',
    'Department': 'Dept',
    'Corporation': 'Corp',
    'Company': 'Co.',
    'International': 'Intl',
    'Professional': 'Prof',
    'Experience': 'Exp',
    'Certificate': 'Cert',
    'Project': 'Proj',
    'Manager': 'Mgr',
    'Senior': 'Sr.',
    'Junior': 'Jr.',
    'Assistant': 'Asst'
  };
  
  let abbreviated = text;
  
  for (const [full, abbrev] of Object.entries(abbreviations)) {
    const regex = new RegExp(`\\b${full}\\b`, 'g');
    abbreviated = abbreviated.replace(regex, abbrev);
  }
  
  return abbreviated;
}
