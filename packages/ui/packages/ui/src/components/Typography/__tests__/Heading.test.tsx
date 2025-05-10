import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Heading } from '../Heading';

describe('Heading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<Heading>Test Heading</Heading>);
    
    const heading = screen.getByText('Test Heading');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2'); // Default level is 2
  });

  it('renders different heading levels', () => {
    const { rerender } = render(<Heading level={1}>Heading 1</Heading>);
    expect(screen.getByText('Heading 1').tagName).toBe('H1');
    
    rerender(<Heading level={2}>Heading 2</Heading>);
    expect(screen.getByText('Heading 2').tagName).toBe('H2');
    
    rerender(<Heading level={3}>Heading 3</Heading>);
    expect(screen.getByText('Heading 3').tagName).toBe('H3');
    
    rerender(<Heading level={4}>Heading 4</Heading>);
    expect(screen.getByText('Heading 4').tagName).toBe('H4');
    
    rerender(<Heading level={5}>Heading 5</Heading>);
    expect(screen.getByText('Heading 5').tagName).toBe('H5');
    
    rerender(<Heading level={6}>Heading 6</Heading>);
    expect(screen.getByText('Heading 6').tagName).toBe('H6');
  });

  it('applies default size based on heading level', () => {
    const { rerender } = render(<Heading level={1}>H1 Heading</Heading>);
    let heading = screen.getByText('H1 Heading');
    expect(heading).toHaveClass('size-3xl');
    
    rerender(<Heading level={2}>H2 Heading</Heading>);
    heading = screen.getByText('H2 Heading');
    expect(heading).toHaveClass('size-2xl');
    
    rerender(<Heading level={3}>H3 Heading</Heading>);
    heading = screen.getByText('H3 Heading');
    expect(heading).toHaveClass('size-xl');
    
    rerender(<Heading level={4}>H4 Heading</Heading>);
    heading = screen.getByText('H4 Heading');
    expect(heading).toHaveClass('size-lg');
    
    rerender(<Heading level={5}>H5 Heading</Heading>);
    heading = screen.getByText('H5 Heading');
    expect(heading).toHaveClass('size-md');
    
    rerender(<Heading level={6}>H6 Heading</Heading>);
    heading = screen.getByText('H6 Heading');
    expect(heading).toHaveClass('size-sm');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Referenced Heading</Heading>);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('H2');
    expect(ref.current?.textContent).toBe('Referenced Heading');
  });

  it('applies custom className correctly', () => {
    render(<Heading className="my-custom-heading">Custom Class Heading</Heading>);
    const heading = screen.getByText('Custom Class Heading');
    expect(heading).toHaveClass('my-custom-heading');
  });

  it('has correct accessibility semantics by default', () => {
    render(<Heading level={1}>Accessible Heading</Heading>);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Accessible Heading');
  });
});
