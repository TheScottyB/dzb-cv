export interface Config {
  storage: {
    type: 'memory' | 'file' | 's3';
    path?: string;
    bucket?: string;
  };
  templates: {
    path: string;
    defaultTemplate: string;
  };
  pdf: {
    outputPath: string;
    defaultFormat: 'A4' | 'Letter';
  };
}

