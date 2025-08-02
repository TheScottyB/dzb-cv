/**
 * AgentMessageBus: A shared pub/sub bus for agent-to-agent messaging.
 * Agents can subscribe to topics, publish events, or send direct messages.
 * One instance should be shared among all agents.
 *
 * TODO: Persistent queue, async delivery,
 * TODO: Wildcard and pattern subscriptions.
 */
// Debug logging configuration
const DEBUG = process.env.DEBUG === 'true' || process.env.VERBOSE === 'true';
const log = {
    debug: (...args) => DEBUG && console.log('[MessageBus DEBUG]', ...args),
    info: (...args) => console.log('[MessageBus INFO]', ...args),
    warn: (...args) => console.warn('[MessageBus WARN]', ...args),
    error: (...args) => console.error('[MessageBus ERROR]', ...args)
};
export class AgentMessageBus {
    topicHandlers = new Map();
    directHandlers = new Map();
    /**
     * Subscribe to a topic or direct agent channel.
     * @param topic E.g., "task:NEW" or agentName
     * @param handler Handler for delivered payloads.
     * @returns Unsubscribe function.
     */
    subscribe(topic, handler) {
        const isDirect = topic.startsWith('@');
        const map = isDirect ? this.directHandlers : this.topicHandlers;
        if (!map.has(topic))
            map.set(topic, new Set());
        map.get(topic).add(handler);
        log.debug(`Subscribed to ${isDirect ? 'direct' : 'topic'}: ${topic} (${map.get(topic).size} handlers)`);
        return () => {
            map.get(topic).delete(handler);
            log.debug(`Unsubscribed from ${isDirect ? 'direct' : 'topic'}: ${topic} (${map.get(topic).size} handlers remaining)`);
            // Clean up empty sets for memory.
            if (map.get(topic).size === 0)
                map.delete(topic);
        };
    }
    /**
     * Publish a message to all handlers of given topic.
     * @param topic E.g., "status:update" or a domain/phase
     * @param payload Any event data.
     */
    publish(topic, payload) {
        const handlers = this.topicHandlers.get(topic);
        log.debug(`Publishing to topic: ${topic} (${handlers?.size || 0} handlers)`);
        if (handlers) {
            for (const h of handlers) {
                try {
                    h(payload);
                }
                catch (error) {
                    log.error(`Error in handler for topic ${topic}:`, error);
                }
            }
        }
        else {
            log.debug(`No handlers found for topic: ${topic}`);
        }
        // TODO: Wildcard/broadcast to e.g. "*" or "task:*"
    }
    /**
     * Directly deliver a message to a named agent.
     * @param agentName The unique agent identifier (prefix with "@")
     * @param payload Any object.
     */
    publishDirect(agentName, payload) {
        const handlers = this.directHandlers.get('@' + agentName);
        log.debug(`Publishing direct to agent: ${agentName} (${handlers?.size || 0} handlers)`);
        if (handlers) {
            for (const h of handlers) {
                try {
                    h(payload);
                }
                catch (error) {
                    log.error(`Error in direct handler for agent ${agentName}:`, error);
                }
            }
        }
        else {
            log.debug(`No handlers found for agent: ${agentName}`);
        }
    }
}
//# sourceMappingURL=AgentMessageBus.js.map