import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple component with no CSS modules
const SimpleComponent = ({ text = 'Default Text' }: { text?: string }) => {
  return (
    <div data-testid="simple-component">
      <h1 className="heading">{text}</h1>
      <p className="paragraph">This is a simple component with no CSS modules</p>
    </div>
  );
};

// Basic test suite
describe('Simple Component Tests', () => {
  it('renders without crashing', () => {
    render(<SimpleComponent />);
    const element = screen.getByTestId('simple-component');
    expect(element).toBeInTheDocument();
  });

  it('displays the correct text', () => {
    render(<SimpleComponent text="Hello World" />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Hello World');
  });

  it('has the correct class names', () => {
    render(<SimpleComponent />);
    const heading = screen.getByRole('heading');
    const paragraph = screen.getByText(/This is a simple component/);
    
    expect(heading).toHaveClass('heading');
    expect(paragraph).toHaveClass('paragraph');
  });
});

