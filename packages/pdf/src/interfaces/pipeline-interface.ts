import { ChromePDFEngine, ChromePDFOptions, ChromePDFResult } from '../core/chrome-engine.js';
import type { CVData } from '@dzb-cv/types';
import { EventEmitter } from 'events';

export interface PipelinePDFTask {
  id: string;
  cvData: CVData;
  outputPath: string;
  template?: string;
  priority?: number;
}

export interface PipelinePDFOptions {
  /** Maximum number of parallel PDF generations */
  parallelLimit?: number;
  /** Quality preset for all PDFs */
  quality?: 'fast' | 'balanced' | 'high';
  /** Enable progress tracking */
  enableProgress?: boolean;
  /** Retry failed generations */
  retryCount?: number;
  /** Timeout per PDF generation */
  timeoutMs?: number;
}

export interface PipelineProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

export interface PipelineResult {
  success: boolean;
  results: Array<{
    taskId: string;
    success: boolean;
    outputPath?: string;
    error?: string;
    executionTime?: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
  };
}

/**
 * Automated pipeline interface for batch PDF generation
 * Optimized for high-volume, unattended processing
 */
export class PipelinePDFInterface extends EventEmitter {
  private engine: ChromePDFEngine;
  private activeJobs: Map<string, Promise<ChromePDFResult>> = new Map();

  constructor(tempDir?: string) {
    super();
    this.engine = new ChromePDFEngine(tempDir);
  }

  /**
   * Process batch of CV data with progress tracking and error handling
   */
  async processBatch(
    tasks: PipelinePDFTask[],
    options: PipelinePDFOptions = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const {
      parallelLimit = 3,
      quality = 'balanced',
      enableProgress = true,
      retryCount = 2,
      timeoutMs = 30000
    } = options;

    // Sort by priority (higher priority first)
    const sortedTasks = tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    const results: PipelineResult['results'] = [];
    const progress: PipelineProgress = {
      total: tasks.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      startTime
    };

    if (enableProgress) {
      this.emit('started', progress);
    }

    // Process tasks in batches
    for (let i = 0; i < sortedTasks.length; i += parallelLimit) {
      const batch = sortedTasks.slice(i, i + parallelLimit);
      
      progress.inProgress = batch.length;
      if (enableProgress) {
        this.emit('batchStarted', { batchIndex: Math.floor(i / parallelLimit), batch });
      }

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(task => this.processTaskWithRetry(task, quality, retryCount, timeoutMs))
      );

      // Collect results
      batchResults.forEach((result, index) => {
        const task = batch[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          results.push({
            taskId: task?.id || 'unknown',
            success: true,
            outputPath: result.value.outputPath || '',
            executionTime: result.value.executionTime || 0
          });
          progress.completed++;
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error;
            
          results.push({
            taskId: task?.id || 'unknown',
            success: false,
            error: String(error)
          });
          progress.failed++;
        }
      });

      progress.inProgress = 0;
      
      // Update estimated time remaining
      if (enableProgress && progress.completed > 0) {
        const elapsed = Date.now() - startTime;
        const avgTimePerTask = elapsed / progress.completed;
        const remaining = progress.total - progress.completed;
        progress.estimatedTimeRemaining = avgTimePerTask * remaining;
        
        this.emit('progress', progress);
      }
    }

    const totalExecutionTime = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const finalResult: PipelineResult = {
      success: failed === 0,
      results,
      summary: {
        total: tasks.length,
        successful,
        failed,
        totalExecutionTime,
        averageExecutionTime: successful > 0 ? totalExecutionTime / successful : 0
      }
    };

    if (enableProgress) {
      this.emit('completed', finalResult);
    }

    return finalResult;
  }

  /**
   * Process single CV with job analysis integration
   */
  async processWithJobAnalysis(
    cvData: CVData,
    jobData: any,
    outputPath: string,
    options: {
      optimizeForJob?: boolean;
      includeAnalysis?: boolean;
    } = {}
  ): Promise<ChromePDFResult & { analysis?: any }> {
    let analysis;
    
    if (options.includeAnalysis) {
      analysis = this.analyzeCVForJob(cvData, jobData);
    }

    // Optimize CV for job if requested
    const optimizedCVData = options.optimizeForJob 
      ? this.optimizeCVForJob(cvData, jobData, analysis)
      : cvData;

    const html = await this.generateOptimizedHTML(optimizedCVData, jobData);
    
    const result = await this.engine.generatePDF({
      htmlContent: html,
      outputPath,
      virtualTimeBudget: 8000,
      windowSize: '1920,1080',
      scale: 0.88
    });

    return {
      ...result,
      ...(analysis && { analysis })
    };
  }

  /**
   * Create automated workflow for job applications
   */
  async createJobApplicationWorkflow(
    cvData: CVData,
    jobPostings: Array<{ id: string; data: any; outputDir: string }>,
    options: PipelinePDFOptions = {}
  ): Promise<PipelineResult> {
    const tasks: PipelinePDFTask[] = jobPostings.map(job => ({
      id: `job-${job.id}`,
      cvData,
      outputPath: `${job.outputDir}/cv-optimized.pdf`,
      template: 'job-optimized',
      priority: this.calculateJobPriority(job.data)
    }));

    return this.processBatch(tasks, {
      ...options,
      quality: 'high', // Always use high quality for job applications
      enableProgress: true
    });
  }

  /**
   * Process task with retry logic
   */
  private async processTaskWithRetry(
    task: PipelinePDFTask,
    quality: string,
    retryCount: number,
    timeoutMs: number
  ): Promise<ChromePDFResult> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const html = await this.renderCVToHTML(task.cvData, task.template);
        const qualitySettings = this.getQualitySettings(quality);

        const result = await this.engine.generatePDF({
          htmlContent: html,
          outputPath: task.outputPath,
          timeout: timeoutMs,
          ...qualitySettings
        });

        if (result.success) {
          return result;
        }

        lastError = result.error;
        
        // Wait before retry (exponential backoff)
        if (attempt < retryCount) {
          await this.delay(1000 * Math.pow(2, attempt));
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        
        if (attempt < retryCount) {
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${retryCount + 1} attempts. Last error: ${lastError}`
    };
  }

  /**
   * Get quality settings for pipeline presets
   */
  private getQualitySettings(quality: string): Partial<ChromePDFOptions> {
    switch (quality) {
      case 'fast':
        return {
          virtualTimeBudget: 3000,
          windowSize: '1280,720'
        };
      case 'balanced':
        return {
          virtualTimeBudget: 5000,
          windowSize: '1920,1080',
          scale: 0.88
        };
      case 'high':
        return {
          virtualTimeBudget: 10000,
          windowSize: '1920,1080',
          scale: 0.88,
          customFlags: ['--enable-javascript']
        };
      default:
        return this.getQualitySettings('balanced');
    }
  }

  /**
   * Analyze CV for job compatibility
   */
  private analyzeCVForJob(cvData: CVData, jobData: any) {
    return {
      matchScore: this.calculateMatchScore(cvData, jobData),
      keywordMatches: this.findKeywordMatches(cvData, jobData),
      recommendations: this.getOptimizationRecommendations(cvData, jobData)
    };
  }

  /**
   * Optimize CV for specific job
   */
  private optimizeCVForJob(cvData: CVData, jobData: any, analysis?: any): CVData {
    // This would implement job-specific optimization logic
    // For now, return the original data
    return cvData;
  }

  /**
   * Generate optimized HTML for job applications
   */
  private async generateOptimizedHTML(cvData: CVData, jobData?: any): Promise<string> {
    // Enhanced HTML generation with job optimization
    const name = cvData.personalInfo?.name?.full || 'CV';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${name} - CV</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          margin: 0.5in;
          line-height: 1.3;
          color: #2c3e50;
          font-size: 11pt;
        }
        h1 { 
          color: #2c3e50; 
          margin-bottom: 0.2em; 
          font-size: 1.6em;
          font-weight: 600;
        }
        h2 { 
          color: #34495e; 
          border-bottom: 1px solid #3498db; 
          padding-bottom: 0.1em; 
          margin-top: 1.2em;
          font-size: 1.1em;
        }
        .contact { 
          margin-bottom: 1.2em; 
          color: #7f8c8d;
          font-size: 0.95em;
        }
        .section { margin-bottom: 1em; }
        .item { margin-bottom: 0.8em; }
        .title { font-weight: 600; color: #2c3e50; }
        .company { color: #3498db; font-weight: 500; }
        .date { color: #7f8c8d; font-style: italic; font-size: 0.9em; }
        .description { margin-top: 0.3em; line-height: 1.2; }
      </style>
    </head>
    <body>
      <h1>${name}</h1>
      <div class="contact">
        ${cvData.personalInfo?.contact?.email || ''}
        ${cvData.personalInfo?.contact?.phone ? ' | ' + cvData.personalInfo.contact.phone : ''}
      </div>
      
      ${this.renderExperienceSection(cvData.experience)}
      ${this.renderEducationSection(cvData.education)}
      ${this.renderSkillsSection(cvData.skills)}
    </body>
    </html>
    `;
  }

  /**
   * Render CV to HTML (pipeline optimized)
   */
  private async renderCVToHTML(cvData: CVData, template?: string): Promise<string> {
    return this.generateOptimizedHTML(cvData);
  }

  /**
   * Render experience section
   */
  private renderExperienceSection(experience?: any[]): string {
    if (!experience || experience.length === 0) return '';
    
    return `
    <div class="section">
      <h2>Experience</h2>
      ${experience.map(exp => `
        <div class="item">
          <div class="title">${exp.position || 'Position'}</div>
          <div class="company">${exp.company || 'Company'}</div>
          <div class="date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
    `;
  }

  /**
   * Render education section
   */
  private renderEducationSection(education?: any[]): string {
    if (!education || education.length === 0) return '';
    
    return `
    <div class="section">
      <h2>Education</h2>
      ${education.map(edu => `
        <div class="item">
          <div class="title">${edu.degree || 'Degree'}</div>
          <div class="company">${edu.institution || 'Institution'}</div>
          <div class="date">${edu.graduationDate || ''}</div>
        </div>
      `).join('')}
    </div>
    `;
  }

  /**
   * Render skills section
   */
  private renderSkillsSection(skills?: any[]): string {
    if (!skills || skills.length === 0) return '';
    
    return `
    <div class="section">
      <h2>Skills</h2>
      <div>${skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || 'Skill'
      ).join(' • ')}</div>
    </div>
    `;
  }

  /**
   * Calculate job priority for task ordering
   */
  private calculateJobPriority(jobData: any): number {
    // Simple priority calculation - could be enhanced
    let priority = 0;
    
    if (jobData.salary && jobData.salary > 100000) priority += 2;
    if (jobData.remote) priority += 1;
    if (jobData.urgency === 'high') priority += 3;
    
    return priority;
  }

  /**
   * Calculate match score between CV and job
   */
  private calculateMatchScore(cvData: CVData, jobData: any): number {
    // Simplified match scoring
    return Math.random() * 100; // Placeholder
  }

  /**
   * Find keyword matches
   */
  private findKeywordMatches(cvData: CVData, jobData: any): string[] {
    // Simplified keyword matching
    return []; // Placeholder
  }

  /**
   * Get optimization recommendations
   */
  private getOptimizationRecommendations(cvData: CVData, jobData: any): string[] {
    // Simplified recommendations
    return []; // Placeholder
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}