// @ts-check
import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import type { CVData } from "../types/cv-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export async function loadTemplate(templatePath: string): Promise<Handlebars.TemplateDelegate> {
  const template = await readFile(templatePath, "utf-8");
  return Handlebars.compile(template);
}

export async function loadCVData(dataPath: string): Promise<CVData> {
  const data = await readFile(dataPath, "utf-8");
  return JSON.parse(data) as CVData;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}
