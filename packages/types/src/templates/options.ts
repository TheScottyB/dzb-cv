/**
 * Template rendering options
 * @interface TemplateRenderOptions
 */
export interface TemplateRenderOptions {
  /** Output format */
  format?: 'pdf' | 'html' | 'markdown';
  /** Include custom styles */
  includeStyles?: boolean;
  /** Template-specific configuration */
  config?: Record<string, unknown>;
}

/**
 * Template customization options
 * @interface TemplateCustomization
 */
export interface TemplateCustomization {
  /** Custom CSS styles */
  styles?: string;
  /** Font configuration */
  fonts?: {
    /** Primary font family */
    primary?: string;
    /** Secondary font family */
    secondary?: string;
    /** Font sizes in px or rem */
    sizes?: {
      /** Heading font size */
      heading?: string;
      /** Subheading font size */
      subheading?: string;
      /** Body text font size */
      body?: string;
    };
  };
  /** Color scheme */
  colors?: {
    /** Primary color */
    primary?: string;
    /** Secondary color */
    secondary?: string;
    /** Accent color */
    accent?: string;
    /** Text color */
    text?: string;
    /** Background color */
    background?: string;
  };
}

