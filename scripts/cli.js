import { generateCV } from "./generator.js";
async function main() {
    const args = process.argv.slice(2);
    const sectorArg = args.find(arg => arg.startsWith("--sector="));
    if (!sectorArg) {
        console.error("Please specify a sector: --sector=federal|state|private");
        process.exit(1);
    }
    const sector = sectorArg.split("=")[1];
    const outputPath = `output/${sector}`;
    try {
        // Create the sector directory if it doesn't exist
        await import('fs/promises').then(fs => fs.mkdir(outputPath, { recursive: true }));
        // Load default CV data
        const cvDataPath = `data/base-info.json`;
        const cvData = await import('fs/promises')
            .then(fs => fs.readFile(cvDataPath, 'utf-8'))
            .then(data => JSON.parse(data));
        // Define default options for CV generation
        const cvOptions = {
            format: 'pdf', // Use const assertion to ensure correct type
            pdfOptions: {
                includeHeaderFooter: false
            }
        };
    const _content = await generateCV(sector, cvData, outputPath, cvOptions);
        console.log(`Successfully generated ${sector} CV`);
    }
    catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map