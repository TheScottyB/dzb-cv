// Basic validation types
export type ValidationRuleType = 'required' | 'format' | 'length' | 'range' | 'custom';

export type ValidatorFunction<T> = (value: T) => boolean | Promise<boolean>;

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation rules
export interface ValidationRule<T = unknown> {
  field: string;
  type: ValidationRuleType;
  message: string;
  options?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    format?: string;
    validator?: ValidatorFunction<T>;
  };
}

// Composable validation rules
export type ComposedValidationRule<T> = ValidationRule<T> & {
  compose?: ValidationRule<T>[];
};

// Section-specific validation
export interface CVSectionValidation {
  section: string;
  rules: Array<ValidationRule | ComposedValidationRule<unknown>>;
  isRequired?: boolean;
  dependsOn?: string[];
}

// Validation context and schema
export interface ValidationContext {
  strict?: boolean;
  locale?: string;
  mode?: 'sync' | 'async';
  customValidators?: Record<string, ValidatorFunction<unknown>>;
}

export interface ValidationSchema {
  rules: Array<ValidationRule | ComposedValidationRule<unknown>>;
  sections?: CVSectionValidation[];
  context?: ValidationContext;
}

// Type-safe validation helpers
export type TypedValidationRule<T> = Omit<ValidationRule<T>, 'field'> & {
  field: keyof T;
};

export interface TypedValidationResult<T> extends ValidationResult {
  data: Partial<T>;
}

// Validator interfaces
export interface Validator<T> {
  validate(data: Partial<T>): ValidationError[];
  getFirstErrorMessage(data: Partial<T>): string | null;
}

export interface DataValidator<T> {
  validate: (data: T) => ValidationResult;
  addRule: (rule: ValidationRule<T>) => void;
  removeRule: (field: string) => void;
}
