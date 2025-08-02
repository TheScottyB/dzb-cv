import { Command } from 'commander';
import { generateAICV } from '../../shared/tools/ai-generator';

export function createAICVCommand(program: Command): void {
  program
    .command('ai-generate')
    .description('Generate an AI-optimized single-page CV')
    .requiredOption('-n, --name <name>', 'Full name')
    .requiredOption('-e, --email <email>', 'Email address')
    .option('-o, --output <file>', 'Output PDF file', 'output.pdf')
    .option('--single-page', 'Force PDF to fit on a single page', true)
    .action(async (options) => {
      console.log(`Creating AI-optimized CV for ${options.name}`);

      const result = await generateAICV({
        name: options.name,
        email: options.email,
        output: options.output,
        singlePage: options.singlePage
      });

      if (result.success) {
        console.log(`AI-optimized CV generated: ${result.filePath}`);
      } else {
        console.error(`Failed to generate AI-optimized CV: ${result.error}`);
        process.exit(1);
      }
    });
}
