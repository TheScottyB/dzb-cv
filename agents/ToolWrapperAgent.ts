export class ToolWrapperAgent {
  constructor(options: any) {
    console.info('[ToolWrapperAgent] Initialized.', options);
  }
  setInitialTask(task: string) {
    console.info(`[ToolWrapperAgent] Initial task assigned: ${task}`);
  }
}

