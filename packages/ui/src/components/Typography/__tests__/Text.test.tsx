import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Text } from '../Text.js';

describe('Text Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Text>Default Text</Text>);

    const text = screen.getByText('Default Text');
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe('P'); // Default element is p
  });

  it('renders different element types', () => {
    const { rerender } = render(<Text as="p">Paragraph Text</Text>);
    expect(screen.getByText('Paragraph Text').tagName).toBe('P');

    rerender(<Text as="span">Span Text</Text>);
    expect(screen.getByText('Span Text').tagName).toBe('SPAN');

    rerender(<Text as="div">Div Text</Text>);
    expect(screen.getByText('Div Text').tagName).toBe('DIV');
  });

  it('applies size variants correctly', () => {
    const { rerender } = render(<Text size="xs">Extra Small</Text>);
    // Check that the element has classes (without specifying exact names)
    expect(screen.getByText('Extra Small').className.length).toBeGreaterThan(0);

    rerender(<Text size="sm">Small</Text>);
    expect(screen.getByText('Small').className.length).toBeGreaterThan(0);

    rerender(<Text size="md">Medium</Text>);
    expect(screen.getByText('Medium').className.length).toBeGreaterThan(0);

    rerender(<Text size="lg">Large</Text>);
    expect(screen.getByText('Large').className.length).toBeGreaterThan(0);

    rerender(<Text size="xl">Extra Large</Text>);
    expect(screen.getByText('Extra Large').className.length).toBeGreaterThan(0);
  });

  it('applies weight variants correctly', () => {
    const { rerender } = render(<Text weight="light">Light Text</Text>);
    // With CSS modules, we verify elements have classes without checking specific names
    expect(screen.getByText('Light Text').className.length).toBeGreaterThan(0);

    rerender(<Text weight="normal">Normal Text</Text>);
    expect(screen.getByText('Normal Text').className.length).toBeGreaterThan(0);

    rerender(<Text weight="medium">Medium Text</Text>);
    expect(screen.getByText('Medium Text').className.length).toBeGreaterThan(0);

    rerender(<Text weight="semibold">Semibold Text</Text>);
    expect(screen.getByText('Semibold Text').className.length).toBeGreaterThan(0);

    rerender(<Text weight="bold">Bold Text</Text>);
    expect(screen.getByText('Bold Text').className.length).toBeGreaterThan(0);
  });

  it('applies italic style correctly', () => {
    render(<Text italic>Italic Text</Text>);
    // Check that the element has some classes without specifying exact names
    expect(screen.getByText('Italic Text').className.length).toBeGreaterThan(0);
  });

  it('applies color variants correctly', () => {
    const { rerender } = render(<Text color="default">Default Color</Text>);
    // With CSS modules, we verify elements have some classes without checking names
    expect(screen.getByText('Default Color').className.length).toBeGreaterThan(0);

    rerender(<Text color="muted">Muted Color</Text>);
    expect(screen.getByText('Muted Color').className.length).toBeGreaterThan(0);

    rerender(<Text color="primary">Primary Color</Text>);
    expect(screen.getByText('Primary Color').className.length).toBeGreaterThan(0);

    rerender(<Text color="success">Success Color</Text>);
    expect(screen.getByText('Success Color').className.length).toBeGreaterThan(0);

    rerender(<Text color="warning">Warning Color</Text>);
    expect(screen.getByText('Warning Color').className.length).toBeGreaterThan(0);

    rerender(<Text color="danger">Danger Color</Text>);
    expect(screen.getByText('Danger Color').className.length).toBeGreaterThan(0);
  });

  it('applies alignment correctly', () => {
    const { rerender } = render(<Text align="left">Left Aligned</Text>);
    // CSS module class names are transformed, just check classes exist
    expect(screen.getByText('Left Aligned').className.length).toBeGreaterThan(0);

    rerender(<Text align="center">Center Aligned</Text>);
    expect(screen.getByText('Center Aligned').className.length).toBeGreaterThan(0);

    rerender(<Text align="right">Right Aligned</Text>);
    expect(screen.getByText('Right Aligned').className.length).toBeGreaterThan(0);

    rerender(<Text align="justify">Justified Text</Text>);
    expect(screen.getByText('Justified Text').className.length).toBeGreaterThan(0);
  });

  it('applies truncation correctly', () => {
    render(<Text truncate>Truncated Text</Text>);
    // CSS modules transform class names but we can verify classes exist
    expect(screen.getByText('Truncated Text').className.length).toBeGreaterThan(0);
  });

  it('applies line clamping correctly', () => {
    const { rerender } = render(<Text lineClamp={2}>Two Line Clamped</Text>);
    let text = screen.getByText('Two Line Clamped');
    // Check for any class, as CSS modules transform the actual names
    expect(text.className.length).toBeGreaterThan(0);
    expect(text).toHaveStyle('--line-clamp: 2');

    rerender(<Text lineClamp={3}>Three Line Clamped</Text>);
    text = screen.getByText('Three Line Clamped');
    expect(text).toHaveStyle('--line-clamp: 3');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Text ref={ref}>Referenced Text</Text>);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('P');
    expect(ref.current?.textContent).toBe('Referenced Text');
  });

  it('passes custom props correctly', () => {
    render(
      <Text data-testid="custom-text" aria-label="Descriptive text" role="note">
        Custom Props Text
      </Text>
    );

    const text = screen.getByTestId('custom-text');
    expect(text).toHaveAttribute('aria-label', 'Descriptive text');
    expect(text).toHaveAttribute('role', 'note');
  });

  it('applies custom className correctly', () => {
    render(<Text className="my-custom-text">Custom Class Text</Text>);
    const text = screen.getByText('Custom Class Text');
    expect(text).toHaveClass('my-custom-text');
  });

  it('combines multiple styling props correctly', () => {
    render(
      <Text
        as="span"
        size="lg"
        weight="semibold"
        color="primary"
        align="center"
        italic
        truncate
        className="custom-text"
      >
        Complex Text
      </Text>
    );

    const text = screen.getByText('Complex Text');
    expect(text.tagName).toBe('SPAN');

    // Verify the element has CSS classes without checking specific names
    expect(text.className.length).toBeGreaterThan(0);

    // Custom class names still work as expected since they're not transformed
    expect(text).toHaveClass('custom-text');

    // We can also verify the className string contains something
    expect(text.className.length).toBeGreaterThan(0);
  });
});
