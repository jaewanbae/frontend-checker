import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import AIToggle from '../../components/UI/AIToggle';
import { theme } from '../../styles/theme';

// Mock styled-components theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AIToggle Component', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render with human mode selected by default', () => {
    renderWithTheme(<AIToggle isAIMode={false} onToggle={mockOnToggle} />);

    expect(screen.getByText('Human')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  test('should render with AI mode selected', () => {
    renderWithTheme(<AIToggle isAIMode={true} onToggle={mockOnToggle} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  test('should call onToggle when clicked', () => {
    renderWithTheme(<AIToggle isAIMode={false} onToggle={mockOnToggle} />);

    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  test('should call onToggle with false when switching from AI to human', () => {
    renderWithTheme(<AIToggle isAIMode={true} onToggle={mockOnToggle} />);

    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  test('should not call onToggle when disabled', () => {
    renderWithTheme(
      <AIToggle isAIMode={false} onToggle={mockOnToggle} disabled={true} />
    );

    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  test('should have correct accessibility attributes', () => {
    renderWithTheme(<AIToggle isAIMode={false} onToggle={mockOnToggle} />);

    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
    expect(toggleSwitch).toHaveAttribute('aria-label', 'Switch to AI opponent');
  });

  test('should have correct accessibility attributes when AI mode is on', () => {
    renderWithTheme(<AIToggle isAIMode={true} onToggle={mockOnToggle} />);

    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
    expect(toggleSwitch).toHaveAttribute(
      'aria-label',
      'Switch to human opponent'
    );
  });

  test('should apply disabled styling when disabled', () => {
    renderWithTheme(
      <AIToggle isAIMode={false} onToggle={mockOnToggle} disabled={true} />
    );

    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toHaveStyle('cursor: not-allowed');
  });

  test('should apply custom className', () => {
    const { container } = renderWithTheme(
      <AIToggle
        isAIMode={false}
        onToggle={mockOnToggle}
        className="custom-toggle"
      />
    );

    expect(container.firstChild).toHaveClass('custom-toggle');
  });
});
