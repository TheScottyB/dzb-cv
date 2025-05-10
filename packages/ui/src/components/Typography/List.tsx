import React from 'react';
import type { JSX } from 'react';

/**
 * Reusable List component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - List items
 * @param {'ordered' | 'unordered'} [props.variant='unordered'] - List type
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Rendered list component
 */
export type ListType = 'ordered' | 'unordered';
export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  variant?: ListType;
  className?: string;
}
export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  className?: string;
}

export const List = ({
  children,
  variant = 'unordered',
  className = '',
  ...props
}: ListProps): JSX.Element => {
  const ListComponent = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <ListComponent className={`list ${className}`} {...props}>
      {children}
    </ListComponent>
  );
};

/**
 * List item component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - List item content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Rendered list item
 */
export const ListItem = ({ children, className = '', ...props }: ListItemProps): JSX.Element => {
  return (
    <li className={`list-item ${className}`} {...props}>
      {children}
    </li>
  );
};
