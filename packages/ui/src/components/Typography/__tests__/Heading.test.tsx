import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { Heading } from '../Heading';
import styles from '../Heading.module.css';

// Safer way to get a style class with fallback for testing environment
const getStyleClass = (styles: Record<string, string>, key: string): string => {
  if (!styles) return key; // Fallback for when styles object is undefined
  const value = styles[key];
  if (typeof value === 'string') return value;
  if (value === undefined) return key;
  return String(value || key); // Ensure we always return a string
};

describe('Heading Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<Heading>Test Heading</Heading>);
    const heading = screen.getByText('Test Heading');
    expect(heading).toBeInTheDocument();
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
    expect(heading).toHaveClass(getStyleClass(styles, 'size-3xl'));

    rerender(<Heading level={2}>H2 Heading</Heading>);
    heading = screen.getByText('H2 Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-2xl'));

    rerender(<Heading level={3}>H3 Heading</Heading>);
    heading = screen.getByText('H3 Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-xl'));

    rerender(<Heading level={4}>H4 Heading</Heading>);
    heading = screen.getByText('H4 Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-lg'));

    rerender(<Heading level={5}>H5 Heading</Heading>);
    heading = screen.getByText('H5 Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-md'));

    rerender(<Heading level={6}>H6 Heading</Heading>);
    heading = screen.getByText('H6 Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-sm'));
  });

  it('applies custom size overriding the default', () => {
    const { rerender } = render(
      <Heading level={1} size="md">
        Small H1
      </Heading>
    );
    let heading = screen.getByText('Small H1');
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-md'));

    rerender(
      <Heading level={6} size="4xl">
        Large H6
      </Heading>
    );
    heading = screen.getByText('Large H6');
    expect(heading.tagName).toBe('H6');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-4xl'));
  });

  it('applies weight correctly', () => {
    render(<Heading weight="light">Light Heading</Heading>);
    expect(screen.getByText('Light Heading')).toHaveClass(getStyleClass(styles, 'weight-light'));

    render(<Heading weight="normal">Normal Heading</Heading>);
    expect(screen.getByText('Normal Heading')).toHaveClass(getStyleClass(styles, 'weight-normal'));

    render(<Heading weight="medium">Medium Heading</Heading>);
    expect(screen.getByText('Medium Heading')).toHaveClass(getStyleClass(styles, 'weight-medium'));

    render(<Heading weight="semibold">Semibold Heading</Heading>);
    expect(screen.getByText('Semibold Heading')).toHaveClass(
      getStyleClass(styles, 'weight-semibold')
    );

    render(<Heading weight="bold">Bold Heading</Heading>);
    expect(screen.getByText('Bold Heading')).toHaveClass(getStyleClass(styles, 'weight-bold'));
  });

  it('applies truncation correctly', () => {
    render(<Heading truncate>Truncated Heading</Heading>);
    const heading = screen.getByText('Truncated Heading');
    expect(heading).toHaveClass(getStyleClass(styles, 'truncate'));
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Referenced Heading</Heading>);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('H2');
    expect(ref.current?.textContent).toBe('Referenced Heading');
  });

  it('passes custom props correctly', () => {
    render(
      <Heading
        data-testid="custom-heading"
        aria-label="Important heading"
        role="heading"
        aria-level={2}
      >
        Custom Props Heading
      </Heading>
    );

    const heading = screen.getByTestId('custom-heading');
    expect(heading).toHaveAttribute('aria-label', 'Important heading');
    expect(heading).toHaveAttribute('role', 'heading');
    expect(heading).toHaveAttribute('aria-level', '2');
  });

  it('applies custom className correctly', () => {
    render(<Heading className="my-custom-heading">Custom Class Heading</Heading>);
    const heading = screen.getByText('Custom Class Heading');
    expect(heading).toHaveClass('my-custom-heading');
  });

  it('combines multiple styling props correctly', () => {
    render(
      <Heading level={2} size="3xl" weight="bold" truncate className="custom-heading">
        Complex Heading
      </Heading>
    );

    const heading = screen.getByText('Complex Heading');
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass(getStyleClass(styles, 'size-3xl'));
    expect(heading).toHaveClass(getStyleClass(styles, 'weight-bold'));
    expect(heading).toHaveClass(getStyleClass(styles, 'truncate'));
    expect(heading).toHaveClass('custom-heading');
  });

  it('has correct accessibility semantics by default', () => {
    render(<Heading level={1}>Accessible Heading</Heading>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Accessible Heading');
  });

  it('has accessibility semantics with aria attributes', () => {
    render(
      <Heading level={1} aria-labelledby="subtitle">
        Accessible Heading
      </Heading>
    );

    const heading = screen.getByText('Accessible Heading');
    expect(heading).toHaveAttribute('aria-labelledby', 'subtitle');
    expect(heading.tagName).toBe('H1');
  });
});
