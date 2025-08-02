import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentMessageBus } from '../../../AgentMessageBus';

describe('AgentMessageBus', () => {
  let messageBus: AgentMessageBus;

  beforeEach(() => {
    messageBus = new AgentMessageBus();
  });

  describe('Basic Pub/Sub Functionality', () => {
    it('should subscribe and publish to topics', () => {
      const mockHandler = vi.fn();
      messageBus.subscribe('test:topic', mockHandler);
      
      const testPayload = { message: 'hello world' };
      messageBus.publish('test:topic', testPayload);
      
      expect(mockHandler).toHaveBeenCalledWith(testPayload);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers for same topic', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      messageBus.subscribe('multi:topic', handler1);
      messageBus.subscribe('multi:topic', handler2);
      
      const payload = { data: 'test' };
      messageBus.publish('multi:topic', payload);
      
      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('should handle unsubscribe correctly', () => {
      const handler = vi.fn();
      const unsubscribe = messageBus.subscribe('temp:topic', handler);
      
      messageBus.publish('temp:topic', { test: 1 });
      expect(handler).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      messageBus.publish('temp:topic', { test: 2 });
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should publish to non-existent topics without error', () => {
      expect(() => {
        messageBus.publish('non:existent', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('Direct Messaging', () => {
    it('should support direct agent messaging', () => {
      const handler = vi.fn();
      messageBus.subscribe('@TestAgent', handler);
      
      const payload = { action: 'ping' };
      messageBus.publishDirect('TestAgent', payload);
      
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should handle direct messages to non-existent agents', () => {
      expect(() => {
        messageBus.publishDirect('NonExistentAgent', { test: true });
      }).not.toThrow();
    });

    it('should differentiate between topic and direct subscriptions', () => {
      const topicHandler = vi.fn();
      const directHandler = vi.fn();
      
      messageBus.subscribe('TestAgent', topicHandler);
      messageBus.subscribe('@TestAgent', directHandler);
      
      messageBus.publish('TestAgent', { type: 'topic' });
      messageBus.publishDirect('TestAgent', { type: 'direct' });
      
      expect(topicHandler).toHaveBeenCalledWith({ type: 'topic' });
      expect(directHandler).toHaveBeenCalledWith({ type: 'direct' });
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', () => {
      const goodHandler = vi.fn();
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      
      messageBus.subscribe('error:topic', goodHandler);
      messageBus.subscribe('error:topic', errorHandler);
      
      // Should not throw and should still call good handler
      expect(() => {
        messageBus.publish('error:topic', { test: true });
      }).not.toThrow();
      
      expect(goodHandler).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should continue processing other handlers when one fails', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn(() => { throw new Error('Test error'); });
      const handler3 = vi.fn();
      
      messageBus.subscribe('test:error', handler1);
      messageBus.subscribe('test:error', handler2);
      messageBus.subscribe('test:error', handler3);
      
      messageBus.publish('test:error', { data: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should clean up empty handler sets', () => {
      const handler = vi.fn();
      const unsubscribe = messageBus.subscribe('cleanup:test', handler);
      
      // Verify subscription works
      messageBus.publish('cleanup:test', { test: 1 });
      expect(handler).toHaveBeenCalled();
      
      // Unsubscribe should clean up
      unsubscribe();
      
      // Publishing should not cause issues
      expect(() => {
        messageBus.publish('cleanup:test', { test: 2 });
      }).not.toThrow();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle rapid subscribe/unsubscribe cycles', () => {
      const handlers = Array.from({ length: 10 }, () => vi.fn());
      const unsubscribers = handlers.map(handler => 
        messageBus.subscribe('rapid:test', handler)
      );
      
      messageBus.publish('rapid:test', { iteration: 1 });
      handlers.forEach(handler => expect(handler).toHaveBeenCalledTimes(1));
      
      // Unsubscribe half
      unsubscribers.slice(0, 5).forEach(unsub => unsub());
      
      messageBus.publish('rapid:test', { iteration: 2 });
      handlers.slice(0, 5).forEach(handler => expect(handler).toHaveBeenCalledTimes(1));
      handlers.slice(5).forEach(handler => expect(handler).toHaveBeenCalledTimes(2));
    });

    it('should support wildcard-like behavior through multiple subscriptions', () => {
      const allHandler = vi.fn();
      const specificHandler = vi.fn();
      
      // Subscribe to multiple related topics
      messageBus.subscribe('cv:distill', specificHandler);
      messageBus.subscribe('cv:optimize', specificHandler);
      messageBus.subscribe('cv:process', allHandler);
      
      messageBus.publish('cv:distill', { type: 'distill' });
      messageBus.publish('cv:optimize', { type: 'optimize' });
      messageBus.publish('cv:process', { type: 'process' });
      
      expect(specificHandler).toHaveBeenCalledTimes(2);
      expect(allHandler).toHaveBeenCalledTimes(1);
    });
  });
});
