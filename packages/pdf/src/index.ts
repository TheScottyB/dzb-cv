// Core Chrome PDF Engine
export { ChromePDFEngine, type ChromePDFOptions, type ChromePDFResult } from './core/chrome-engine.js';
export { ChromeDetector } from './core/chrome-detector.js';

// Interfaces for different use cases
export { CLIPDFInterface, type CLIPDFOptions } from './interfaces/cli-interface.js';
export { AgentPDFInterface, type AgentPDFTool, type AgentPDFOptions } from './interfaces/agent-interface.js';
export { ScriptPDFInterface, type ScriptPDFOptions } from './interfaces/script-interface.js';
export { 
  PipelinePDFInterface, 
  type PipelinePDFTask, 
  type PipelinePDFOptions, 
  type PipelineProgress,
  type PipelineResult 
} from './interfaces/pipeline-interface.js';

// Import for local use
import { ChromeDetector } from './core/chrome-detector.js';
import { CLIPDFInterface, type CLIPDFOptions } from './interfaces/cli-interface.js';
import { AgentPDFInterface, type AgentPDFOptions } from './interfaces/agent-interface.js';
import { ScriptPDFInterface, type ScriptPDFOptions } from './interfaces/script-interface.js';
import { 
  PipelinePDFInterface, 
  type PipelinePDFTask, 
  type PipelinePDFOptions 
} from './interfaces/pipeline-interface.js';

// Legacy exports for backwards compatibility
export * from './generators/index.js';
export * from './templates/index.js';

/**
 * Create PDF interface for specific use case
 */
export function createPDFInterface(type: 'cli'): CLIPDFInterface;
export function createPDFInterface(type: 'agent'): AgentPDFInterface;
export function createPDFInterface(type: 'script'): ScriptPDFInterface;
export function createPDFInterface(type: 'pipeline'): PipelinePDFInterface;
export function createPDFInterface(type: 'cli' | 'agent' | 'script' | 'pipeline', tempDir?: string) {
  switch (type) {
    case 'cli':
      return new CLIPDFInterface(tempDir);
    case 'agent':
      return new AgentPDFInterface(tempDir);
    case 'script':
      return new ScriptPDFInterface();
    case 'pipeline':
      return new PipelinePDFInterface(tempDir);
    default:
      throw new Error(`Unknown PDF interface type: ${type}`);
  }
}

/**
 * Quick PDF generation functions for each use case
 */
export const pdf = {
  /**
   * CLI-style PDF generation with debugging
   */
  async cli(options: {
    input: string;
    output: string;
    debug?: boolean;
    quality?: 'single-page' | 'high-quality';
  }) {
    const pdfInterface = new CLIPDFInterface();
    
    if (options.quality === 'single-page') {
      return pdfInterface.generateSinglePage({
        input: options.input,
        outputPath: options.output,
        debug: options.debug ?? false
      });
    } else if (options.quality === 'high-quality') {
      return pdfInterface.generateHighQuality({
        input: options.input,
        outputPath: options.output,
        debug: options.debug ?? false
      });
    } else {
      return pdfInterface.generate({
        input: options.input,
        outputPath: options.output,
        debug: options.debug ?? false
      });
    }
  },

  /**
   * Agent-style PDF generation
   */
  async agent(options: AgentPDFOptions) {
    const pdfInterface = new AgentPDFInterface();
    return pdfInterface.generate(options);
  },

  /**
   * Script-style PDF generation
   */
  async script(options: ScriptPDFOptions) {
    const pdfInterface = new ScriptPDFInterface();
    return pdfInterface.generateCV(options);
  },

  /**
   * Pipeline-style batch PDF generation
   */
  async pipeline(tasks: PipelinePDFTask[], options?: PipelinePDFOptions) {
    const pdfInterface = new PipelinePDFInterface();
    return pdfInterface.processBatch(tasks, options);
  }
};

/**
 * Utilities
 */
export const utils = {
  /**
   * Check if Chrome is available
   */
  async checkChrome() {
    try {
      const chromePath = ChromeDetector.detectChromePath();
      const version = ChromeDetector.getChromeVersion(chromePath);
      return {
        available: true,
        path: chromePath,
        version
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Generate shell script for end users
   */
  generateShellScript(scriptPath: string, options?: {
    defaultProfile?: string;
    defaultOutput?: string;
    template?: string;
  }) {
    const pdfInterface = new ScriptPDFInterface();
    return pdfInterface.generateShellScript(scriptPath, options);
  },

  /**
   * Generate Windows batch script for end users
   */
  generateBatchScript(scriptPath: string, options?: {
    defaultProfile?: string;
    defaultOutput?: string;
  }) {
    const pdfInterface = new ScriptPDFInterface();
    return pdfInterface.generateBatchScript(scriptPath, options);
  },

  /**
   * Create example profile for scripts
   */
  createExampleProfile(profilePath: string) {
    const pdfInterface = new ScriptPDFInterface();
    return pdfInterface.createExampleProfile(profilePath);
  }
};
