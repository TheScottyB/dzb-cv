/**
 * Base Command Class
 * 
 * Provides common functionality and types for all CLI commands.
 * Command modules should extend this base class for consistency
 * and to benefit from shared utilities.
 */

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';

// Import shared types
import { 
  RunConfiguration, 
  VerifiedClaim, 
  SectorType
} from '../../shared/types/index.js';

export type { RunConfiguration, VerifiedClaim, SectorType };

/**
 * Base command class that provides common functionality
 */
export abstract class BaseCommand {
  protected program!: Command;
  protected name: string;
  protected description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Helper method to validate the sector type
   * 
   * @param sector The sector to validate
   * @returns The validated sector or default
   */
  protected validateSector(sector: string): SectorType {
    const validSectors: SectorType[] = ['federal', 'state', 'private'];
    
    if (!validSectors.includes(sector as SectorType)) {
      this.logWarning(`Invalid sector "${sector}", defaulting to "private"`);
      return 'private';
    }
    return sector as SectorType;
  }

  /**
   * Configure the command - to be implemented by subclasses
   */
  protected abstract configure(): void;

  /**
   * Register the command with the program
   */
  register(program: Command): void {
    this.program = program;
    this.configure();
  }

  /**
   * Helper method to log success messages
   * 
   * @param message The success message to log
   */
  protected logSuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Helper method to log info messages
   * 
   * @param message The info message to log
   */
  protected logInfo(message: string): void {
    console.log(chalk.blue(`ℹ️ ${message}`));
  }

  /**
   * Helper method to log warning messages
   * 
   * @param message The warning message to log
   */
  protected logWarning(message: string): void {
    console.log(chalk.yellow(`⚠️ ${message}`));
  }

  /**
   * Helper method to log error messages
   * 
   * @param error The error to log
   * @param exit Whether to exit the process with error code
   */
  protected logError(error: unknown, exit: boolean = false): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`❌ Error: ${errorMessage}`));
    
    if (exit) {
      process.exit(1);
    }
  }

  /**
   * Helper method to create a directory if it doesn't exist
   * 
   * @param dirPath The directory path to create
   */
  protected async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      this.logError(`Failed to create directory: ${dirPath}`, false);
      throw error;
    }
  }

  /**
   * Helper method to resolve paths relative to the command file
   * 
   * @param relativePath The relative path to resolve
   * @returns The absolute path
   */
  protected resolvePath(...relativePath: string[]): string {
    // First attempt to resolve from project root
    const projectPath = path.resolve(process.cwd(), ...relativePath);
    return projectPath;
  }

  /**
   * Helper method to read JSON files
   * 
   * @param filePath The path to the JSON file
   * @returns The parsed JSON content
   */
  protected async readJsonFile<T>(filePath: string): Promise<T> {
    try {
      // Check if file exists first
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      
      try {
        return JSON.parse(content) as T;
      } catch (parseError) {
        throw new Error(`Invalid JSON format in file: ${filePath}`);
      }
    } catch (error) {
      this.logError(`Failed to read JSON file: ${filePath}`, false);
      throw error;
    }
  }

  /**
   * Helper method to write JSON files
   * 
   * @param filePath The path to write the JSON file
   * @param data The data to write
   */
  protected async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      this.logError(`Failed to write JSON file: ${filePath}`, false);
      throw error;
    }
  }

  /**
   * Helper to record a complete run configuration for documentation
   * 
   * @param config The run configuration to record
   * @param outputPath Optional output path for the configuration
   */
  protected async recordRunConfiguration(
    config: RunConfiguration,
    outputPath?: string
  ): Promise<void> {
    try {
      // Add timestamp to configuration
      const configWithTimestamp = {
        ...config,
        timestamp: new Date().toISOString(),
      };

      if (outputPath) {
        try {
          await this.ensureDirectory(path.dirname(outputPath));
          await this.writeJsonFile(outputPath, configWithTimestamp);
          this.logSuccess(`Run configuration saved to ${outputPath}`);
        } catch (saveError) {
          this.logWarning(`Could not save run configuration to ${outputPath}: ${saveError}`);
          
          // Try saving to default location as fallback
          const fallbackPath = path.join('output', 'run-configs', `run-config-${Date.now()}.json`);
          await this.ensureDirectory(path.dirname(fallbackPath));
          await this.writeJsonFile(fallbackPath, configWithTimestamp);
          this.logInfo(`Run configuration saved to fallback location: ${fallbackPath}`);
        }
      }

      // Log configuration summary
      this.logInfo('Run configuration recorded with:');
      if (config.jobPosting) this.logInfo(`- Job posting: ${config.jobPosting.url}`);
      if (config.verification?.claims.length) this.logInfo(`- ${config.verification.claims.length} verified claims`);
      if (config.outputs?.cv) this.logInfo(`- Generated CV: ${config.outputs.cv}`);
      if (config.outputs?.coverLetter) this.logInfo(`- Generated cover letter: ${config.outputs.coverLetter}`);
    } catch (error) {
      this.logError(`Failed to record run configuration: ${error}`, false);
    }
  }

  /**
   * Helper method to prompt for confirmation
   * 
   * @param message The confirmation message to display
   * @returns True if confirmed, false otherwise
   */
  protected async promptForConfirmation(message: string): Promise<boolean> {
    // Since we're not implementing interactive prompts in this example,
    // we'll default to true, but in a real implementation this would use inquirer
    console.log(`${message} (Y/n)`);
    return Promise.resolve(true);
  }
}

