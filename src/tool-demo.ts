import { parseResumeTool } from "../agents/tooling/parseResumeTool.js";
import { scoreResumeTool } from "../agents/tooling/scoreResumeTool.js";
import { promises as fs } from "fs";
import path from "path";

async function main() {
  const filePath = path.resolve("samples/perfect-resume.txt");

  let resumeText: string;
  let buffer: Buffer;

  try {
    buffer = await fs.readFile(filePath);
    resumeText = buffer.toString("utf-8");
  } catch (err) {
    console.error(`Resume sample not found at ${filePath}.\nPlease add a plain text resume to samples/ and try again.`);
    return;
  }

  const mimeType = "text/plain";
  const fileSize = buffer.length;

  console.log("=== ATS Tool Demo (Real File) ===");
  console.log(`Processing file: ${filePath}`);

  // 1. Parse the real resume file
  let parsed;
  try {
    parsed = await parseResumeTool.run({ buffer, mimeType });
    console.log("Parsed Resume:", JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error("parseResumeTool error:", err);
    return;
  }

  // 2. Score the real resume using the source text and file info
  try {
    const analysis = await scoreResumeTool.run({
      resumeText,
      fileInfo: { format: mimeType, size: fileSize },
      jobDescription: "Looking for a software engineer skilled in JavaScript and TypeScript"
    });
    console.log("ATS Analysis Result:", JSON.stringify(analysis, null, 2));
  } catch (err) {
    console.error("scoreResumeTool error:", err);
  }
}

main();

