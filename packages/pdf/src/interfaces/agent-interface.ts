import { ChromePDFEngine, ChromePDFOptions, ChromePDFResult } from '../core/chrome-engine.js';
import type { CVData } from '@dzb-cv/types';

export interface AgentPDFTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}

export interface AgentPDFOptions {
  /** CV data to convert */
  cvData?: CVData;
  /** HTML content to convert */
  htmlContent?: string;
  /** Output filename */
  filename: string;
  /** Quality preset */
  quality?: 'standard' | 'high' | 'single-page';
  /** Template for CV rendering */
  template?: string;
}

/**
 * AI Agent-focused PDF interface
 * Provides simple, tool-like interface for AI agents to generate PDFs
 */
export class AgentPDFInterface {
  private engine: ChromePDFEngine;

  constructor(tempDir?: string) {
    this.engine = new ChromePDFEngine(tempDir);
  }

  /**
   * Generate PDF with AI agent-friendly interface
   */
  async generate(options: AgentPDFOptions): Promise<{
    success: boolean;
    path?: string;
    error?: string;
    metadata?: {
      executionTime: number;
      fileSize?: number;
      pages?: number;
    };
  }> {
    try {
      const chromeOptions = await this.prepareChromeOptions(options);
      const result = await this.engine.generatePDF(chromeOptions);

      if (result.success) {
        return {
          success: true,
          path: result.outputPath || '',
          metadata: {
            executionTime: result.executionTime || 0,
            // Could add file size and page count detection here
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create PDF generator tool for AI agents
   */
  createPDFTool(): AgentPDFTool {
    return {
      name: 'generate_pdf',
      description: 'Generate high-quality PDF from CV data or HTML content using Chrome',
      parameters: {
        type: 'object',
        properties: {
          cvData: {
            type: 'object',
            description: 'CV data object with personal info, experience, education, etc.'
          },
          htmlContent: {
            type: 'string',
            description: 'HTML content to convert to PDF'
          },
          filename: {
            type: 'string',
            description: 'Output PDF filename (required)'
          },
          quality: {
            type: 'string',
            enum: ['standard', 'high', 'single-page'],
            description: 'Quality preset - single-page optimizes for one page layout',
            default: 'high'
          },
          template: {
            type: 'string',
            description: 'Template name for CV rendering (basic, modern, etc.)',
            default: 'basic'
          }
        },
        required: ['filename']
      },
      execute: async (params: AgentPDFOptions) => {
        return await this.generate(params);
      }
    };
  }

  /**
   * Create CV analysis tool that includes PDF generation
   */
  createCVAnalysisTool(): AgentPDFTool {
    return {
      name: 'analyze_and_generate_cv',
      description: 'Analyze CV data and generate optimized PDF with quality metrics',
      parameters: {
        type: 'object',
        properties: {
          cvData: {
            type: 'object',
            description: 'CV data to analyze and convert',
            required: true
          },
          filename: {
            type: 'string',
            description: 'Output PDF filename',
            required: true
          },
          optimization: {
            type: 'string',
            enum: ['single-page', 'multi-page', 'ats-optimized'],
            description: 'Optimization strategy for the CV',
            default: 'single-page'
          }
        },
        required: ['cvData', 'filename']
      },
      execute: async (params: {
        cvData: CVData;
        filename: string;
        optimization?: 'single-page' | 'multi-page' | 'ats-optimized';
      }) => {
        // Analyze CV data first
        const analysis = this.analyzeCVData(params.cvData);
        
        // Choose quality based on optimization
        let quality: 'standard' | 'high' | 'single-page' = 'high';
        if (params.optimization === 'single-page') {
          quality = 'single-page';
        }

        // Generate PDF
        const result = await this.generate({
          cvData: params.cvData,
          filename: params.filename,
          quality: quality
        });

        return {
          ...result,
          analysis
        };
      }
    };
  }

  /**
   * Create batch PDF generation tool
   */
  createBatchPDFTool(): AgentPDFTool {
    return {
      name: 'generate_pdf_batch',
      description: 'Generate multiple PDFs from CV data array',
      parameters: {
        type: 'object',
        properties: {
          cvDataArray: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of CV data objects'
          },
          outputDir: {
            type: 'string',
            description: 'Output directory for generated PDFs'
          },
          quality: {
            type: 'string',
            enum: ['standard', 'high', 'single-page'],
            default: 'high'
          },
          parallelLimit: {
            type: 'number',
            description: 'Maximum number of parallel PDF generations',
            default: 3
          }
        },
        required: ['cvDataArray', 'outputDir']
      },
      execute: async (params: {
        cvDataArray: CVData[];
        outputDir: string;
        quality?: 'standard' | 'high' | 'single-page';
        parallelLimit?: number;
      }) => {
        const results = [];
        const limit = params.parallelLimit || 3;
        
        for (let i = 0; i < params.cvDataArray.length; i += limit) {
          const batch = params.cvDataArray.slice(i, i + limit);
          
          const batchResults = await Promise.all(
            batch.map(async (cvData, index) => {
              const filename = `${params.outputDir}/cv-${i + index + 1}.pdf`;
              return await this.generate({
                cvData,
                filename,
                quality: params.quality
              });
            })
          );
          
          results.push(...batchResults);
        }
        
        return {
          success: true,
          results,
          summary: {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        };
      }
    };
  }

  /**
   * Get all available tools for AI agents
   */
  getAllTools(): AgentPDFTool[] {
    return [
      this.createPDFTool(),
      this.createCVAnalysisTool(),
      this.createBatchPDFTool()
    ];
  }

  /**
   * Prepare Chrome options from agent options
   */
  private async prepareChromeOptions(options: AgentPDFOptions): Promise<ChromePDFOptions> {
    const qualityPresets = {
      standard: {
        virtualTimeBudget: 3000,
        windowSize: '1280,720'
      },
      high: {
        virtualTimeBudget: 8000,
        windowSize: '1920,1080',
        customFlags: ['--enable-javascript']
      },
      'single-page': {
        virtualTimeBudget: 10000,
        windowSize: '1920,1080',
        scale: 0.88,
        customFlags: ['--enable-javascript']
      }
    };

    const preset = qualityPresets[options.quality || 'high'];

    if (options.htmlContent) {
      return {
        htmlContent: options.htmlContent,
        outputPath: options.filename,
        ...preset
      };
    }

    if (options.cvData) {
      const htmlContent = await this.renderCVToHTML(options.cvData, options.template);
      return {
        htmlContent,
        outputPath: options.filename,
        ...preset
      };
    }

    throw new Error('Either cvData or htmlContent must be provided');
  }

  /**
   * Simple CV analysis for agent tools
   */
  private analyzeCVData(cvData: CVData) {
    return {
      hasPersonalInfo: !!cvData.personalInfo,
      experienceCount: cvData.experience?.length || 0,
      educationCount: cvData.education?.length || 0,
      skillsCount: cvData.skills?.length || 0,
      estimatedLength: this.estimateContentLength(cvData),
      recommendations: this.getOptimizationRecommendations(cvData)
    };
  }

  /**
   * Estimate content length for single-page optimization
   */
  private estimateContentLength(cvData: CVData): 'short' | 'medium' | 'long' {
    const experienceCount = cvData.experience?.length || 0;
    const educationCount = cvData.education?.length || 0;
    const skillsCount = cvData.skills?.length || 0;
    
    const totalItems = experienceCount + educationCount + skillsCount;
    
    if (totalItems <= 8) return 'short';
    if (totalItems <= 15) return 'medium';
    return 'long';
  }

  /**
   * Get optimization recommendations
   */
  private getOptimizationRecommendations(cvData: CVData): string[] {
    const recommendations = [];
    const experienceCount = cvData.experience?.length || 0;
    
    if (experienceCount > 8) {
      recommendations.push('Consider using single-page optimization for better readability');
    }
    
    if (!cvData.personalInfo?.contact?.email) {
      recommendations.push('Add contact email for completeness');
    }
    
    return recommendations;
  }

  /**
   * Render CV data to HTML (simplified for agents)
   */
  private async renderCVToHTML(cvData: CVData, template?: string): Promise<string> {
    // Simplified HTML generation for AI agents
    const name = cvData.personalInfo?.name?.full || 'CV';
    const email = cvData.personalInfo?.contact?.email || '';
    const phone = cvData.personalInfo?.contact?.phone || '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${name}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          margin: 0.75in;
          line-height: 1.4;
          color: #2c3e50;
        }
        h1 { color: #2c3e50; margin-bottom: 0.3em; font-size: 1.8em; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.2em; margin-top: 1.5em; }
        .contact { margin-bottom: 1.5em; color: #7f8c8d; }
        .experience-item, .education-item { margin-bottom: 1em; }
        .job-title { font-weight: bold; color: #2c3e50; }
        .company { color: #3498db; }
        .date { color: #7f8c8d; font-style: italic; }
        .skills { display: flex; flex-wrap: wrap; gap: 0.5em; }
        .skill { background: #ecf0f1; padding: 0.2em 0.5em; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>${name}</h1>
      <div class="contact">
        ${email}${phone ? ' | ' + phone : ''}
      </div>
      
      ${cvData.experience && cvData.experience.length > 0 ? `
      <h2>Experience</h2>
      ${cvData.experience.map(exp => `
        <div class="experience-item">
          <div class="job-title">${exp.position || 'Position'}</div>
          <div class="company">${exp.employer || 'Company'}</div>
          <div class="date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          ${exp.responsibilities && exp.responsibilities.length > 0 ? `<div>${exp.responsibilities[0]}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}
      
      ${cvData.education && cvData.education.length > 0 ? `
      <h2>Education</h2>
      ${cvData.education.map(edu => `
        <div class="education-item">
          <div class="job-title">${edu.degree || 'Degree'}</div>
          <div class="company">${edu.institution || 'Institution'}</div>
          <div class="date">${edu.graduationDate || ''}</div>
        </div>
      `).join('')}
      ` : ''}
      
      ${cvData.skills && cvData.skills.length > 0 ? `
      <h2>Skills</h2>
      <div class="skills">
        ${cvData.skills.map(skill => `
          <span class="skill">${typeof skill === 'string' ? skill : skill.name || 'Skill'}</span>
        `).join('')}
      </div>
      ` : ''}
    </body>
    </html>
    `;
  }
}