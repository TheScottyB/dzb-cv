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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        save: async (id: string, _data: CVData): Promise<void> => {
          console.log(`Saving CV with ID: ${id}`);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        load: async (_id: string): Promise<CVData> => {
          throw new Error('Not implemented');
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        delete: async (_id: string): Promise<void> => {
          throw new Error('Not implemented');
        },
      };

      const pdfGenerator = createPDFGenerator();
      const service = new CVService(storage, pdfGenerator);
      try {
        await service.createCV(cvData);
        const pdf = await service.generatePDF(cvData);
        console.log(`Generated PDF: ${pdf.length} bytes`);
      } catch (error) {
        console.error('Error creating CV:', error);
        process.exit(1);
      }
    });
}
