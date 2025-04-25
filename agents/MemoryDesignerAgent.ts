export class MemoryDesignerAgent {
  constructor(options: any) {
    console.info('[MemoryDesignerAgent] Initialized.', options);
  }
  setInitialTask(task: string) {
    console.info(`[MemoryDesignerAgent] Initial task assigned: ${task}`);
  }
}

