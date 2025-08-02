import { Command } from 'commander';
import { verifyPDF, verifyMultiplePDFs, printVerificationResults } from '../../shared/utils/pdf-verifier';
import path from 'path';
import fs from 'fs';

export function createVerifyPDFCommand(program: Command): void {
  program
    .command('verify-pdf')
    .description('Verify PDF content and structure')
    .argument('[files...]', 'PDF files to verify (supports glob patterns)')
    .option('-d, --directory <dir>', 'Directory to scan for PDFs', '.')
    .option('-r, --recursive', 'Scan directories recursively', false)
    .option('--summary', 'Show summary only', false)
    .action(async (files, options) => {
      try {
        let filesToVerify: string[] = [];

        if (files && files.length > 0) {
          // Use provided files directly (no glob support for now)
          filesToVerify = files.filter(file => file.endsWith('.pdf'));
        } else {
          // Scan directory for PDFs
          try {
            const dirContents = fs.readdirSync(options.directory);
            filesToVerify = dirContents
              .filter(file => file.endsWith('.pdf'))
              .map(file => path.join(options.directory, file));
          } catch (error) {
            console.error(`Error reading directory ${options.directory}:`, error);
            return;
          }
        }

        if (filesToVerify.length === 0) {
          console.log('No PDF files found to verify.');
          return;
        }

        console.log(`🔍 Verifying ${filesToVerify.length} PDF file(s)...`);

        const results = await verifyMultiplePDFs(filesToVerify);
        
        let validCount = 0;
        let issueCount = 0;
        let warningCount = 0;

        for (const [filePath, result] of Object.entries(results)) {
          if (!options.summary) {
            printVerificationResults(filePath, result);
          }
          
          if (result.isValid) validCount++;
          issueCount += result.issues.length;
          warningCount += result.warnings.length;
        }

        // Print summary
        console.log(`\n📊 Verification Summary:`);
        console.log(`   Files processed: ${filesToVerify.length}`);
        console.log(`   Valid PDFs: ${validCount} ${validCount === filesToVerify.length ? '✅' : '⚠️'}`);
        console.log(`   Total issues: ${issueCount} ${issueCount === 0 ? '✅' : '🚨'}`);
        console.log(`   Total warnings: ${warningCount} ${warningCount === 0 ? '✅' : '⚠️'}`);

        if (issueCount > 0) {
          console.log('\n❌ Some PDFs have critical issues that need attention.');
          process.exit(1);
        } else if (warningCount > 0) {
          console.log('\n⚠️  Some PDFs have warnings but are generally acceptable.');
        } else {
          console.log('\n✅ All PDFs verified successfully!');
        }

      } catch (error) {
        console.error('Error verifying PDFs:', error);
        process.exit(1);
      }
    });
}
