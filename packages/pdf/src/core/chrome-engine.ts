import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve, isAbsolute } from 'path';
import { ChromeDetector } from './chrome-detector.js';

export interface ChromePDFOptions {
  /** Output PDF file path */
  outputPath: string;
  /** Input HTML file path or content */
  htmlPath?: string;
  htmlContent?: string;
  /** Browser window size (default: "1920,1080") */
  windowSize?: string;
  /** Virtual time budget in milliseconds (default: 5000) */
  virtualTimeBudget?: number;
  /** Include print margins (default: false for no-header) */
  printMargins?: boolean;
  /** Device scale factor (default: 1.0, 0.88 for single-page optimization) */
  scale?: number;
  /** Paper size format */
  paperSize?: 'Letter' | 'A4' | 'Legal' | 'Tabloid';
  /** Additional Chrome flags */
  customFlags?: string[];
  /** Timeout for PDF generation in milliseconds (default: 30000) */
  timeout?: number;
}

export interface ChromePDFResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  chromeVersion?: string;
  executionTime?: number;
}

/**
 * High-quality PDF generation using Chrome CLI
 * Provides the best print-to-PDF output with direct Chrome control
 */
export class ChromePDFEngine {
  private readonly chromePath: string;
  private readonly tempDir: string;

  constructor(tempDir = '/tmp/dzb-cv-pdf') {
    this.chromePath = ChromeDetector.detectChromePath();
    this.tempDir = tempDir;
    this.ensureTempDir();
  }

  /**
   * Generate PDF using Chrome CLI with optimal flags
   */
  async generatePDF(options: ChromePDFOptions): Promise<ChromePDFResult> {
    const startTime = Date.now();
    
    try {
      // Prepare HTML file
      const htmlPath = await this.prepareHtmlFile(options);
      
      // Build Chrome command
      const command = this.buildChromeCommand({
        ...options,
        htmlPath
      });

      // Execute Chrome command
      await this.executeCommand(command, options.timeout || 30000);

      // Verify output file exists
      if (!existsSync(options.outputPath)) {
        throw new Error(`PDF generation failed: Output file not created at ${options.outputPath}`);
      }

      return {
        success: true,
        outputPath: options.outputPath,
        chromeVersion: ChromeDetector.getChromeVersion(this.chromePath),
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        chromeVersion: ChromeDetector.getChromeVersion(this.chromePath),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Build optimized Chrome command for PDF generation
   */
  private buildChromeCommand(options: ChromePDFOptions & { htmlPath: string }): string[] {
    const args = [
      // Core flags for headless PDF generation
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      
      // PDF output configuration
      `--print-to-pdf=${options.outputPath}`,
      
      // Quality and layout optimization
      `--virtual-time-budget=${options.virtualTimeBudget || 5000}`,
      `--window-size=${options.windowSize || '1920,1080'}`,
      
      // Scale factor for single-page optimization
      ...(options.scale ? [`--force-device-scale-factor=${options.scale}`] : []),
      
      // Paper size
      ...(options.paperSize ? [`--print-to-pdf-paper-size=${options.paperSize}`] : []),
      
      // Headers/margins
      ...(options.printMargins ? [] : ['--print-to-pdf-no-header']),
      
      // Security and performance
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images', // Skip image loading for faster processing
      '--disable-javascript', // Optional: disable JS if not needed
      
      // Custom flags
      ...(options.customFlags || []),
      
      // Input HTML file (must be last)
      this.formatHtmlPath(options.htmlPath)
    ];

    return [this.chromePath, ...args];
  }

  /**
   * Execute Chrome command with timeout and error handling
   */
  private executeCommand(command: string[], timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const [executable, ...args] = command;
      
      const chromeProcess: ChildProcess = spawn(executable!, args, {
        stdio: 'pipe',
        detached: false
      });

      let stdout = '';
      let stderr = '';

      chromeProcess.stdout?.on('data', (data: any) => {
        stdout += data.toString();
      });

      chromeProcess.stderr?.on('data', (data: any) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        chromeProcess.kill('SIGKILL');
        reject(new Error(`Chrome PDF generation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      chromeProcess.on('close', (code: number | null) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(
            `Chrome process exited with code ${code}. ` +
            `stderr: ${stderr.trim()} stdout: ${stdout.trim()}`
          ));
        }
      });

      chromeProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start Chrome process: ${error.message}`));
      });
    });
  }

  /**
   * Prepare HTML file from content or path
   */
  private async prepareHtmlFile(options: ChromePDFOptions): Promise<string> {
    if (options.htmlPath) {
      // Use existing HTML file
      if (!existsSync(options.htmlPath)) {
        throw new Error(`HTML file not found: ${options.htmlPath}`);
      }
      return resolve(options.htmlPath);
    }

    if (options.htmlContent) {
      // Create temporary HTML file
      const tempHtmlPath = `${this.tempDir}/temp-${Date.now()}.html`;
      writeFileSync(tempHtmlPath, options.htmlContent, 'utf8');
      return tempHtmlPath;
    }

    throw new Error('Either htmlPath or htmlContent must be provided');
  }

  /**
   * Format HTML path for Chrome (file:// protocol)
   */
  private formatHtmlPath(htmlPath: string): string {
    const absolutePath = isAbsolute(htmlPath) ? htmlPath : resolve(htmlPath);
    return `file://${absolutePath}`;
  }

  /**
   * Ensure temp directory exists
   */
  private ensureTempDir(): void {
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Get Chrome version and path info
   */
  getInfo(): { chromePath: string; version: string } {
    return {
      chromePath: this.chromePath,
      version: ChromeDetector.getChromeVersion(this.chromePath)
    };
  }
}