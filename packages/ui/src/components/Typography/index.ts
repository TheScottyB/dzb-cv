// Direct imports
import { Heading } from './Heading.js';
import { Text } from './Text.js';
import { List, ListItem } from './List.js';

// Re-export components
export { Heading } from './Heading.js';
export { Text } from './Text.js';
export { List, ListItem } from './List.js';

// Type exports
export type { HeadingProps, HeadingLevel, HeadingSize } from './Heading.js';

export type { TextProps, TextElement, TextSize } from './Text.js';

export type { ListProps, ListItemProps, ListType } from './List.js';

// Define Typography object type
export interface TypographyComponents {
  Heading: typeof Heading;
  Text: typeof Text;
  List: typeof List;
  ListItem: typeof ListItem;
}

// Re-export all components as a convenience object
export const Typography: TypographyComponents = {
  Heading,
  Text,
  List,
  ListItem,
};
