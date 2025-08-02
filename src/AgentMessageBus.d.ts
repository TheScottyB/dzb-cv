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
export declare class AgentMessageBus {
    private topicHandlers;
    private directHandlers;
    /**
     * Subscribe to a topic or direct agent channel.
     * @param topic E.g., "task:NEW" or agentName
     * @param handler Handler for delivered payloads.
     * @returns Unsubscribe function.
     */
    subscribe(topic: string, handler: Handler): UnsubscribeFn;
    /**
     * Publish a message to all handlers of given topic.
     * @param topic E.g., "status:update" or a domain/phase
     * @param payload Any event data.
     */
    publish(topic: string, payload: any): void;
    /**
     * Directly deliver a message to a named agent.
     * @param agentName The unique agent identifier (prefix with "@")
     * @param payload Any object.
     */
    publishDirect(agentName: string, payload: any): void;
}
export {};
//# sourceMappingURL=AgentMessageBus.d.ts.map