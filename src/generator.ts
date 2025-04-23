import { join } from "path";
import { fileURLToPath } from "url";
import { loadTemplate, loadCVData } from "./utils/helpers.js";
import type { CVData } from "./types/cv-types.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function generateCV(sector: "federal" | "state" | "private", outputPath: string) {
  try {
    // Load base CV data
    const cvData = await loadCVData(join(__dirname, "data", "base-info.json"));
    
    // Load sector-specific template
    const templatePath = join(__dirname, "templates", sector, `${sector}-template.md`);
    const template = await loadTemplate(templatePath);
    
    // Generate CV content
    const content = template(cvData);
    
    // TODO: Convert to PDF/DOCX and save to output directory
    console.log(`Generated ${sector} CV content`);
    
    return content;
  } catch (error) {
    console.error(`Error generating ${sector} CV:`, error);
    throw error;
  }
}

export { generateCV };
