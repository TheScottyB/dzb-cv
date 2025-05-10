import type { CVData } from '../cv/base.js';
import type { PDFGenerationOptions } from '../pdf/index.js';

/**
 * Represents a CV template
 * @interface Template
 */
export interface Template {
  /** Unique identifier for the template */
  id: string;
  /** Display name of the template */
  name: string;
  /** Template description */
  description: string;
  /** Render CV data using this template */

  render(_data: CVData, _options?: PDFGenerationOptions): string;
  /** Get template-specific styles */
  getStyles(): string;
}

/**
 * Template metadata for template selection/management
 * @interface TemplateInfo
 */
export interface TemplateInfo {
  /** Template identifier */
  id: string;
  /** Display name */
  name: string;
  /** Template description */
  description: string;
  /** Template preview image URL */
  previewUrl?: string;
  /** Template category/type */
  category?: 'professional' | 'academic' | 'creative' | 'basic';
  /** Supported formats */
  formats?: Array<'pdf' | 'html' | 'markdown'>;
  /** Template tags for filtering */
  tags?: string[];
}
