declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: string[];
  }

  interface ConversionOptions {
    buffer?: Buffer;
    path?: string;
    styleMap?: string[];
  }

  function convertToHtml(options: ConversionOptions): Promise<ConversionResult>;

  export { convertToHtml, ConversionResult, ConversionOptions };
  export default { convertToHtml };
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: any;
    text: string;
    version: string;
  }

  function parse(
    dataBuffer: Buffer | ArrayBuffer,
    options?: {
      pagerender?: (pageData: any) => string;
      max?: number;
      version?: string;
    },
  ): Promise<PDFData>;

  export = parse;
}
