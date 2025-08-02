import { AgentMessageBus } from '../../AgentMessageBus';
import LLMServiceAgent from '../../ats/agents/LLMServiceAgent';
import path from 'path';
import fs from 'fs/promises';
import type { CVData } from '../../shared/types/cv-types';

/**
 * Bridge service between existing CV processing and LLM-based AI optimization
 */
export class CVIntegrationService {
  private messageBus: AgentMessageBus;
  private llmAgent: LLMServiceAgent;

  constructor() {
    this.messageBus = new AgentMessageBus();
    this.llmAgent = new LLMServiceAgent({ messageBus: this.messageBus, agentName: 'IntegrationService' });
  }

  /**
   * Process a CV using LLM for AI optimization
   * @param cvData The CV data to process
   * @returns A promise that resolves to the path of the optimized PDF
   */
  async processCV(cvData: CVData, options: { output: string }): Promise<string> {
    const requestId = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI processing timeout (30s)'));
      }, 30000);

      this.messageBus.subscribe('cv:process:single-page:complete', async (data) => {
        if (data.requestId !== requestId) return;
        clearTimeout(timeout);
        try {
          const pdfPath = await this.savePDF(data.optimized.optimizedContent, options.output);
          resolve(pdfPath);
        } catch (error) {
          reject(error);
        }
      });

      this.messageBus.subscribe('cv:process:single-page:error', (error) => {
        if (error.requestId !== requestId) return;
        clearTimeout(timeout);
        reject(new Error(error.error));
      });

      this.messageBus.publish('cv:process:single-page', {
        requestId,
        cvData,
        targetStyle: 'professional',
        layoutConstraints: {
          maxLines: 45,
          maxCharactersPerLine: 80,
          pageFormat: 'Letter',
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
        }
      });
    });

    return result as string;
  }

  /**
   * Save the optimized content as a PDF
   */
  private async savePDF(content: string, outputPath: string): Promise<string> {
    // Mock saving for simplicity - in a real implementation, convert HTML to PDF
    await fs.writeFile(outputPath, content);
    return path.resolve(outputPath);
  }

  /**
   * Shutdown the integration service
   */
  async shutdown(timeoutMs: number = 5000): Promise<void> {
    await this.llmAgent.shutdown(timeoutMs);
  }
}

export default new CVIntegrationService();
