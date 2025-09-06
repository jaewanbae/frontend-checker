import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { Container, Heading, Text } from './styles/styledComponents';

function App() {
  return (
    <ThemeProvider>
      <Container>
        <Heading level={1} align="center">
          Checkers Game
        </Heading>
        <Text align="center" size="lg">
          Welcome to the Checkers Game! 🎮
        </Text>
        <Text align="center" color="#7f8c8d">
          Game implementation coming soon...
        </Text>
      </Container>
    </ThemeProvider>
  );
}

export default App;
