/**
 * AgentMessageBus: A shared pub/sub bus for agent-to-agent messaging.
 * Agents can subscribe to topics, publish events, or send direct messages.
 * One instance should be shared among all agents.
 *
 * TODO: Persistent queue, async delivery,
 * TODO: Wildcard and pattern subscriptions.
 */

type Handler = (payload: any) => void;
type UnsubscribeFn = () => void;

export class AgentMessageBus {
  private topicHandlers: Map<string, Set<Handler>> = new Map();
  private directHandlers: Map<string, Set<Handler>> = new Map();

  /**
   * Subscribe to a topic or direct agent channel.
   * @param topic E.g., "task:NEW" or agentName
   * @param handler Handler for delivered payloads.
   * @returns Unsubscribe function.
   */
  subscribe(topic: string, handler: Handler): UnsubscribeFn {
    const isDirect = topic.startsWith('@');
    const map = isDirect ? this.directHandlers : this.topicHandlers;
    if (!map.has(topic)) map.set(topic, new Set());
    map.get(topic)!.add(handler);
    return () => {
      map.get(topic)!.delete(handler);
      // Clean up empty sets for memory.
      if (map.get(topic)!.size === 0) map.delete(topic);
    };
  }

  /**
   * Publish a message to all handlers of given topic.
   * @param topic E.g., "status:update" or a domain/phase
   * @param payload Any event data.
   */
  publish(topic: string, payload: any): void {
    const handlers = this.topicHandlers.get(topic);
    if (handlers) {
      for (const h of handlers) h(payload);
    }
    // TODO: Wildcard/broadcast to e.g. "*" or "task:*"
  }

  /**
   * Directly deliver a message to a named agent.
   * @param agentName The unique agent identifier (prefix with "@")
   * @param payload Any object.
   */
  publishDirect(agentName: string, payload: any): void {
    const handlers = this.directHandlers.get('@' + agentName);
    if (handlers) {
      for (const h of handlers) h(payload);
    }
  }

  // TODO: Support async/queued delivery for reliability at scale.
  // TODO: Add "once" subscription for one-shot handlers.
}
