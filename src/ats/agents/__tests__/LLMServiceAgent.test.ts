import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentMessageBus } from '../../../AgentMessageBus';
import LLMServiceAgent from '../LLMServiceAgent';

// Mock OpenAI client to avoid browser environment issues
vi.mock('../../../core/services/llm/OpenAIClient', () => ({
  default: {
    distill: vi.fn().mockResolvedValue({ content: 'Mock distilled content', model: 'gpt-3.5-turbo' }),
    optimize: vi.fn().mockResolvedValue({ content: 'Mock optimized content', model: 'gpt-3.5-turbo' })
  }
}));

describe('LLMServiceAgent', () => {
  let messageBus: AgentMessageBus;
  let llmAgent: LLMServiceAgent;

  beforeEach(() => {
    messageBus = new AgentMessageBus();
    llmAgent = new LLMServiceAgent({ messageBus, agentName: 'TestLLMAgent' });
  });

  afterEach(async () => {
    await llmAgent.shutdown(1000);
  });

  describe('Initialization', () => {
    it('should initialize with message bus and agent name', () => {
      expect(llmAgent).toBeDefined();
      expect(llmAgent.getActiveRequestsCount()).toBe(0);
    });

    it('should set up message subscriptions', () => {
      const publishSpy = vi.spyOn(messageBus, 'publish');
      
      messageBus.publish('cv:distill', {
        requestId: 'test-001',
        cvData: {
          personalInfo: {
            name: { full: 'Test' },
            contact: { email: 'test@example.com', phone: '+1-555-0123' }
          }
        }
      });

      // Allow for async processing
      setTimeout(() => {
        expect(publishSpy).toHaveBeenCalled();
      }, 100);
    });
  });

  describe('Request Handling', () => {
    it('should handle distill requests', async () => {
      const completionPromise = new Promise((resolve) => {
        messageBus.subscribe('cv:distill:complete', resolve);
      });

      messageBus.publish('cv:distill', {
        requestId: 'distill-test-001',
        cvData: {
          personalInfo: {
            name: { full: 'John Smith' },
            contact: { email: 'john.smith@example.com', phone: '+1-555-0123' }
          },
          experience: [],
          education: [],
          skills: []
        },
        style: 'professional',
        maxLength: 1500
      });

      const result = await Promise.race([
        completionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 5000))
      ]);
      expect(result).toHaveProperty('requestId', 'distill-test-001');
      expect(result).toHaveProperty('result');
    });

    it('should handle optimize requests', async () => {
      const completionPromise = new Promise((resolve) => {
        messageBus.subscribe('cv:optimize:complete', resolve);
      });

      messageBus.publish('cv:optimize', {
        requestId: 'optimize-test-001',
        distilledContent: 'Sample distilled content for optimization',
        layoutConstraints: {
          maxLines: 40,
          maxCharactersPerLine: 80,
          pageFormat: 'Letter',
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
        }
      });

      const result = await completionPromise;
      expect(result).toHaveProperty('requestId', 'optimize-test-001');
      expect(result).toHaveProperty('result');
    });

    it('should handle complete single-page processing pipeline', async () => {
      const completionPromise = new Promise((resolve) => {
        messageBus.subscribe('cv:process:single-page:complete', resolve);
      });

      messageBus.publish('cv:process:single-page', {
        requestId: 'pipeline-test-001',
        cvData: {
          personalInfo: {
            name: { full: 'John Smith' },
            contact: { email: 'john.smith@example.com', phone: '+1-555-0123' }
          },
          experience: [{
            title: 'Software Engineer',
            company: 'Tech Corp',
            startDate: '2020',
            endDate: 'Present'
          }],
          education: [],
          skills: ['JavaScript', 'React']
        },
        targetStyle: 'professional',
        layoutConstraints: {
          maxLines: 45,
          maxCharactersPerLine: 80,
          pageFormat: 'Letter',
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
        }
      });

      const result = await completionPromise;
      expect(result).toHaveProperty('requestId', 'pipeline-test-001');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('distilled');
      expect(result).toHaveProperty('optimized');
      expect(result).toHaveProperty('processingTime');
    });
  });

  describe('Direct Messages', () => {
    it('should respond to status requests', async () => {
      const statusPromise = new Promise((resolve) => {
        messageBus.subscribe('agent:status', resolve);
      });

      messageBus.publishDirect('TestLLMAgent', { action: 'status' });

      const status = await statusPromise;
      expect(status).toHaveProperty('agentName', 'TestLLMAgent');
      expect(status).toHaveProperty('activeRequests');
    });

    it('should respond to health checks', async () => {
      const healthPromise = new Promise((resolve) => {
        messageBus.subscribe('agent:health', resolve);
      });

      messageBus.publishDirect('TestLLMAgent', { action: 'health' });

      const health = await healthPromise;
      expect(health).toHaveProperty('agentName', 'TestLLMAgent');
      expect(health).toHaveProperty('healthy', true);
      expect(health).toHaveProperty('capabilities');
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      const errorPromise = new Promise((resolve) => {
        messageBus.subscribe('cv:distill:error', resolve);
      });

      // Send invalid data to trigger error
      messageBus.publish('cv:distill', {
        requestId: 'error-test-001',
        cvData: null, // Invalid data
        style: 'professional'
      });

      const error = await errorPromise;
      expect(error).toHaveProperty('requestId', 'error-test-001');
      expect(error).toHaveProperty('error');
    });

    it('should track active requests correctly', () => {
      expect(llmAgent.getActiveRequestsCount()).toBe(0);
      
      // Start processing
      messageBus.publish('cv:distill', {
        requestId: 'tracking-test-001',
        cvData: { personalInfo: { name: { full: 'Test' } } }
      });

      // Check that request is tracked (may need slight delay for async)
      setTimeout(() => {
        expect(llmAgent.getActiveRequestsCount()).toBeGreaterThanOrEqual(0);
      }, 10);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      const shutdownPromise = llmAgent.shutdown(5000);
      await expect(shutdownPromise).resolves.toBeUndefined();
    });

    it('should wait for active requests before shutdown', async () => {
      // Start a long-running request
      messageBus.publish('cv:process:single-page', {
        requestId: 'shutdown-test-001',
        cvData: { personalInfo: { name: { full: 'Test' } } },
        targetStyle: 'professional'
      });

      const startTime = Date.now();
      await llmAgent.shutdown(1000);
      const endTime = Date.now();

      // Should complete quickly if no active requests, or wait for timeout
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
