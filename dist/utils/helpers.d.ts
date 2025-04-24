import Handlebars from "handlebars";
import type { CVData } from "../types/cv-types.js";
export declare function loadTemplate(templatePath: string): Promise<Handlebars.TemplateDelegate>;
export declare function loadCVData(dataPath: string): Promise<CVData>;
export declare function formatDate(date: Date): string;
