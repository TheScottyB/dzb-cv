import type { ATSAnalysis } from '../../types/ats-types.js';
/**
 * Common ATS parsing issues and their impact scores
 */
declare const ATS_ISSUES: {
    COMPLEX_FORMATTING: {
        score: number;
        message: string;
        fix: string;
    };
    UNUSUAL_HEADINGS: {
        score: number;
        message: string;
        fix: string;
    };
    MISSING_DATES: {
        score: number;
        message: string;
        fix: string;
    };
    GRAPHICS: {
        score: number;
        message: string;
        fix: string;
    };
    CONTACT_INFO: {
        score: number;
        message: string;
        fix: string;
    };
};
/**
 * Analyzes CV content for ATS compatibility
 */
export declare function analyzeATSCompatibility(content: string): Promise<ATSAnalysis>;
export { ATS_ISSUES };
