import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, isAbsolute } from 'path';

export interface SimplePDFOptions {
  /** HTML content to convert */
  html: string;
  /** Output PDF file path */
  outputPath: string;
  /** Enable single-page optimization */
  singlePage?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

export interface SimplePDFResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  executionTime?: number;
}

/**
 * Simplified Chrome PDF generator for testing
 */
export class SimpleChromePDF {
  private chromePath: string;

  constructor() {
    this.chromePath = this.detectChrome();
  }

  /**
   * Generate PDF from HTML
   */
  async generatePDF(options: SimplePDFOptions): Promise<SimplePDFResult> {
    const startTime = Date.now();

    try {
      if (options.debug) {
        console.log('🚀 Starting Chrome PDF generation...');
        console.log('Chrome path:', this.chromePath);
      }

      // Write HTML to temp file
      const tempHtmlPath = '/tmp/dzb-cv-temp.html';
      writeFileSync(tempHtmlPath, options.html);

      // Build Chrome command
      const args = [
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--print-to-pdf=${options.outputPath}`,
        '--print-to-pdf-no-header',
        '--virtual-time-budget=5000',
        '--window-size=1920,1080',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];

      if (options.singlePage) {
        args.push('--force-device-scale-factor=0.88');
      }

      args.push(`file://${tempHtmlPath}`);

      if (options.debug) {
        console.log('Chrome command:', this.chromePath, args.join(' '));
      }

      // Execute Chrome
      await this.executeChrome(args, options.debug);

      // Check if PDF was created
      if (!existsSync(options.outputPath)) {
        throw new Error('PDF file was not created');
      }

      return {
        success: true,
        outputPath: options.outputPath,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Detect Chrome installation
   */
  private detectChrome(): string {
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium'
    ];

    for (const path of chromePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error('Chrome or Chromium not found');
  }

  /**
   * Execute Chrome command
   */
  private executeChrome(args: string[], debug?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const process: ChildProcess = spawn(this.chromePath, args, {
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data: any) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data: any) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Chrome PDF generation timed out'));
      }, 15000);

      process.on('close', (code: number | null) => {
        clearTimeout(timeout);

        if (code === 0) {
          if (debug) {
            console.log('✅ Chrome PDF generation completed');
          }
          resolve();
        } else {
          if (debug) {
            console.log(`❌ Chrome exited with code ${code}`);
            if (stderr) console.log('stderr:', stderr);
          }
          reject(new Error(`Chrome process failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start Chrome: ${error.message}`));
      });
    });
  }

  /**
   * Get Chrome info
   */
  getInfo(): { chromePath: string; available: boolean } {
    return {
      chromePath: this.chromePath,
      available: existsSync(this.chromePath)
    };
  }
}