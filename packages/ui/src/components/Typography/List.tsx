import React from 'react';
import styles from './List.module.css';

/**
 * List type variants
 */
export type ListType = 'ordered' | 'unordered';

/**
 * Props for the List component
 */
export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  /**
   * The list items
   */
  children: React.ReactNode;
  
  /**
   * The type of list
   * @default 'unordered'
   */
  type?: ListType;
  
  /**
   * Marker type for the list items
   */
  marker?: 'disc' | 'circle' | 'square' | 'decimal' | 'none';
  
  /**
   * Whether list items should be spaced apart
   * @default false
   */
  spaced?: boolean;
  
  /**
   * Whether the list should be rendered horizontally
   * @default false
   */
  horizontal?: boolean;
}

/**
 * List Item props
 */
export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /**
   * The content of the list item
   */
  children: React.ReactNode;
}

/**
 * List component for ordered and unordered lists
 * 
 * @example
 * ```tsx
 * <List type="unordered" marker="disc" spaced>
 *   <List.Item>First item</List.Item>
 *   <List.Item>Second item</List.Item>
 *   <List.Item>Third item</List.Item>
 * </List>
 * ```
 */
export const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  (
    {
      children,
      type = 'unordered',
      marker,
      spaced = false,
      horizontal = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const ListTag = type === 'ordered' ? 'ol' : 'ul';
    
    const listClasses = [
      styles.list,
      marker ? styles[`marker-${marker}`] : '',
      spaced ? styles.spaced : '',
      horizontal ? styles.horizontal : '',
      className,
    ].filter(Boolean).join(' ');
    
    return (
      <ListTag 
        ref={ref as any} 
        className={listClasses}
        {...props}
      >
        {children}
      </ListTag>
    );
  }
);

/**
 * List item component
 */
export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const itemClasses = [
      styles.item,
      className,
    ].filter(Boolean).join(' ');
    
    return (
      <li 
        ref={ref} 
        className={itemClasses}
        {...props}
      >
        {children}
      </li>
    );
  }
);

List.displayName = 'List';
ListItem.displayName = 'List.Item';

