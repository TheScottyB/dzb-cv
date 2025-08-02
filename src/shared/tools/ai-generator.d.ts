/**
 * AI-powered CV generation tool that integrates LLM optimization with existing PDF generation
 */
interface AIGenerateOptions {
    name: string;
    email: string;
    output: string;
    singlePage?: boolean;
    style?: 'professional' | 'academic' | 'technical' | 'executive';
    useOpenAI?: boolean;
}
interface AIGenerateResult {
    success: boolean;
    filePath?: string;
    error?: string;
    processing?: {
        distilled: any;
        optimized: any;
        processingTime: number;
    };
}
/**
 * Generate an AI-optimized CV using the LLM agent pipeline
 */
export declare function generateAICV(options: AIGenerateOptions): Promise<AIGenerateResult>;
/**
 * Enhanced version that could include job matching and optimization
 */
export declare function generateAICVForJob(cvOptions: AIGenerateOptions, jobDescription?: string): Promise<AIGenerateResult>;
export {};
//# sourceMappingURL=ai-generator.d.ts.map