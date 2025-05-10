import React from 'react';
import styles from './Text.module.css';

/**
 * Text element variants
 */
export type TextElement = 'p' | 'span' | 'div';

/**
 * Text size variants
 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Text component
 */
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The content of the text element
   */
  children: React.ReactNode;

  /**
   * The HTML element to render
   * @default 'p'
   */
  as?: TextElement;

  /**
   * The size of the text
   * @default 'md'
   */
  size?: TextSize;

  /**
   * The font weight of the text
   */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

  /**
   * Whether the text should be italic
   * @default false
   */
  italic?: boolean;

  /**
   * Whether the text should be truncated with an ellipsis if it overflows
   * @default false
   */
  truncate?: boolean;

  /**
   * The maximum number of lines to display before truncating with an ellipsis
   */
  lineClamp?: number;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';

  /**
   * Text color variant
   */
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Text component for paragraphs, spans, and other text elements.
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="medium">Regular paragraph text</Text>
 * <Text as="span" color="muted" size="sm">Small muted text</Text>
 * <Text lineClamp={2}>This text will be truncated after 2 lines with an ellipsis.</Text>
 * ```
 */
const _Text = <T extends HTMLElement = HTMLParagraphElement>(
  {
    children,
    as = 'p',
    size = 'md',
    weight,
    italic = false,
    truncate = false,
    lineClamp,
    align,
    color = 'default',
    className = '',
    ...props
  }: TextProps & { as?: TextElement },
  ref: React.ForwardedRef<T>
) => {
  const TextTag = as as React.ElementType;

  const textClasses = [
    styles.text,
    styles[`size-${size}`],
    weight ? styles[`weight-${weight}`] : '',
    italic ? styles.italic : '',
    truncate ? styles.truncate : '',
    lineClamp ? styles.lineClamp : '',
    align ? styles[`align-${align}`] : '',
    color ? styles[`color-${color}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textStyle = lineClamp ? ({ '--line-clamp': lineClamp } as React.CSSProperties) : undefined;

  return (
    <TextTag ref={ref} className={textClasses} style={textStyle} {...props}>
      {children}
    </TextTag>
  );
};

_Text.displayName = 'Text';
export const Text = React.forwardRef(_Text) as <T extends HTMLElement = HTMLParagraphElement>(
  props: TextProps & { as?: TextElement } & { ref?: React.Ref<T> }
) => React.ReactElement | null;
