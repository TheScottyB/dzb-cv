declare module "../utils/helpers.js" {
  import type { CVData } from "./cv-types.js";
  
  export function loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate>;
  export function loadCVData(dataPath: string): Promise<CVData>;
  export function formatDate(date: Date): string;
}
