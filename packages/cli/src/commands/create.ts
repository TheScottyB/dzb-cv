import { Command } from 'commander';
import { CVService } from '@dzb-cv/core';
import { createPDFGenerator } from '@dzb-cv/pdf';
import type { CVData } from '@dzb-cv/types';
export function createCVCommand(program: Command): void {
  program
    .command('create')
    .description('Create a new CV')
    .requiredOption('-n, --name <name>', 'Full name')
    .requiredOption('-e, --email <email>', 'Email address')
    .option('-o, --output <file>', 'Output PDF file')
    .option('--single-page', 'Force PDF to fit on a single page')
    .option('--template <template>', 'Template to use (default, minimal, federal, academic)', 'default')
    .option('--format <format>', 'Paper format (A4, Letter)', 'Letter')
    .action(async (options) => {
      const [firstName, ...lastNameParts] = options.name.split(' ');
      const lastName = lastNameParts.join(' ');

      console.log(`Creating CV for ${firstName} ${lastName}`);

      const cvData: CVData = {
        personalInfo: {
          name: {
            first: firstName,
            last: lastName,
            full: options.name,
          },
          contact: {
            email: options.email,
            phone: '', // Add missing required property
          },
        },
        experience: [],
        education: [],
        skills: [],
      };

      const storage = {
         
        save: async (id: string, _data: CVData): Promise<void> => {
          console.log(`Saving CV with ID: ${id}`);
        },
         
        load: async (_id: string): Promise<CVData> => {
          throw new Error('Not implemented');
        },
         
        delete: async (_id: string): Promise<void> => {
          throw new Error('Not implemented');
        },
      };

      const pdfGenerator = createPDFGenerator();
      const service = new CVService(storage, pdfGenerator);
      
      // Build PDF generation options from CLI flags
      const pdfOptions = {
        singlePage: options.singlePage || false,
        template: options.template as 'default' | 'minimal' | 'federal' | 'academic',
        format: options.format as 'A4' | 'Letter',
        metadata: {
          title: `${options.name} - CV`,
          author: options.name,
          subject: 'Curriculum Vitae',
          keywords: ['CV', 'resume', options.template],
        },
      };
      
      try {
        await service.createCV(cvData);
        const pdf = await service.generatePDF(cvData, pdfOptions);
        console.log(`Generated PDF: ${pdf.length} bytes`);
      } catch (error) {
        console.error('Error creating CV:', error);
        process.exit(1);
      }
    });
}
