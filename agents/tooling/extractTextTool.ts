/**
 * Tool: extract_text
 * Description: Extracts plain text from PDF/DOCX files for ATS processing.
 */
export const extractTextTool = {
  name: "extract_text",
  description: "Extracts plain text from PDF/DOCX files for ATS processing.",
  /**
   * @param input { file: Buffer | string }
   * @returns { text: string }
   */
  async run(input: { file: Buffer | string }): Promise<{ text: string }> {
    // TODO: Implement PDF/DOCX text extraction here
    throw new Error("Not implemented");
  }
};

