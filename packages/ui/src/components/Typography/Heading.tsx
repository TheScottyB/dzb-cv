
import React from 'react';
import styles from './Heading.module.css';

// Safer way to get a style class with fallback for testing environment
const getStyleClass = (styles: Record<string, string>, key: string): string => {
  if (!styles) return key; // Fallback for when styles object is undefined
  
  const value = styles[key];
  // Handle different types of values that might come from CSS modules
  if (typeof value === 'string') return value;
  if (value === undefined) return key; // Fallback for missing keys
  
  return String(value || key); // Ensure we always return a string
};

/**
 * Heading level variants (h1-h6)
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Heading size variants
 */
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * Props for the Heading component
 */
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The content of the heading
   */
  children: React.ReactNode;
  
  /**
   * The heading level (h1-h6)
   * @default 2
   */
  level?: HeadingLevel;
  
  /**
   * The size of the heading
   * @default Based on heading level
   */
  size?: HeadingSize;
  
  /**
   * Optional font weight
   */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Whether the text should be truncated with an ellipsis if it overflows
   * @default false
   */
  truncate?: boolean;
}

/**
 * Heading component for section headings and titles.
 * Renders as semantic h1-h6 elements with customizable styling.
 * 
 * @example
 * ```tsx
 * <Heading level={1} size="2xl">Page Title</Heading>
 * <Heading level={2}>Section Heading</Heading>
 * <Heading level={3} weight="medium">Subsection</Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      children,
      level = 2,
      size,
      weight,
      truncate = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Default size based on heading level if not specified
    const defaultSize = () => {
      switch (level) {
        case 1: return '3xl';
        case 2: return '2xl';
        case 3: return 'xl';
        case 4: return 'lg';
        case 5: return 'md';
        case 6: return 'sm';
        default: return 'lg';
      }
    };
    
    const actualSize = size || defaultSize();
    
    // Safely get style classes with fallbacks
    const headingClasses = [
      // Get base heading class
      getStyleClass(styles, 'heading'),
      
      // Get size class with dynamic key
      actualSize ? getStyleClass(styles, `size-${actualSize}`) : '',
      
      // Get weight class if weight is provided
      weight ? getStyleClass(styles, `weight-${weight}`) : '',
      
      // Get truncate class if needed
      truncate ? getStyleClass(styles, 'truncate') : '',
      
      // Add custom className if provided
      className || '',
    ]
      .filter(Boolean) // Remove empty strings
      .join(' '); // Join with spaces
    
    const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    return (
      <HeadingTag 
        ref={ref} 
        className={headingClasses}
        {...props}
      >
        {children}
      </HeadingTag>
    );
  }
);

Heading.displayName = 'Heading';

