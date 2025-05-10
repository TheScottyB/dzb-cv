import { analyzeATS, ATSAnalysisResult } from '../../src/ats/scoring.js';

/**
 * Tool: score_resume
 * Description: Scores a resume and detects ATS issues using the available ATS scoring logic.
 *
 * Input: { resumeText: string, fileInfo: { format: string; size: number }, jobDescription?: string }
 * Output: ATSAnalysisResult (see src/ats/scoring.ts)
 *
 * @note This function now wraps the actual business logic, not a stub.
 */
export const scoreResumeTool = {
  name: 'score_resume',
  description:
    'Scores a resume and detects ATS compatibility issues using the established ATS scoring logic.',
  /**
   * @param input - Resume plain text, fileInfo, (optional) jobDescription
   * @returns ATSAnalysisResult with score, issues, improvements, and section scores
   * @throws If scoring fails
   */
  async run(input: {
    resumeText: string;
    fileInfo: { format: string; size: number };
    jobDescription?: string;
  }): Promise<ATSAnalysisResult> {
    try {
      // TODO: Tweak scoring/logic as needed in analyzeATS or here.
      return await Promise.resolve(
        analyzeATS(input.resumeText, input.fileInfo, input.jobDescription)
      );
    } catch (err: any) {
      throw new Error('ATS Scoring failed: ' + (err?.message || err));
    }
  },
};
