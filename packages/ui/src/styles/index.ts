/**
 * Exports global styles, theme variables, and utilities
 */

export const theme = {
  colors: {
    primary: '#3182ce',
    secondary: '#718096',
    success: '#38a169',
    danger: '#e53e3e',
    warning: '#ecc94b',
    info: '#4299e1',
    light: '#f7fafc',
    dark: '#1a202c',

    // Gray scale
    gray100: '#f7fafc',
    gray200: '#edf2f7',
    gray300: '#e2e8f0',
    gray400: '#cbd5e0',
    gray500: '#a0aec0',
    gray600: '#718096',
    gray700: '#4a5568',
    gray800: '#2d3748',
    gray900: '#1a202c',

    // Brand colors
    primaryLight: '#4299e1',
    primaryDark: '#2b6cb0',

    // Text
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textDisabled: '#a0aec0',
  },

  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    heading: 'inherit',
    monospace:
      'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  spaces: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem', // 48px
  },

  borderRadius: {
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Utility function to get a specific theme value
 */
export const getThemeValue = (path: string, defaultValue?: any): any => {
  const keys = path.split('.');
  let value = theme as any;

  for (const key of keys) {
    if (value === undefined) return defaultValue;
    value = value[key];
  }

  return value !== undefined ? value : defaultValue;
};

/**
 * Utility function to create responsive styles
 */
export const responsive = (
  property: string,
  values: Record<string, string | number>
): Record<string, string> => {
  const result: Record<string, string> = {};

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'base') {
      result[property] = value.toString();
    } else {
      const breakpointValue = getThemeValue(`breakpoints.${breakpoint}`);
      if (breakpointValue) {
        result[`@media (min-width: ${breakpointValue})`] = {
          [property]: value.toString(),
        } as any;
      }
    }
  });

  return result;
};
