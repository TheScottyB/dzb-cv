import { TaskAssignmentPlan } from './builders/TaskAssignmentPlan';

/**
 * ConstructionForeman seeds atomic tasks, assigns to agents, and tracks workflow state.
 * TODO: Auto-parse blueprint.md to populate initial task list.
 * TODO: Implement orchestration loop for task/agent lifecycle beyond initial seed.
 */
export class ConstructionForeman {
  private taskPlan: TaskAssignmentPlan;
  private builders: { [role: string]: any };
  private logger: Console;

  constructor(options: {
    builders: { [role: string]: any };
    taskPlan: TaskAssignmentPlan;
    logger?: Console;
  }) {
    this.taskPlan = options.taskPlan;
    this.builders = options.builders || {};
    this.logger = options.logger || console;
    this.logger.info('[ConstructionForeman] Initialized.', {
      builders: Object.keys(this.builders),
    });
    this.seedInitialTasks();
  }

  /**
   * Seeds the first wave of builder tasks per project blueprint and assigns to agents.
   * See also: blueprint.md, section "Assign First Tasks".
   */
  private seedInitialTasks() {
    console.log('[ConstructionForeman] seedInitialTasks() running...');
    // TODO: Auto-parse blueprint.md for seed list.
    const seeds = [
      {
        role: 'ToolWrapperAgent',
        desc: 'Wrap 1 dummy utility (extract_text()) as Open Agent SDK tool.',
      },
      { role: 'AgentScaffolderAgent', desc: 'Create base template for a "basic research agent."' },
      {
        role: 'MemoryDesignerAgent',
        desc: 'Define first shared memory schema (agent_memory object).',
      },
    ];

    seeds.forEach(({ role, desc }) => {
      console.log(`[ConstructionForeman] Seeding and assigning: "${desc}" to ${role}`);
      const task = this.taskPlan.addTask(desc, { stage: 'initial', role });
      this.taskPlan.assignTask(task.id, role);
      this.logger.info(`[Foreman] Assigned '${desc}' to ${role} (taskId: ${task.id})`);
      if (this.builders[role] && typeof this.builders[role].setInitialTask === 'function') {
        this.builders[role].setInitialTask(desc);
        console.log(`[ConstructionForeman] Called setInitialTask on ${role}`);
      }
    });
    console.log('[ConstructionForeman] seedInitialTasks() complete.');
  }

  setInitialTask(task: string) {
    this.logger.info(`[ConstructionForeman] Initial task assigned: ${task}`);
  }
}
