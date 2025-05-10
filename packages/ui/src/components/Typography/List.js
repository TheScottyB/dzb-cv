import React from 'react';

/**
 * Reusable List component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - List items
 * @param {'ordered' | 'unordered'} [props.variant='unordered'] - List type
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Rendered list component
 */
export const List = ({ children, variant = 'unordered', className = '', ...props }) => {
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
export const ListItem = ({ children, className = '', ...props }) => {
  return (
    <li className={`list-item ${className}`} {...props}>
      {children}
    </li>
  );
};
