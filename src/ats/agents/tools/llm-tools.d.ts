import { Tool } from '../types';
import type { CVData } from '@dzb-cv/types';
interface DistillContentInput {
    cvData: CVData;
    targetSections?: string[];
    maxLength?: number;
    style?: 'professional' | 'academic' | 'technical' | 'executive';
}
interface DistillContentOutput {
    distilledContent: string;
    sectionsIncluded: string[];
    reductionRatio: number;
    metadata: {
        originalLength: number;
        distilledLength: number;
        processingTime: number;
        llmModel?: string;
        confidence: number;
    };
}
/**
 * Tool for distilling CV content to a single page using an LLM
 */
export declare const distillContentTool: Tool<DistillContentInput, DistillContentOutput>;
interface OptimizeContentInput {
    distilledContent: string;
    layoutConstraints?: {
        maxLines: number;
        maxCharactersPerLine: number;
        pageFormat: 'A4' | 'Letter';
        margins: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
    prioritySections?: string[];
}
interface OptimizeContentOutput {
    optimizedContent: string;
    layoutMetrics: {
        estimatedLines: number;
        fitsOnSinglePage: boolean;
        compressionRatio: number;
    };
    optimizations: string[];
}
/**
 * Tool for optimizing distilled content to fit a single-page layout
 */
export declare const optimizeContentTool: Tool<OptimizeContentInput, OptimizeContentOutput>;
export {};
//# sourceMappingURL=llm-tools.d.ts.map