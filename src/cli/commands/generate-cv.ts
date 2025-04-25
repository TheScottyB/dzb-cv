/**
 * Generate CV Command
 * 
 * Handles generating CVs for different sectors (federal, state, private)
 * using templates and structured CV data.
 */

import path from 'path';
import { BaseCommand, RunConfiguration } from './base-command.js';
import { generateCV } from '../../shared/tools/generator.js';
import type { CVData, CVGenerationOptions } from '../../shared/types/cv-types.js';
import { transformCVData } from '../../shared/utils/data-transformer.js';

/**
 * Options for the generate CV command
 */
interface GenerateCvCommandOptions {
  format: string;
  output: string;
  filename?: string;
}

/**
 * Command to generate a CV for a specific sector
 */
export class GenerateCvCommand extends BaseCommand {
  constructor() {
    super('generate', 'Generate a CV for a specific sector');
  }

  /**
   * Configure the command
   */
  configure(): void {
    this.program
      .name(this.name)
      .description(this.description)
      .argument('<sector>', 'The sector to generate for (federal, state, private)')
      .option('-f, --format <format>', 'Output format: markdown or pdf', 'pdf')
      .option('-o, --output <path>', 'Output directory for the generated CV', 'output')
      .option('--filename <name>', 'Base filename for the generated CV')
      .action(this.execute.bind(this));
  }

  /**
   * Execute the generate CV command
   * @param sector The sector to generate for
   * @param options Command options
   */
  async execute(sector: string, options: GenerateCvCommandOptions): Promise<void> {
    try {
      // Validate sector and handle errors
      const validSector = this.validateSector(sector);
      
      this.logInfo(`Generating ${validSector} CV...`);
      
      // Prepare output path
      const outputPath = path.join(options.output, validSector);
      await this.ensureDirectory(outputPath);
      
      // Prepare CV generation options
      const cvOptions: Partial<CVGenerationOptions> = {
        format: options.format === 'pdf' ? 'pdf' : 'markdown',
        ...(options.filename ? { filename: options.filename } : {})
      };
      // Load CV data
      const baseDataPath = this.resolvePath('src', 'shared', 'data', 'base-info.json');
      let cvData: CVData;
      
      try {
        cvData = await this.readJsonFile<CVData>(baseDataPath);
      } catch (error) {
        this.logError('Failed to load CV data. Please ensure base-info.json exists.', true);
        return; // This return is only reached if logError doesn't exit
      }
      
      // Transform CV data for template compatibility
      try {
        this.logInfo('Transforming CV data structure...');
        cvData = transformCVData(cvData);
        this.logInfo('Data transformation successful');
      } catch (error) {
        this.logError(`Failed to transform CV data: ${error instanceof Error ? error.message : String(error)}`, true);
        return;
      }
      
      // Generate the CV
      const generatedPath = await generateCV(validSector, cvData, outputPath, cvOptions);
      this.logSuccess(`CV generated successfully: ${generatedPath}`);
      
      // Record the operation in the run configuration
      const runConfig: RunConfiguration = {
        outputs: {
          cv: generatedPath,
          format: options.format
        }
      };
      
      // Save the run configuration for documentation
      await this.recordRunConfiguration(
        runConfig, 
        path.join(outputPath, `${cvData.personalInfo.name.full.toLowerCase().replace(/\s+/g, '-')}-run-config.json`)
      );
      
    } catch (error) {
      this.logError(`Error generating CV: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  }
}

