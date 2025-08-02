/**
 * Generate CV Command
 *
 * Handles generating CVs for different sectors (federal, state, private)
 * using templates and structured CV data.
 */

import path from 'path';
import { BaseCommand, RunConfiguration } from './base-command';
import { generateCV } from '../../tools/generator';
import { generateAICV, generateAICVForJob } from '../../shared/tools/ai-generator';
import type { CVData, CVGenerationOptions } from '../../shared/types/cv-types';
import { transformCVData } from '../../shared/utils/data-transformer';

/**
 * Options for the generate CV command
 */
interface GenerateCvCommandOptions {
  format: string;
  output: string;
  filename?: string;
  aiOptimize?: boolean;
  style?: 'professional' | 'academic' | 'technical' | 'executive';
  jobDescription?: string;
  jobUrl?: string;
  targetSector?: 'federal' | 'healthcare' | 'tech' | 'private';
  disableCuration?: boolean;
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
      .option('-o, --output <path>', 'Output directory for the generated CV', 'generated/cvs')
      .option('--filename <name>', 'Base filename for the generated CV')
      .option('--ai-optimize', 'Use AI to optimize CV for single-page layout', false)
      .option('--style <style>', 'AI optimization style (professional, academic, technical, executive)', 'professional')
      .option('--job-description <text>', 'Job description text for intelligent content curation')
      .option('--job-url <url>', 'Job posting URL for intelligent content curation')
      .option('--target-sector <sector>', 'Target sector for optimization (overrides detected sector)')
      .option('--disable-curation', 'Disable intelligent content curation for AI optimization', false)
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
const resolvedOutputPath = path.resolve(outputPath);
this.logInfo(`Using output directory: ${resolvedOutputPath}`);

      // Prepare CV generation options
      const cvOptions: Partial<CVGenerationOptions> = {
        format: options.format === 'pdf' ? 'pdf' : 'markdown',
        ...(options.filename ? { filename: options.filename } : {}),
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
        this.logError(
          `Failed to transform CV data: ${error instanceof Error ? error.message : String(error)}`,
          true
        );
        return;
      }

      // Check if AI optimization is requested
      if (options.aiOptimize) {
        this.logInfo(`AI-optimizing ${validSector} CV...`);
        const aiOptions = {
          name: cvData.personalInfo.name.full,
          email: cvData.personalInfo.contact.email,
          output: path.join(outputPath, `${cvData.personalInfo.name.last}-ai-cv.pdf`),
          style: options.style || 'professional',
          targetSector: options.targetSector || validSector,
          useIntelligentCuration: !options.disableCuration
        };
        
        // Use job-targeted generation if job info is provided
        const aiResult = (options.jobDescription || options.jobUrl) 
          ? await generateAICVForJob(aiOptions, options.jobDescription, options.jobUrl)
          : await generateAICV(aiOptions);
        if (aiResult.success) {
          this.logSuccess(`AI-optimized CV generated successfully: ${aiResult.filePath}`);
        } else {
          this.logError(`AI optimization failed: ${aiResult.error}`, true);
          return;
        }
        
        return; // Skip traditional generation if AI optimization is used
      }

      // Generate the CV
      const generatedPath = await generateCV(validSector, cvData, outputPath, cvOptions);
      this.logSuccess(`CV generated successfully: ${generatedPath}`);

      // Record the operation in the run configuration
      const runConfig: RunConfiguration = {
        outputs: {
          cv: generatedPath,
          format: options.format,
        },
      };

      // Save the run configuration for documentation
      await this.recordRunConfiguration(
        runConfig,
        path.join(
          outputPath,
          `${cvData.personalInfo.name.full.toLowerCase().replace(/\s+/g, '-')}-run-config.json`
        )
      );
    } catch (error) {
      this.logError(
        `Error generating CV: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }
}
