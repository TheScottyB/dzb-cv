import { generateCV } from './generator.js';
async function main() {
  const args = process.argv.slice(2);
  const sectorArg = args.find((arg) => arg.startsWith('--sector='));
  const singlePageFlag = args.includes('--single-page');
  
  if (!sectorArg) {
    console.error('Please specify a sector: --sector=federal|state|private');
    console.error('Usage: node cli.js --sector=<federal|state|private> [--single-page]');
    console.error('\nOptions:');
    console.error('  --sector=<type>    Specify the sector type (required)');
    console.error('  --single-page      Force PDF generation to fit on a single page');
    process.exit(1);
  }
  const sector = sectorArg.split('=')[1];
  const outputPath = `generated/cvs/personal/${sector}`;
  try {
    // Create the sector directory if it doesn't exist
    await import('fs/promises').then((fs) => fs.mkdir(outputPath, { recursive: true }));
    // Load default CV data
    const cvDataPath = `data/base-info.json`;
    const cvData = await import('fs/promises')
      .then((fs) => fs.readFile(cvDataPath, 'utf-8'))
      .then((data) => JSON.parse(data));
    // Define default options for CV generation
    const cvOptions = {
      format: 'pdf', // Use const assertion to ensure correct type
      pdfOptions: {
        includeHeaderFooter: false,
        // Add single-page option if flag is provided
        ...(singlePageFlag && {
          singlePage: true,
          pageRanges: '1',
          margins: {
            top: 0.5,
            right: 0.5,
            bottom: 0.5,
            left: 0.5,
          },
          fontSize: 10, // Reduce font size for single page
          lineHeight: 1.2, // Reduce line height for compactness
        }),
      },
    };
    const _content = await generateCV(sector, cvData, outputPath, cvOptions);
    console.log(`Successfully generated ${sector} CV${singlePageFlag ? ' (single-page format)' : ''}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
main();
//# sourceMappingURL=cli.js.map
