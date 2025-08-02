interface CVData {
    personalInfo: {
        name: {
            first: string;
            last: string;
            full: string;
        };
        contact: {
            email: string;
            phone?: string;
            address?: string;
        };
    };
    experience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate?: string;
        description?: string;
        employer: string;
        responsibilities?: string[];
    }>;
    education: Array<{
        institution: string;
        degree: string;
        field?: string;
        startDate: string;
        endDate?: string;
        graduationDate?: string;
    }>;
    skills: Array<{
        name: string;
        level?: string;
    } | string>;
}
/**
 * Options for LLM content processing
 */
export interface LLMProcessingOptions {
    style?: 'professional' | 'academic' | 'technical' | 'executive';
    targetSections?: string[];
    maxLength?: number;
    model?: string;
}
/**
 * Result from LLM processing
 */
export interface LLMProcessingResult {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
}
/**
 * Service for interacting with OpenAI's API for CV content processing
 */
export declare class OpenAIClient {
    private client;
    private defaultModel;
    private maxRetries;
    private retryDelay;
    constructor();
    /**
     * Distills CV content into a concise single-page format
     * @param cvData Structured CV data to distill
     * @param options Processing options
     * @returns Distilled content with metadata
     */
    distill(cvData: CVData, options?: LLMProcessingOptions): Promise<LLMProcessingResult>;
    /**
     * Optimizes distilled content for single-page layout
     * @param content Content to optimize
     * @param constraints Layout constraints
     * @returns Optimized content
     */
    optimize(content: string, constraints?: {
        maxLines?: number;
        maxCharactersPerLine?: number;
        pageFormat?: 'A4' | 'Letter';
    }): Promise<LLMProcessingResult>;
    /**
     * Get system prompt based on CV style
     */
    private getSystemPrompt;
    /**
     * Build distillation prompt for CV content
     */
    private buildDistillationPrompt;
    /**
     * Build optimization prompt for layout formatting
     */
    private buildOptimizationPrompt;
    /**
     * Convert CV data to text format
     */
    private cvDataToText;
    /**
     * Make OpenAI request with retry logic
     */
    private makeRequestWithRetry;
    /**
     * Fallback distillation when OpenAI is unavailable
     */
    private fallbackDistill;
    /**
     * Fallback optimization when OpenAI is unavailable
     */
    private fallbackOptimize;
}
declare const _default: OpenAIClient;
export default _default;
//# sourceMappingURL=OpenAIClient.d.ts.map