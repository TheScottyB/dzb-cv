export class ConstructionForeman {
  constructor(options: any) {
    console.info('[ConstructionForeman] Initialized.', options);
  }
  setInitialTask(task: string) {
    console.info(`[ConstructionForeman] Initial task assigned: ${task}`);
  }
}

