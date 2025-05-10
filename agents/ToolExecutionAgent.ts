/**
 * ToolExecutionAgent: Requests execution of named tools from ToolWrapperAgent.
 * Future: To support message-driven execution, richer error/status logic,
 * and agent communication patterns.
 */

export class ToolExecutionAgent {
  private registry: Record<string, any>;
  private logPrefix: string;

  constructor(options: { registry: Record<string, any> }) {
    this.registry = options.registry;
    this.logPrefix = '[ToolExecutionAgent]';
    console.info(`${this.logPrefix} Initialized.`, options);
  }

  /**
   * Executes a tool by name using ToolWrapperAgent from the registry.
   * @param toolName Name of the registered tool.
   * @param args Arguments to invoke tool with.
   * @returns The result of tool invocation.
   */
  executeTool(toolName: string, args: any[]): any {
    const toolWrapper = this.registry['ToolWrapperAgent'];
    if (!toolWrapper || typeof toolWrapper.getTool !== 'function') {
      const msg = `${this.logPrefix} ToolWrapperAgent unavailable or missing getTool().`;
      console.error(msg);
      throw new Error(msg);
    }

    const toolFn = toolWrapper.getTool(toolName);
    if (!toolFn) {
      const msg = `${this.logPrefix} Tool "${toolName}" not found in ToolWrapperAgent.`;
      console.error(msg);
      throw new Error(msg);
    }
    try {
      const result = toolFn(...args);
      console.info(`${this.logPrefix} Called "${toolName}" with args:`, args, 'Returned:', result);
      return result;
    } catch (err) {
      console.error(`${this.logPrefix} Error invoking "${toolName}":`, err);
      throw err;
    }
  }

  /**
   * Accept initial or assigned atomic task from Foreman or system.
   * Logs for assignment tracking.
   */
  setInitialTask(description: string): void {
    console.info(`${this.logPrefix} Initial task assigned: ${description}`);
    // TODO: In future, store/track task and report status.
  }

  // TODO: Implement agent communication/message handlers.
  // TODO: Implement richer status/error tracking.
}
