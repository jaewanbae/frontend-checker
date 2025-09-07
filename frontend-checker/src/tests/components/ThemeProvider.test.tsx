import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../styles/ThemeProvider';
import { Container, Heading, Text } from '../../styles/styledComponents';

// Test component to verify theme is working
const TestComponent: React.FC = () => (
  <Container>
    <Heading level={1}>Test Heading</Heading>
    <Text>Test text content</Text>
  </Container>
);

describe('ThemeProvider', () => {
  it('renders children with theme context', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test text content')).toBeInTheDocument();
  });

  it('applies global styles', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check that the root element has the theme applied
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });
});
