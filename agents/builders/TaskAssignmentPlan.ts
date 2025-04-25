/**
 * Task status options for tracking progress of atomic work units.
 */
export enum TaskStatus {
  Unassigned = "UNASSIGNED",
  Assigned = "ASSIGNED",
  InReview = "IN_REVIEW",
  Complete = "COMPLETE",
  Blocked = "BLOCKED",
  NeedsRevision = "NEEDS_REVISION"
}

/**
 * Task object for Foreman and agent team tracking.
 */
export interface Task {
  id: string;
  description: string;
  assignee?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  metadata?: any;
  blockedReason?: string;
}

/**
 * Task assignment and tracking plan for the Construction Foreman agent.
 * Handles all assignment, state change, and reporting logic for builder tasks.
 *
 * TODO: Automate population of initial tasks by parsing the blueprint.md.
 */
export class TaskAssignmentPlan {
  private tasks: Task[] = [];

  constructor(blueprintInfoOrInitial?: Array<Partial<Task>>) {
    // Manually seed from array if provided.
    if (blueprintInfoOrInitial && Array.isArray(blueprintInfoOrInitial)) {
      this.tasks = blueprintInfoOrInitial.map((data, i) => ({
        id: data.id || `t_${Date.now()}_${i}`,
        description: data.description || "",
        status: data.status || TaskStatus.Unassigned,
        createdAt: data.createdAt || new Date().toISOString(),
        ...data,
      }));
    }
    // TODO: Later: Parse blueprint/md automatically for initial assignments
  }

  /**
   * Adds a new task and returns that task.
   */
  addTask(description: string, metadata?: any): Task {
    const id = `t_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const task: Task = {
      id,
      description,
      status: TaskStatus.Unassigned,
      createdAt: new Date().toISOString(),
      metadata,
    };
    this.tasks.push(task);
    return task;
  }

  /**
   * Returns an array of all unassigned tasks.
   */
  getUnassigned(): Task[] {
    return this.tasks.filter(t => t.status === TaskStatus.Unassigned);
  }

  /**
   * Assigns a task to an agent by name.
   */
  assignTask(taskId: string, agentName: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.assignee = agentName;
      task.status = TaskStatus.Assigned;
    }
  }

  /**
   * Marks a task as complete, recording completion time.
   */
  markComplete(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.Complete;
      task.completedAt = new Date().toISOString();
    }
  }

  /**
   * Marks a task as requiring review.
   */
  markNeedsReview(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.InReview;
    }
  }

  /**
   * Marks a task as blocked, optionally providing a reason.
   */
  markBlocked(taskId: string, reason: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.Blocked;
      task.blockedReason = reason;
    }
  }

  /**
   * Returns all tasks currently assigned to a given agent.
   */
  getTasksByAssignee(agentName: string): Task[] {
    return this.tasks.filter(t => t.assignee === agentName);
  }

  /**
   * Computes a summary: totals, counts by status, and by agent.
   */
  summarize(): {
    total: number;
    byStatus: Record<string, number>;
    byAgent: Record<string, number>;
  } {
    const byStatus: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    for (const t of this.tasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      if (t.assignee) byAgent[t.assignee] = (byAgent[t.assignee] || 0) + 1;
    }
    return {
      total: this.tasks.length,
      byStatus,
      byAgent,
    };
  }

  /**
   * Serialize plan to JSON.
   */
  toJSON(): string {
    return JSON.stringify(this.tasks, null, 2);
  }

  /**
   * Load plan from JSON string.
   */
  static fromJSON(json: string): TaskAssignmentPlan {
    // Assumes JSON is an array of Task
    const arr: Task[] = JSON.parse(json);
    const plan = new TaskAssignmentPlan();
    plan.tasks = arr;
    return plan;
  }

  /**
   * Returns a shallow copy of all tasks.
   */
  getAllTasks(): Task[] {
    return [...this.tasks];
  }
}

// TODO: Add method to parse blueprint.md directives and auto-populate task plan.
// TODO: Add support for agent priority queues and batch assignment.

