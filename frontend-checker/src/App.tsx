import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { GameController } from './components/GameController/GameController';

function App() {
  return (
    <ThemeProvider>
      <GameController />
    </ThemeProvider>
  );
}

export default App;
