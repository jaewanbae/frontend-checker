import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../styles/ThemeProvider';
import { GameController } from '../../components/GameController/GameController';

describe('Game Integration', () => {
  test('should render game controller without errors', () => {
    render(
      <ThemeProvider>
        <GameController />
      </ThemeProvider>
    );

    expect(screen.getByText('Checkers Game')).toBeInTheDocument();
    expect(
      screen.getByText('Click and drag pieces to move them')
    ).toBeInTheDocument();
  });

  test('should render player information', () => {
    render(
      <ThemeProvider>
        <GameController />
      </ThemeProvider>
    );

    expect(screen.getByText('Player 1 (Light)')).toBeInTheDocument();
    expect(screen.getByText('Player 2 (Dark)')).toBeInTheDocument();
  });
});
