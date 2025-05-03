export class PDFValidationError extends Error {
  constructor(
    message: string,
    public readonly details: {
      expected: unknown;
      actual: unknown;
      field: string;
      type: string;
    }
  ) {
    super(message);
    this.name = 'PDFValidationError';
  }

  toString(): string {
    return `${this.name}: ${this.message}\n` +
      `Type: ${this.details.type}\n` +
      `Field: ${this.details.field}\n` +
      `Expected: ${JSON.stringify(this.details.expected, null, 2)}\n` +
      `Actual: ${JSON.stringify(this.details.actual, null, 2)}`;
  }
}

export function createPDFValidationError(
  type: string,
  field: string,
  expected: unknown,
  actual: unknown
): PDFValidationError {
  return new PDFValidationError(
    `PDF validation failed for ${field}`,
    { type, field, expected, actual }
  );
}
