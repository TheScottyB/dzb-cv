import { generateCV } from "./generator";

async function main() {
  const args = process.argv.slice(2);
  const sectorArg = args.find(arg => arg.startsWith("--sector="));
  
  if (!sectorArg) {
    console.error("Please specify a sector: --sector=federal|state|private");
    process.exit(1);
  }
  
  const sector = sectorArg.split("=")[1] as "federal" | "state" | "private";
  const outputPath = `output/${sector}`;
  
  try {
    const content = await generateCV(sector, outputPath);
    console.log(`Successfully generated ${sector} CV`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
