import React from 'react';
import styled from 'styled-components';
import { Board } from '../Board/Board';
import { Square } from '../Square/Square';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PlayerInfo = styled.div<{ isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.selected : 'transparent'};
  transition: ${({ theme }) => theme.transitions.fast};
`;

interface GameControllerProps {
  // Props will be defined when we implement the game logic
  children?: React.ReactNode;
}

export const GameController: React.FC<GameControllerProps> = ({ children }) => {
  // Temporary placeholder implementation
  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        squares.push(
          <Square
            key={`${row}-${col}`}
            row={row}
            col={col}
            isLight={isLight}
            onClick={() => console.log(`Clicked square ${row},${col}`)}
          />
        );
      }
    }
    console.log(`Rendered ${squares.length} squares`);
    return squares;
  };

  return (
    <GameContainer>
      <GameHeader>
        <h1>Checkers Game</h1>
        <p>Click and drag pieces to move them</p>
      </GameHeader>

      <GameBoard>
        <GameInfo>
          <PlayerInfo isActive={true}>
            <strong>Player 1 (Light)</strong>
            <div>Pieces: 12</div>
          </PlayerInfo>
          <div>VS</div>
          <PlayerInfo isActive={false}>
            <strong>Player 2 (Dark)</strong>
            <div>Pieces: 12</div>
          </PlayerInfo>
        </GameInfo>

        <Board>{renderBoard()}</Board>
      </GameBoard>

      {children}
    </GameContainer>
  );
};
