/**
 * Profile Management Command
 *
 * Handles importing, exporting, and validating CV profiles.
 */

import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { BaseCommand, RunConfiguration, VerifiedClaim } from './base-command.js';
import { parseCvMarkdown } from '../../tools/cv-parser.js';
import { ProfileService } from '../../shared/services/profile-service.js';

// Types
import type { CVData } from '../../shared/types/cv-types.js';
import type { Profile } from '../../shared/types/profile-types.js';

/**
 * Options for profile import command
 */
interface ImportProfileOptions {
  owner: string;
  validate: boolean;
  output?: string;
  format?: string;
}

/**
 * Options for profile export command
 */
interface ExportProfileOptions {
  format: string;
  output: string;
  profileId?: string;
}

/**
 * Command to manage CV profiles
 */
export class ManageProfileCommand extends BaseCommand {
  private profileService: ProfileService;

  constructor() {
    super('profile', 'Manage CV profiles');
    this.profileService = new ProfileService();
  }

  /**
   * Configure the command
   */
  configure(): void {
    this.program.name(this.name).description(this.description);

    // Sub-command to import a profile
    this.program
      .command('import')
      .description('Import a CV document into the profile management system')
      .argument('<file>', 'Path to the CV document file')
      .option('-o, --owner <name>', 'Name of the profile owner', 'Dawn Zurick Beilfuss')
      .option('-v, --validate', 'Validate the profile data', false)
      .option('--output <path>', 'Save the imported profile to a file')
      .option('-f, --format <format>', 'Format for output (json, markdown)', 'json')
      .action(this.executeImport.bind(this));

    // Sub-command to export a profile
    this.program
      .command('export')
      .description('Export a profile to a specified format')
      .option('-p, --profile-id <id>', 'ID of the profile to export')
      .option('-f, --format <format>', 'Export format (json, markdown, pdf)', 'json')
      .option('-o, --output <path>', 'Output file path', 'output/profiles/exported-profile.json')
      .action(this.executeExport.bind(this));

    // Sub-command to validate a profile
    this.program
      .command('validate')
      .description('Validate a profile against requirements')
      .argument('<file>', 'Path to the profile file to validate')
      .option('-t, --type <type>', 'Validation type (basic, strict, federal)', 'basic')
      .action(this.executeValidate.bind(this));

    // Sub-command to list profiles
    this.program
      .command('list')
      .description('List available profiles')
      .option('-v, --verbose', 'Show detailed information', false)
      .action(this.executeList.bind(this));
  }

  /**
   * Execute the import profile command
   * @param file Path to the file to import
   * @param options Command options
   */
  async executeImport(file: string, options: ImportProfileOptions): Promise<void> {
    try {
      // Check if file exists
      if (!existsSync(file)) {
        this.logError(`File not found: ${file}`, true);
        return;
      }

      // Determine file type based on extension
      const fileExt = path.extname(file).toLowerCase();
      let cvData: CVData;
      let sourceData: string;

      this.logInfo(`Importing profile from ${file}...`);

      if (fileExt === '.md' || fileExt === '.markdown') {
        // Read and parse markdown file
        sourceData = await fs.readFile(file, 'utf-8');
        cvData = parseCvMarkdown(sourceData);
      } else if (fileExt === '.json') {
        // Read and parse JSON file
        sourceData = await fs.readFile(file, 'utf-8');
        cvData = JSON.parse(sourceData) as CVData;
      } else {
        this.logError(
          `Unsupported file format: ${fileExt}. Please use .md, .markdown, or .json files.`,
          true
        );
        return;
      }

      // Validate the profile if requested
      if (options.validate) {
        this.logInfo('Validating profile data...');
        const validationResult = this.validateProfileData(cvData);

        if (!validationResult.valid) {
          this.logWarning('Profile validation issues:');
          validationResult.issues.forEach((issue) => {
            console.log(`- ${issue}`);
          });

          // Prompt for confirmation to continue
          const proceed = await this.promptForConfirmation(
            'Continue with import despite validation issues?'
          );
          if (!proceed) {
            this.logError('Import cancelled.', false);
            return;
          }
        } else {
          this.logSuccess('Profile data validation successful!');
        }
      }

      // Create profile using profile service
      this.logInfo(`Creating profile for ${options.owner}...`);
      const profile = await this.profileService.createProfile(options.owner, cvData);

      // Display summary of imported data
      this.displayProfileSummary(cvData);

      this.logSuccess(`Profile created successfully!`);
      this.logInfo(`Profile ID: ${profile.id}`);

      // Save profile to file if output is specified
      if (options.output) {
        await this.saveProfileToFile(profile, options.output, options.format || 'json');
        this.logSuccess(`Profile saved to ${options.output}`);
      }

      // Create verification claims
      const claims: VerifiedClaim[] = [
        {
          content: `Profile created for ${options.owner}`,
          sourceReference: {
            file: path.basename(file),
            path: [options.owner],
            context: 'Profile import operation',
          },
        },
      ];

      // Record the operation in run configuration
      const runConfig: RunConfiguration = {
        verification: {
          claims,
          sourceData,
        },
        outputs: {
          format: options.format || 'json',
        },
      };

      // Save the run configuration
      const configPath = options.output
        ? path.join(path.dirname(options.output), 'import-run-config.json')
        : path.join('output', 'profiles', `profile-import-${Date.now()}.json`);

      await this.recordRunConfiguration(runConfig, configPath);
    } catch (error) {
      this.logError(
        `Error importing profile: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }

  /**
   * Execute the export profile command
   * @param options Command options
   */
  async executeExport(options: ExportProfileOptions): Promise<void> {
    try {
      this.logInfo('Exporting profile...');

      // This would fetch from a real database in a full implementation
      // For now, create a mock profile
      const mockCvData: CVData = {
        personalInfo: {
          name: {
            first: 'Dawn',
            last: 'Beilfuss',
            full: 'Dawn Zurick Beilfuss',
          },
          contact: {
            email: 'dawn.beilfuss@example.com',
            phone: '555-1234',
            address: '123 Main St, Chicago, IL 60601',
          },
          title: 'Administrative Professional',
        },
        professionalSummary:
          'Experienced administrative professional with a background in real estate and healthcare management.',
        experience: [
          {
            title: 'Managing Broker',
            company: 'Vylla Home',
            startDate: '2018-01',
            responsibilities: [
              'Managed real estate operations for Chicago metropolitan area',
              'Led team of 20+ real estate agents',
              'Ensured compliance with licensing requirements',
            ],
          },
          {
            title: 'Director of Operations',
            company: 'Chiro One Wellness Centers',
            startDate: '2013-05',
            endDate: '2017-12',
            responsibilities: [
              'Oversaw operations for 12 healthcare clinics',
              'Managed staffing and scheduling',
              'Implemented new health records system',
            ],
          },
        ],
        education: [
          {
            institution: 'University of Illinois',
            degree: 'Bachelor of Science, Business Administration',
            year: '2005',
            field: 'Business Administration',
          },
        ],
        skills: ['Operations Management', 'Team Leadership', 'Real Estate'],
        certifications: ['Real Estate Managing Broker'],
      };

      // Ensure output directory exists
      const outputDir = path.dirname(options.output);
      await this.ensureDirectory(outputDir);

      // Export based on format
      if (options.format.toLowerCase() === 'json') {
        await this.writeJsonFile(options.output, mockCvData);
      } else if (options.format.toLowerCase() === 'markdown') {
        const markdown = this.convertProfileToMarkdown(mockCvData);
        await fs.writeFile(options.output, markdown);
      } else if (options.format.toLowerCase() === 'pdf') {
        this.logError('PDF export is not implemented yet. Exporting as JSON instead.', false);
        await this.writeJsonFile(options.output, mockCvData);
      } else {
        this.logError(`Unsupported export format: ${options.format}. Using JSON instead.`, false);
        await this.writeJsonFile(options.output, mockCvData);
      }

      this.logSuccess(`Profile exported to ${options.output}`);

      // Record the operation
      const runConfig: RunConfiguration = {
        outputs: {
          format: options.format,
        },
      };

      const configPath = path.join(path.dirname(options.output), 'export-run-config.json');
      await this.recordRunConfiguration(runConfig, configPath);
    } catch (error) {
      this.logError(
        `Error exporting profile: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }

  /**
   * Execute the validate profile command
   * @param file Path to the profile file to validate
   * @param options Command options
   */
  async executeValidate(file: string, options: { type: string }): Promise<void> {
    try {
      // Check if file exists
      if (!existsSync(file)) {
        this.logError(`File not found: ${file}`, true);
        return;
      }

      // Read and parse file based on extension
      const fileExt = path.extname(file).toLowerCase();
      let cvData: CVData;

      if (fileExt === '.md' || fileExt === '.markdown') {
        // Read and parse markdown file
        const content = await fs.readFile(file, 'utf-8');
        cvData = parseCvMarkdown(content);
      } else if (fileExt === '.json') {
        // Read and parse JSON file
        const content = await fs.readFile(file, 'utf-8');
        cvData = JSON.parse(content) as CVData;
      } else {
        this.logError(
          `Unsupported file format: ${fileExt}. Please use .md, .markdown, or .json files.`,
          true
        );
        return;
      }

      // Validate the profile
      this.logInfo(`Validating profile with ${options.type} validation type...`);
      const validationResult = this.validateProfileData(cvData, options.type);

      if (!validationResult.valid) {
        this.logWarning('Profile validation issues:');
        validationResult.issues.forEach((issue) => {
          console.log(`- ${issue}`);
        });
        this.logError('Profile validation failed.', false);
      } else {
        this.logSuccess('Profile validation successful!');
        this.displayProfileSummary(cvData);
      }
    } catch (error) {
      this.logError(
        `Error validating profile: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }

  /**
   * Execute the list profiles command
   * @param options Command options
   */
  async executeList(options: { verbose: boolean }): Promise<void> {
    try {
      this.logInfo('Listing available profiles...');

      // In a real implementation, this would fetch from a database
      // For demonstration, show mock profiles
      const mockProfiles = [
        {
          id: 'profile-1',
          owner: 'Dawn Zurick Beilfuss',
          createdAt: '2023-01-15T12:30:00Z',
          updatedAt: '2023-03-20T15:45:00Z',
          versions: 3,
        },
        {
          id: 'profile-2',
          owner: 'Alternative Profile',
          createdAt: '2023-02-10T09:15:00Z',
          updatedAt: '2023-02-10T09:15:00Z',
          versions: 1,
        },
      ];

      console.log('\nAvailable Profiles:');
      console.log('------------------');

      for (const profile of mockProfiles) {
        console.log(`ID: ${profile.id}`);
        console.log(`Owner: ${profile.owner}`);

        if (options.verbose) {
          console.log(`Created: ${new Date(profile.createdAt).toLocaleString()}`);
          console.log(`Updated: ${new Date(profile.updatedAt).toLocaleString()}`);
          console.log(`Versions: ${profile.versions}`);
        }

        console.log('------------------');
      }

      this.logSuccess(`Found ${mockProfiles.length} profiles.`);
    } catch (error) {
      this.logError(
        `Error listing profiles: ${error instanceof Error ? error.message : String(error)}`,
        true
      );
    }
  }

  /**
   * Display a summary of the imported profile
   * @param cvData The imported profile data
   */
  private displayProfileSummary(cvData: CVData): void {
    console.log('\nProfile Summary:');
    console.log('---------------');
    console.log(`Name: ${cvData.personalInfo.name.full || 'Not specified'}`);
    console.log(`Email: ${cvData.personalInfo.contact.email || 'Not specified'}`);
    console.log(`Phone: ${cvData.personalInfo.contact.phone || 'Not specified'}`);
  }

  private validateProfileData(
    cvData: CVData,
    type: string = 'basic'
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Basic validation
    if (!cvData.personalInfo?.name?.full) {
      issues.push('Full name is required');
    }
    if (!cvData.personalInfo?.contact?.email) {
      issues.push('Email is required');
    }
    if (!cvData.personalInfo?.contact?.phone) {
      issues.push('Phone number is required');
    }

    // Type-specific validation
    if (type === 'strict') {
      if (!cvData.experience?.length) {
        issues.push('At least one work experience is required');
      }
      if (!cvData.education?.length) {
        issues.push('At least one education entry is required');
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  protected override async promptForConfirmation(message: string): Promise<boolean> {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(`${message} (y/n) `, (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  private async saveProfileToFile(
    profile: Profile,
    outputPath: string,
    format: string
  ): Promise<void> {
    await this.ensureDirectory(path.dirname(outputPath));
    if (format.toLowerCase() === 'json') {
      await this.writeJsonFile(outputPath, profile);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  private convertProfileToMarkdown(cvData: CVData): string {
    let markdown = `# ${cvData.personalInfo.name.full}\n\n`;
    markdown += `## Contact Information\n`;
    markdown += `${cvData.personalInfo.contact.email} | ${cvData.personalInfo.contact.phone}\n\n`;
    markdown += `## Professional Summary\n${cvData.professionalSummary}\n\n`;
    markdown += `## Experience\n\n`;
    cvData.experience.forEach((exp) => {
      markdown += `### ${exp.title} at ${exp.company}\n`;
      markdown += `${exp.startDate} - ${exp.endDate || 'Present'}\n\n`;
      exp.responsibilities.forEach((resp) => {
        markdown += `- ${resp}\n`;
      });
      markdown += '\n';
    });
    return markdown;
  }
}
