/**
 * Validation type definitions for CV data
 */

// Core validation types
export type ValidationRuleType = 'required' | 'format' | 'length' | 'range' | 'custom';

export type ValidatorFunction<T> = (value: T) => boolean | Promise<boolean>;

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

// Validation result types
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

// Section-specific validation rules
export interface CVSectionValidation {
  section: string;
  rules: Array<ValidationRule | ComposedValidationRule<unknown>>;
  isRequired?: boolean;
  dependsOn?: string[];
}

// Validation context
export interface ValidationContext {
  strict?: boolean;
  locale?: string;
  mode?: 'sync' | 'async';
  customValidators?: Record<string, ValidatorFunction<unknown>>;
}

// Validation schema
export interface ValidationSchema {
  rules: Array<ValidationRule | ComposedValidationRule<unknown>>;
  sections?: CVSectionValidation[];
  context?: ValidationContext;
}

// Helper type for creating type-safe validation rules
export type TypedValidationRule<T> = Omit<ValidationRule<T>, 'field'> & {
  field: keyof T;
};

// Helper type for validation results with typed data
export interface TypedValidationResult<T> extends ValidationResult {
  data: Partial<T>;
}

export interface DataValidator<T> {
  validate: (data: T) => ValidationResult;
  addRule: (rule: ValidationRule<T>) => void;
  removeRule: (field: string) => void;
}
