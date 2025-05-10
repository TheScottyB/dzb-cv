export class DocumentationAgent {
  constructor(options: any) {
    console.info('[DocumentationAgent] Initialized.', options);
  }
  setInitialTask(task: string) {
    console.info(`[DocumentationAgent] Initial task assigned: ${task}`);
  }
}
