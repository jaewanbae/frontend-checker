import React from 'react';
import styled from 'styled-components';
import { Board } from '../Board/Board';
import { Square } from '../Square/Square';
import { Piece } from '../Piece/Piece';
import { useGameState } from '../../hooks/useGameState';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { PieceColor, Move } from '../../types/game.types';
import { GameStatus, GameMode } from '../../constants/gameEnums';
import { GAME_CONFIG, UI_CONFIG, TEXT } from '../../constants/gameConstants';
import { validateMove } from '../../utils/moveValidation';

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
  min-height: 120px; /* Fixed height to prevent layout shifts */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    margin-bottom: 4px;
    min-height: 100px;
  }

  @media (max-height: 800px) {
    margin-bottom: 2px;
    min-height: 80px;
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

const GameButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  min-width: 120px; /* Consistent button width */

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatusMessage = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

interface GameControllerProps {
  // Props will be defined when we implement the game logic
  children?: React.ReactNode;
}

export const GameController: React.FC<GameControllerProps> = () => {
  const { gameState, actions, gameRules } = useGameState();
  const { onDragStart, onDragEnd, isOverValidDropZone } = useDragAndDrop({
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    gameStatus: gameState.gameStatus,
    onPieceSelect: actions.selectPiece,
  });

  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
      for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        const isLight = (row + col) % 2 === 0;
        const piece = gameState.board.squares[row][col];
        const isHighlighted = gameState.highlightedSquares.some(
          pos => pos.row === row && pos.col === col
        );
        const isValidMove =
          gameState.validMoves.some(
            pos => pos.row === row && pos.col === col
          ) || isOverValidDropZone({ row, col });
        const isSelected =
          gameState.selectedPiece?.position.row === row &&
          gameState.selectedPiece?.position.col === col;

        squares.push(
          <Square
            key={`${row}-${col}`}
            row={row}
            col={col}
            isLight={isLight}
            isHighlighted={isHighlighted}
            isValidMove={isValidMove}
            isSelected={isSelected}
            isDropZone={isValidMove}
            onClick={() => {
              if (gameState.gameStatus !== GameStatus.PLAYING) {
                return; // Don't allow interactions if game hasn't started
              }

              if (piece && piece.color === gameState.currentPlayer) {
                actions.selectPiece(piece);
              } else if (isValidMove && gameState.selectedPiece) {
                // Validate the move to get capture information
                const validation = validateMove(
                  gameState.board,
                  gameState.selectedPiece,
                  gameState.selectedPiece.position,
                  { row, col }
                );

                if (validation.isValid) {
                  // Create move object with proper capture information
                  // Note: isMultipleJump will be determined during execution
                  const move: Move = {
                    from: gameState.selectedPiece.position,
                    to: { row, col },
                    piece: gameState.selectedPiece,
                    capturedPiece: validation.capturedPiece,
                    isKinging: validation.isKinging || false,
                    isCapture: validation.isCapture || false,
                    isMultipleJump: false, // Will be determined during execution
                  };
                  actions.makeMove(move);
                }
              }
            }}
            onDrop={position => {
              if (gameState.gameStatus !== GameStatus.PLAYING) {
                return; // Don't allow interactions if game hasn't started
              }

              if (gameState.selectedPiece) {
                // Validate the move to get capture information
                const validation = validateMove(
                  gameState.board,
                  gameState.selectedPiece,
                  gameState.selectedPiece.position,
                  position
                );

                if (validation.isValid) {
                  // Create move object with proper capture information
                  // Note: isMultipleJump will be determined during execution
                  const move: Move = {
                    from: gameState.selectedPiece.position,
                    to: position,
                    piece: gameState.selectedPiece,
                    capturedPiece: validation.capturedPiece,
                    isKinging: validation.isKinging || false,
                    isCapture: validation.isCapture || false,
                    isMultipleJump: false, // Will be determined during execution
                  };
                  actions.makeMove(move);
                }
              }
            }}
          >
            {piece && (
              <Piece
                id={piece.id}
                isLight={piece.color === PieceColor.LIGHT}
                isKing={piece.isKing}
                isDragging={false}
                isDisabled={
                  piece.color !== gameState.currentPlayer ||
                  gameState.gameStatus !== GameStatus.PLAYING
                }
                piece={piece}
                onClick={() => {
                  if (
                    piece.color === gameState.currentPlayer &&
                    gameState.gameStatus === GameStatus.PLAYING
                  ) {
                    actions.selectPiece(piece);
                  }
                }}
                onDragStart={draggedPiece => {
                  if (
                    draggedPiece.color === gameState.currentPlayer &&
                    gameState.gameStatus === GameStatus.PLAYING
                  ) {
                    onDragStart(draggedPiece);
                  }
                }}
                onDragEnd={() => {
                  actions.deselectPiece();
                  onDragEnd();
                }}
              />
            )}
          </Square>
        );
      }
    }
    return squares;
  };

  return (
    <GameContainer>
      <GameHeader>
        <h1>{TEXT.GAME_TITLE}</h1>
        <p>{TEXT.GAME_INSTRUCTIONS}</p>
        <div>
          <StatusMessage>{gameRules.getGameStatusMessage()}</StatusMessage>
          <div>
            {gameState.gameStatus === GameStatus.WAITING && (
              <GameButton
                onClick={() => actions.startGame(GameMode.HUMAN_VS_HUMAN)}
              >
                Start Game
              </GameButton>
            )}
            {(gameState.gameStatus === GameStatus.PLAYING ||
              gameState.gameStatus === GameStatus.FINISHED) && (
              <GameButton onClick={() => actions.resetGame()}>
                {gameState.gameStatus === GameStatus.FINISHED
                  ? 'Play Again'
                  : 'Reset Game'}
              </GameButton>
            )}
          </div>
        </div>
      </GameHeader>

      <GameBoard>
        <GameInfo>
          <PlayerInfo isActive={gameState.currentPlayer === PieceColor.LIGHT}>
            <strong>{TEXT.PLAYER_1_LABEL}</strong>
            <div>
              {TEXT.PIECES_LABEL} {gameState.players.light.piecesRemaining}
            </div>
            <div>Captures: {gameState.players.light.captures}</div>
          </PlayerInfo>
          <div>{TEXT.VS_LABEL}</div>
          <PlayerInfo isActive={gameState.currentPlayer === PieceColor.DARK}>
            <strong>{TEXT.PLAYER_2_LABEL}</strong>
            <div>
              {TEXT.PIECES_LABEL} {gameState.players.dark.piecesRemaining}
            </div>
            <div>Captures: {gameState.players.dark.captures}</div>
          </PlayerInfo>
        </GameInfo>

        <Board>{renderBoard()}</Board>
      </GameBoard>
    </GameContainer>
  );
};
