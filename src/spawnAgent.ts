/**
 * Modular utility to spawn agent instances by role name.
 * Extend this mapping as new agents are added!
 */

import { ToolWrapperAgent } from '../agents/ToolWrapperAgent';
import { AgentScaffolderAgent } from '../agents/AgentScaffolderAgent';
import { RuntimeOrchestratorAgent } from '../agents/RuntimeOrchestratorAgent';
import { MemoryDesignerAgent } from '../agents/MemoryDesignerAgent';
import { DocumentationAgent } from '../agents/DocumentationAgent';

// Map role names (as used in registry/seeds) to agent classes.
const AGENT_CLASSES: Record<string, any> = {
  ToolWrapperAgent,
  AgentScaffolderAgent,
  RuntimeOrchestratorAgent,
  MemoryDesignerAgent,
  DocumentationAgent,
  // TODO: Add QAInspectorAgent, SDKChangeMonitorAgent, etc.
};

export function spawnAgent(role: string, options: object): any {
  const AgentClass = AGENT_CLASSES[role];
  if (!AgentClass) {
    throw new Error(
      `[spawnAgent] Unknown agent role: '${role}'. Please add it to AGENT_CLASSES mapping.`
    );
  }
  return new AgentClass(options);
}

// TODO: Support dynamic import for plugin/extension agents.
