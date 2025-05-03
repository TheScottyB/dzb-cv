import React from 'react';
import styles from './Heading.module.css';

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
    
    const headingClasses = [
      styles.heading,
      styles[`size-${actualSize}`],
      weight ? styles[`weight-${weight}`] : '',
      truncate ? styles.truncate : '',
      className,
    ].filter(Boolean).join(' ');
    
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

