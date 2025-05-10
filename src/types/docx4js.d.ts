declare module 'docx4js' {
  export class Document {
    static load(buffer: Buffer): Promise<Document>;
    getText(): Promise<string>;
  }
} 