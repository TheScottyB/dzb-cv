/**
 * Theme-related type definitions
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface ThemeSizing {
  space: Record<string, string>;
  fontSizes: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  sizing: ThemeSizing;
  isDark: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
