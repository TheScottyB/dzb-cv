import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'link';

/**
 * Button size types
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button props interface
 * Extends the native button HTML attributes with custom props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Content to be displayed inside the button
   */
  children: React.ReactNode;

  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Optional CSS class name to add to the button
   */
  className?: string;

  /**
   * Makes the button look and behave as being pressed
   * @default false
   */
  active?: boolean;
}

/**
 * Button component
 *
 * A versatile and accessible button component that supports multiple
 * variants, sizes, and states. It can be used for actions, form submissions,
 * links styled as buttons, etc.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('Clicked!')}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  active = false,
  disabled = false,
  type = 'button',
  ...rest
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth ? styles.fullWidth : '',
    active ? styles.active : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} disabled={disabled} type={type} {...rest}>
      {children}
    </button>
  );
};

export default Button;
