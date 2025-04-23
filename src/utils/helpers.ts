import { readFile } from "fs/promises";
import { join } from "path";
import Handlebars from "handlebars";
import { CVData } from "../types/cv-types";

export async function loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
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
