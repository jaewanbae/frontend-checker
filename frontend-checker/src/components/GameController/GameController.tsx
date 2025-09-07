import React from 'react';
import styled from 'styled-components';
import { Board } from '../Board/Board';
import { Square } from '../Square/Square';
import {
  GAME_CONFIG,
  UI_CONFIG,
  TEXT,
  CONSOLE_MESSAGES,
} from '../../constants/gameConstants';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${UI_CONFIG.GAP_MEDIUM};
  padding: ${UI_CONFIG.GAP_MEDIUM};
  height: 100vh;
  max-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    gap: ${UI_CONFIG.GAP_SMALL};
    padding: ${UI_CONFIG.GAP_SMALL};
  }

  @media (max-height: 800px) {
    gap: 4px;
    padding: 8px;
  }
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.GAP_SMALL};
  flex-shrink: 0;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    margin-bottom: 4px;
  }

  @media (max-height: 800px) {
    margin-bottom: 2px;
  }
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${UI_CONFIG.GAP_SMALL};
  flex: 1;
  justify-content: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    gap: 4px;
  }

  @media (max-height: 800px) {
    gap: 2px;
  }
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: min(85vw, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px);
  padding: ${UI_CONFIG.GAP_MEDIUM};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const PlayerInfo = styled.div<{ isActive: boolean }>`
  padding: ${UI_CONFIG.GAP_SMALL} ${UI_CONFIG.GAP_MEDIUM};
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
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
      for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        const isLight = (row + col) % 2 === 0;
        squares.push(
          <Square
            key={`${row}-${col}`}
            row={row}
            col={col}
            isLight={isLight}
            onClick={() =>
              console.log(CONSOLE_MESSAGES.CLICKED_SQUARE(row, col))
            }
          />
        );
      }
    }
    console.log(CONSOLE_MESSAGES.RENDERED_SQUARES(squares.length));
    return squares;
  };

  return (
    <GameContainer>
      <GameHeader>
        <h1>{TEXT.GAME_TITLE}</h1>
        <p>{TEXT.GAME_INSTRUCTIONS}</p>
      </GameHeader>

      <GameBoard>
        <GameInfo>
          <PlayerInfo isActive={true}>
            <strong>{TEXT.PLAYER_1_LABEL}</strong>
            <div>
              {TEXT.PIECES_LABEL} {GAME_CONFIG.PIECES_PER_PLAYER}
            </div>
          </PlayerInfo>
          <div>{TEXT.VS_LABEL}</div>
          <PlayerInfo isActive={false}>
            <strong>{TEXT.PLAYER_2_LABEL}</strong>
            <div>
              {TEXT.PIECES_LABEL} {GAME_CONFIG.PIECES_PER_PLAYER}
            </div>
          </PlayerInfo>
        </GameInfo>

        <Board>{renderBoard()}</Board>
      </GameBoard>

      {children}
    </GameContainer>
  );
};
