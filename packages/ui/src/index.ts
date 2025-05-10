/**
 * @dzb-cv/ui
 * UI components for the CV generation system
 */

// Direct exports from Typography for easier imports
export { Heading } from './components/Typography/Heading.js';
export { Text } from './components/Typography/Text.js';
export { List, ListItem } from './components/Typography/List.js';
export { Typography } from './components/Typography/index.js';

// Export all from Typography for type consistency
export * from './components/Typography/index.js';

// Re-export component types for direct access
export type {
  HeadingProps,
  HeadingLevel,
  HeadingSize,
  TextProps,
  TextElement,
  TextSize,
  ListProps,
  ListItemProps,
  ListType,
} from './components/Typography/index.js';

// No other components are currently implemented
