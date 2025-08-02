import { AgentMessageBus } from '../../AgentMessageBus';
interface CVData {
    personalInfo: {
        name: {
            full: string;
        };
        contact: {
            email: string;
            phone?: string;
        };
    };
    experience: Array<{
        position: string;
        company: string;
        startDate: string;
        endDate?: string;
        responsibilities?: string[];
        description?: string;
    }>;
    education: Array<{
        degree: string;
        institution: string;
        graduationDate?: string;
        endDate?: string;
    }>;
    skills: Array<{
        name: string;
        level?: string;
    } | string>;
}
interface LLMServiceAgentOptions {
    messageBus: AgentMessageBus;
    agentName?: string;
}
interface CVProcessingRequest {
    cvData: CVData;
    requestId: string;
    targetStyle?: 'professional' | 'academic' | 'technical' | 'executive';
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
}
/**
 * LLMServiceAgent orchestrates CV content processing using LLM tools.
 * Subscribes to message bus topics and handles the complete pipeline:
 * 1. Content distillation (multi-page to single-page)
 * 2. Layout optimization (fitting content to page constraints)
 */
declare class LLMServiceAgent {
    private messageBus;
    private logPrefix;
    private agentName;
    private activeRequests;
    constructor(options: LLMServiceAgentOptions);
    private setupSubscriptions;
    /**
     * Handle individual distill content requests
     */
    handleDistillRequest(data: any): Promise<void>;
    /**
     * Handle individual optimize content requests
     */
    handleOptimizeRequest(data: any): Promise<void>;
    /**
     * Handle complete single-page CV processing pipeline
     */
    handleSinglePageRequest(data: CVProcessingRequest): Promise<void>;
    /**
     * Handle direct messages to this agent
     */
    handleDirectMessage(data: any): Promise<void>;
    /**
     * Publish current agent status
     */
    private publishStatus;
    /**
     * Publish health check result
     */
    private publishHealthCheck;
    /**
     * Generate a unique request ID
     */
    private generateRequestId;
    /**
     * Format error for consistent error handling
     */
    private formatError;
    /**
     * Get current active requests count (for monitoring)
     */
    getActiveRequestsCount(): number;
    /**
     * Graceful shutdown - wait for active requests to complete
     */
    shutdown(timeoutMs?: number): Promise<void>;
}
export default LLMServiceAgent;
//# sourceMappingURL=LLMServiceAgent.d.ts.map