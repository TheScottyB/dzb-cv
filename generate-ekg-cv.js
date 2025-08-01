import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the base info JSON
const baseInfo = JSON.parse(fs.readFileSync('base-info.json', 'utf8'));

// Read the EKG template
const templateContent = fs.readFileSync('data/templates/healthcare/ekg-technician-template.md', 'utf8');

// Compile the template
const template = Handlebars.compile(templateContent);

// Generate the CV content
const cvContent = template(baseInfo);

// Write to a markdown file first
fs.writeFileSync('Dawn_Zurick_Beilfuss_EKG_CV.md', cvContent);

console.log('✅ Generated Dawn_Zurick_Beilfuss_EKG_CV.md');
console.log('📄 CV ready for use - you can convert to PDF as needed');
