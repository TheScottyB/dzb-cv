// @ts-check
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));
export async function loadTemplate(templatePath) {
    const template = await readFile(templatePath, "utf-8");
    return Handlebars.compile(template);
}
export async function loadCVData(dataPath) {
    const data = await readFile(dataPath, "utf-8");
    return JSON.parse(data);
}
export function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });
}
//# sourceMappingURL=helpers.js.map