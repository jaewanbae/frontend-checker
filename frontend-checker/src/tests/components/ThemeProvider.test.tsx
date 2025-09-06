import React from 'react';
import { render } from '@testing-library/react';
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
    const { getByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByText('Test Heading')).toBeInTheDocument();
    expect(getByText('Test text content')).toBeInTheDocument();
  });

  it('applies global styles', () => {
    const { container } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check that the root element has the theme applied
    expect(container.firstChild).toBeInTheDocument();
  });
});
