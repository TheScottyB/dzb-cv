import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Cross-platform Chrome/Chromium detection utility
 */
export class ChromeDetector {
  private static cachedPath: string | null = null;

  /**
   * Detect Chrome executable path across platforms
   */
  static detectChromePath(): string {
    if (this.cachedPath) {
      return this.cachedPath;
    }

    const platform = process.platform;
    let chromePaths: string[] = [];

    switch (platform) {
      case 'darwin': // macOS
        chromePaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
        ];
        break;

      case 'win32': // Windows
        chromePaths = [
          join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
          join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
          join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
          join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Chromium\\Application\\chromium.exe')
        ];
        break;

      case 'linux': // Linux
        chromePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          '/snap/bin/chromium',
          '/usr/bin/google-chrome-unstable'
        ];
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Try to find an executable Chrome
    for (const chromePath of chromePaths) {
      if (this.isExecutable(chromePath)) {
        this.cachedPath = chromePath;
        return chromePath;
      }
    }

    // Try to find Chrome via PATH (for package managers, etc.)
    try {
      const chromeInPath = this.findChromeInPath();
      if (chromeInPath) {
        this.cachedPath = chromeInPath;
        return chromeInPath;
      }
    } catch (error) {
      // PATH search failed, continue to error
    }

    throw new Error(
      `Chrome/Chromium not found. Please install Google Chrome or Chromium.\\n` +
      `Searched paths: ${chromePaths.join(', ')}`
    );
  }

  /**
   * Check if a file exists and is executable
   */
  private static isExecutable(filePath: string): boolean {
    try {
      return existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Try to find Chrome in system PATH
   */
  private static findChromeInPath(): string | null {
    const commands = ['google-chrome', 'chromium', 'chromium-browser', 'chrome'];
    
    for (const cmd of commands) {
      try {
        const result = execSync(`which ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
        const path = result.trim();
        if (path && this.isExecutable(path)) {
          return path;
        }
      } catch {
        // Command not found, try next
        continue;
      }
    }
    
    return null;
  }

  /**
   * Get Chrome version for debugging
   */
  static getChromeVersion(chromePath?: string): string {
    const chrome = chromePath || this.detectChromePath();
    
    try {
      const result = execSync(`"${chrome}" --version`, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 5000 
      });
      return result.trim();
    } catch (error) {
      return 'Unknown version';
    }
  }

  /**
   * Reset cached path (for testing)
   */
  static resetCache(): void {
    this.cachedPath = null;
  }
}