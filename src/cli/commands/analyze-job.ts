/**
 * Analyze Job Command
 *
 * Handles analyzing job postings from URLs or files to extract structured
 * information that can be used for CV tailoring and job matching.
 */

import path from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { BaseCommand, RunConfiguration } from './base-command.js';
import { analyzeJobPosting } from '../../tools/job-analyzer.js';

// Define local interfaces for types we need
interface JobPostingAnalysis {
  title: string;
  company: string;
  location?: string | undefined;
  description?: string | undefined;
  jobType?: string | undefined;
  experienceLevel?: string | undefined;
  responsibilities: string[];
  qualifications: string[];
  keyTerms: string[];
  educationRequirements?: string[] | undefined;
  salaryRange?:
    | {
        min?: number | undefined;
        max?: number | undefined;
        period?: string | undefined;
      }
    | undefined;
  source: {
    url: string;
    site: string;
    fetchDate: Date;
  };
}

/**
 * Options for the analyze job command
 */
interface AnalyzeJobCommandOptions {
  output?: string;
  format?: string;
  file?: boolean;
  forceGeneric?: boolean;
  noRateLimit?: boolean;
  saveRawContent?: boolean;
}

/**
 * Command to analyze job postings
 */
export class AnalyzeJobCommand extends BaseCommand {
  constructor() {
    super('analyze', 'Analyze a job posting from URL or file');
  }

  /**
   * Configure the command
   */
  configure(): void {
    this.program
      .command('analyze')
      .description(this.description)
      .argument(
        '<source>',
        'URL of the job posting or path to a file containing the job description'
      )
      .option('-o, --output <path>', 'Path to save the analysis output')
      .option('-f, --format <format>', 'Output format (json, text, markdown)', 'text')
      .option('--file', 'Treat the source as a local file path instead of URL', false)
      .option('--force-generic', 'Force using the generic parser for any site', false)
      .option('--no-rate-limit', 'Disable rate limiting (use with caution)', false)
      .option('--save-raw-content', 'Save raw content from URL analysis', false)
      .action(async (source: string, options: AnalyzeJobCommandOptions) => {
        await this.execute(source, options);
      });
  }

  /**
   * Extract key terms from text for CV tailoring
   * @param text The text to analyze
   * @returns Array of key terms
   */
  private extractKeyTerms(text: string): string[] {
    // Simple implementation - extract capitalized words and phrases
    const words = text.split(/\s+/);
    const keyTerms = new Set<string>();

    for (let i = 0; i < words.length; i++) {
      const word = words[i]?.replace(/[.,!?;:()]/g, '') ?? '';
      if (word.length > 3 && word.charAt(0) === word.charAt(0).toUpperCase()) {
        keyTerms.add(word);
      }
    }

    return Array.from(keyTerms);
  }

  /**
   * Execute the analyze job command
   * @param source URL or file path with job information
   * @param options Command options
   */
  async execute(source: string, options: AnalyzeJobCommandOptions): Promise<void> {
    try {
      this.logInfo(`Analyzing job posting from ${options.file ? 'file' : 'URL'}: ${source}`);

      let jobAnalysis: JobPostingAnalysis;
      let rawContent: string = '';

      // Handle file-based analysis
      if (options.file) {
        if (!existsSync(source)) {
          this.logError(`File not found: ${source}`, true);
          return;
        }

        rawContent = await fs.readFile(source, 'utf-8');
        this.logSuccess(`Successfully read job description from file: ${source}`);

        // Parse job details from file content
        const lines = rawContent.split('\n');

        // Find the job title line
        const titleLine = lines.find((line) => line.toLowerCase().includes('job title:'));
        const title =
          titleLine && titleLine.includes(':')
            ? titleLine.split(':').slice(1).join(':').trim()
            : 'Unknown Position';

        // Find the agency/company line
        const agencyLine = lines.find(
          (line) =>
            line.toLowerCase().includes('agency:') || line.toLowerCase().includes('company:')
        );
        const company =
          agencyLine && agencyLine.includes(':')
            ? agencyLine.split(':').slice(1).join(':').trim()
            : 'Unknown Company';

        // Find the location line
        const locationLine = lines.find((line) => line.toLowerCase().includes('location:'));
        const location =
          locationLine && locationLine.includes(':')
            ? locationLine.split(':').slice(1).join(':').trim()
            : undefined;

        // Extract sections using helper function
        const getSection = (startMarker: string, endMarker: string): string[] => {
          const startIndex = rawContent.indexOf(startMarker);
          if (startIndex === -1) return [];

          const endIndex = rawContent.indexOf(endMarker, startIndex);
          const sectionContent =
            endIndex === -1
              ? rawContent.substring(startIndex + startMarker.length)
              : rawContent.substring(startIndex + startMarker.length, endIndex);

          return sectionContent
            .split('\n')
            .filter((line) => line.trim().startsWith('-'))
            .map((line) => line.replace(/^-\s*/, '').trim());
        };

        // Extract responsibilities and qualifications
        const responsibilities = getSection('Key Responsibilities:', 'Qualifications:');
        const qualifications = getSection('Qualifications:', 'Benefits:');

        // Extract key terms
        const keyTerms = this.extractKeyTerms(rawContent);

        // Create job analysis object
        jobAnalysis = {
          title,
          description: rawContent,
          company,
          location,
          responsibilities: responsibilities.length > 0 ? responsibilities : ['Not specified'],
          qualifications: qualifications.length > 0 ? qualifications : ['Not specified'],
          keyTerms: keyTerms,
          source: {
            url: `file://${source}`,
            site: 'Local File',
            fetchDate: new Date(),
          },
        };
      } else {
        // URL-based analysis
        try {
          jobAnalysis = await analyzeJobPosting(source);
        } catch (error) {
          this.logError(
            `Error analyzing job posting: ${error instanceof Error ? error.message : String(error)}`,
            true
          );
          return;
        }

        // For URL-based analysis, try to fetch the raw content if needed for record-keeping
        if (options.saveRawContent) {
          try {
            const rawContent = await this.fetchRawContent(source);
            if (rawContent) {
              await this.saveRawContent(source, rawContent);
            }
          } catch (error) {
            console.warn('Failed to save raw content:', error);
          }
        }
      }

      // Display the analysis results
      this.displayResults(jobAnalysis, options.format || 'text');

      // Save the analysis if an output path is provided
      if (options.output) {
        await this.saveAnalysis(jobAnalysis, options.output, options.format || 'json');
      }

      // Record the operation in the run configuration
      const runConfig: RunConfiguration = {
        jobPosting: {
          url: jobAnalysis.source.url,
          content: rawContent,
          timestamp: new Date().toISOString(),
        },
        verification: {
          claims: [],
          sourceData: rawContent,
        },
      };

      // Save the run configuration for documentation
      const configPath = options.output
        ? path.join(path.dirname(options.output), 'run-config.json')
        : path.join('generated', 'reports', 'job-analysis', `job-analysis-run-config-${Date.now()}.json`);

      await this.recordRunConfiguration(runConfig, configPath);
    } catch (error) {
      this.logError(
        `Error analyzing job posting: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }

  /**
   * Display the job analysis results
   * @param analysis Job analysis data
   * @param format Output format
   */
  private displayResults(analysis: JobPostingAnalysis, format: string): void {
    if (format.toLowerCase() === 'json') {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }

    // Default text output
    this.logInfo('\nJob Analysis Summary:');
    console.log('---------------------');
    console.log(`Title: ${analysis.title}`);
    console.log(`Company: ${analysis.company}`);
    if (analysis.location) console.log(`Location: ${analysis.location}`);
    if (analysis.jobType) console.log(`Job Type: ${analysis.jobType}`);
    if (analysis.experienceLevel) console.log(`Experience Level: ${analysis.experienceLevel}`);

    console.log('\nKey Terms for CV Tailoring:');
    console.log(analysis.keyTerms.join(', '));

    if (analysis.salaryRange) {
      const min = analysis.salaryRange.min ? `$${analysis.salaryRange.min.toLocaleString()}` : '?';
      const max = analysis.salaryRange.max ? `$${analysis.salaryRange.max.toLocaleString()}` : '?';
      const period = analysis.salaryRange.period || 'yearly';
      console.log(`\nSalary Range: ${min} - ${max} (${period})`);
    }

    console.log('\nResponsibilities:');
    analysis.responsibilities.forEach((r) => console.log(`- ${r}`));

    console.log('\nQualifications:');
    analysis.qualifications.forEach((q) => console.log(`- ${q}`));

    if (analysis.educationRequirements && analysis.educationRequirements.length > 0) {
      console.log('\nEducation Requirements:');
      analysis.educationRequirements.forEach((e) => console.log(`- ${e}`));
    }

    this.logSuccess('\nCV Tailoring Suggestions:');
    console.log('1. Highlight matching skills in your professional summary');
    console.log(
      '2. Adjust your work experience descriptions to emphasize relevant responsibilities'
    );
    console.log('3. Use similar terminology/keywords throughout your CV');
    console.log('4. Update your skills section to prioritize the most relevant ones');
  }

  /**
   * Save job analysis to a file
   * @param analysis Job analysis data
   * @param outputPath Output file path
   * @param format Output format
   */
  private async saveAnalysis(
    analysis: JobPostingAnalysis,
    outputPath: string,
    format: string
  ): Promise<void> {
    try {
      await this.ensureDirectory(path.dirname(outputPath));

      if (format.toLowerCase() === 'json') {
        await this.writeJsonFile(outputPath, analysis);
      } else if (format.toLowerCase() === 'markdown') {
        const content = this.formatAsMarkdown(analysis);
        await fs.writeFile(outputPath, content);
      } else {
        // Default to text format
        const content = this.formatAsText(analysis);
        await fs.writeFile(outputPath, content);
      }

      this.logSuccess(`Analysis saved to: ${outputPath}`);
    } catch (error) {
      this.logError(`Failed to save analysis: ${error}`, false);
    }
  }

  /**
   * Format job analysis as markdown
   * @param analysis Job analysis data
   * @returns Markdown formatted content
   */
  private formatAsMarkdown(analysis: JobPostingAnalysis): string {
    let content = `# Job Analysis: ${analysis.title}\n\n`;

    content += `**Company:** ${analysis.company}\n`;
    if (analysis.location) content += `**Location:** ${analysis.location}\n`;
    if (analysis.jobType) content += `**Job Type:** ${analysis.jobType}\n`;
    if (analysis.experienceLevel) content += `**Experience Level:** ${analysis.experienceLevel}\n`;

    content += `\n## Key Terms for CV Tailoring\n\n`;
    content += analysis.keyTerms.join(', ') + '\n';

    if (analysis.salaryRange) {
      const min = analysis.salaryRange.min ? `$${analysis.salaryRange.min.toLocaleString()}` : '?';
      const max = analysis.salaryRange.max ? `$${analysis.salaryRange.max.toLocaleString()}` : '?';
      const period = analysis.salaryRange.period || 'yearly';
      content += `\n**Salary Range:** ${min} - ${max} (${period})\n`;
    }

    content += `\n## Responsibilities\n\n`;
    analysis.responsibilities.forEach((r) => (content += `- ${r}\n`));

    content += `\n## Qualifications\n\n`;
    analysis.qualifications.forEach((q) => (content += `- ${q}\n`));

    if (analysis.educationRequirements && analysis.educationRequirements.length > 0) {
      content += `\n## Education Requirements\n\n`;
      analysis.educationRequirements.forEach((e) => (content += `- ${e}\n`));
    }

    content += `\n## CV Tailoring Suggestions\n\n`;
    content += `1. Highlight matching skills in your professional summary\n`;
    content += `2. Adjust your work experience descriptions to emphasize relevant responsibilities\n`;
    content += `3. Use similar terminology/keywords throughout your CV\n`;
    content += `4. Update your skills section to prioritize the most relevant ones\n`;

    content += `\n## Source\n\n`;
    content += `- URL: ${analysis.source.url}\n`;
    content += `- Site: ${analysis.source.site}\n`;
    content += `- Fetch Date: ${analysis.source.fetchDate.toISOString()}\n`;

    return content;
  }

  /**
   * Format job analysis as plain text
   * @param analysis Job analysis data
   * @returns Plain text formatted content
   */
  private formatAsText(analysis: JobPostingAnalysis): string {
    let content = `Job Analysis: ${analysis.title}\n`;
    content += `=================================\n\n`;

    content += `Company: ${analysis.company}\n`;
    if (analysis.location) content += `Location: ${analysis.location}\n`;
    if (analysis.jobType) content += `Job Type: ${analysis.jobType}\n`;
    if (analysis.experienceLevel) content += `Experience Level: ${analysis.experienceLevel}\n`;

    content += `\nKey Terms for CV Tailoring:\n`;
    content += `${analysis.keyTerms.join(', ')}\n`;

    if (analysis.salaryRange) {
      const min = analysis.salaryRange.min ? `$${analysis.salaryRange.min.toLocaleString()}` : '?';
      const max = analysis.salaryRange.max ? `$${analysis.salaryRange.max.toLocaleString()}` : '?';
      const period = analysis.salaryRange.period || 'yearly';
      content += `\nSalary Range: ${min} - ${max} (${period})\n`;
    }

    content += `\nResponsibilities:\n`;
    analysis.responsibilities.forEach((r) => (content += `- ${r}\n`));

    content += `\nQualifications:\n`;
    analysis.qualifications.forEach((q) => (content += `- ${q}\n`));

    if (analysis.educationRequirements && analysis.educationRequirements.length > 0) {
      content += `\nEducation Requirements:\n`;
      analysis.educationRequirements.forEach((e) => (content += `- ${e}\n`));
    }

    content += `\nCV Tailoring Suggestions:\n`;
    content += `1. Highlight matching skills in your professional summary\n`;
    content += `2. Adjust your work experience descriptions to emphasize relevant responsibilities\n`;
    content += `3. Use similar terminology/keywords throughout your CV\n`;
    content += `4. Update your skills section to prioritize the most relevant ones\n`;

    content += `\nSource Information:\n`;
    content += `URL: ${analysis.source.url}\n`;
    content += `Site: ${analysis.source.site}\n`;
    content += `Fetch Date: ${analysis.source.fetchDate.toISOString()}\n`;

    return content;
  }

  /**
   * Fetch raw content from a URL
   * @param url The URL to fetch from
   * @returns The raw content as a string
   */
  private async fetchRawContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.warn(`Failed to fetch raw content from ${url}:`, error);
      return null;
    }
  }

  /**
   * Save raw content to a file
   * @param url The source URL
   * @param content The content to save
   */
  private async saveRawContent(url: string, content: string): Promise<void> {
    try {
      const filename = `${new URL(url).hostname}-${Date.now()}.html`;
      const outputPath = path.join(process.cwd(), 'output', 'raw', filename);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, content, 'utf-8');
    } catch (error) {
      console.warn(`Failed to save raw content:`, error);
    }
  }
}
