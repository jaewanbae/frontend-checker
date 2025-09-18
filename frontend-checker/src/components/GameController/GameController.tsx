import React from 'react';
import styled from 'styled-components';
import { Board } from '../Board/Board';
import { Square } from '../Square/Square';
import { Piece } from '../Piece/Piece';
import { MoveHistory } from '../UI/MoveHistory';
import AIToggle from '../UI/AIToggle';
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

const MainGameArea = styled.div`
  display: flex;
  gap: ${UI_CONFIG.GAP_MEDIUM};
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 1400px;
  flex: 1;
  overflow: hidden;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    flex-direction: column;
    align-items: center;
    gap: ${UI_CONFIG.GAP_SMALL};
  }
`;

const GameBoardSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${UI_CONFIG.GAP_SMALL};
  flex-shrink: 0;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    gap: 4px;
  }

  @media (max-height: 800px) {
    gap: 2px;
  }
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.GAP_SMALL};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP}) {
    margin-bottom: 4px;
  }

  @media (max-height: 800px) {
    margin-bottom: 2px;
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

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${UI_CONFIG.GAP_SMALL};
  margin-bottom: ${UI_CONFIG.GAP_MEDIUM};
`;

const PlayerInfo = styled.div<{ isActive: boolean }>`
  padding: ${UI_CONFIG.GAP_SMALL} ${UI_CONFIG.GAP_MEDIUM};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.selected : 'transparent'};
  transition: ${({ theme }) => theme.transitions.fast};
  min-width: 140px; /* Ensure consistent width to prevent UI shifting */
  text-align: center;
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
    currentJumpingPiece: gameState.currentJumpingPiece,
    onPieceSelect: actions.selectPiece,
  });

  // Helper function to check if interactions are allowed
  const canInteract = (): boolean => {
    if (gameState.gameStatus !== GameStatus.PLAYING) {
      return false;
    }

    // Don't allow interactions if it's the AI's turn
    if (
      gameState.gameMode === GameMode.HUMAN_VS_AI &&
      gameState.players.dark.isAI &&
      gameState.currentPlayer === PieceColor.DARK
    ) {
      return false;
    }

    return true;
  };

  // Helper function to create a move object
  const createMove = (
    from: { row: number; col: number },
    to: { row: number; col: number }
  ): Move | null => {
    if (!gameState.selectedPiece) return null;

    const validation = validateMove(
      gameState.board,
      gameState.selectedPiece,
      from,
      to
    );

    if (!validation.isValid) return null;

    return {
      from,
      to,
      piece: gameState.selectedPiece,
      capturedPiece: validation.capturedPiece,
      isKinging: validation.isKinging || false,
      isCapture: validation.isCapture || false,
      isMultipleJump: false, // Will be determined during execution
    };
  };

  // Handle square click
  const handleSquareClick = (
    row: number,
    col: number,
    piece: any,
    isValidMove: boolean
  ) => {
    if (!canInteract()) return;

    if (piece && piece.color === gameState.currentPlayer) {
      actions.selectPiece(piece);
    } else if (isValidMove && gameState.selectedPiece) {
      const move = createMove(gameState.selectedPiece.position, { row, col });
      if (move) {
        actions.makeMove(move);
      }
    }
  };

  // Handle piece drop
  const handlePieceDrop = (position: { row: number; col: number }) => {
    if (!canInteract()) return;

    const move = createMove(gameState.selectedPiece!.position, position);
    if (move) {
      actions.makeMove(move);
    }
  };

  // Handle piece click
  const handlePieceClick = (piece: any) => {
    if (!canInteract() || piece.color !== gameState.currentPlayer) return;
    actions.selectPiece(piece);
  };

  // Handle piece drag start
  const handlePieceDragStart = (draggedPiece: any) => {
    if (!canInteract() || draggedPiece.color !== gameState.currentPlayer)
      return;
    onDragStart(draggedPiece);
  };

  // Handle AI toggle
  const handleAIToggle = (isAIMode: boolean) => {
    const newMode = isAIMode ? GameMode.HUMAN_VS_AI : GameMode.HUMAN_VS_HUMAN;
    actions.switchGameMode(newMode);
  };

  // Check if piece is disabled
  const isPieceDisabled = (piece: any): boolean => {
    if (piece.color !== gameState.currentPlayer) return true;
    if (gameState.gameStatus !== GameStatus.PLAYING) return true;

    return (
      gameState.gameMode === GameMode.HUMAN_VS_AI &&
      gameState.players.dark.isAI &&
      gameState.currentPlayer === PieceColor.DARK
    );
  };

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
            onClick={() => handleSquareClick(row, col, piece, isValidMove)}
            onDrop={handlePieceDrop}
          >
            {piece && (
              <Piece
                id={piece.id}
                isLight={piece.color === PieceColor.LIGHT}
                isKing={piece.isKing}
                isDragging={false}
                isDisabled={isPieceDisabled(piece)}
                piece={piece}
                onClick={() => handlePieceClick(piece)}
                onDragStart={handlePieceDragStart}
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
        <GameControls>
          <StatusMessage>{gameRules.getGameStatusMessage()}</StatusMessage>
          <AIToggle
            isAIMode={gameState.gameMode === GameMode.HUMAN_VS_AI}
            onToggle={handleAIToggle}
            disabled={false} /* Allow toggling before and during games */
          />
          <div>
            {gameState.gameStatus === GameStatus.WAITING && (
              <GameButton onClick={() => actions.startGame(gameState.gameMode)}>
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
        </GameControls>
      </GameHeader>

      <MainGameArea>
        <GameBoardSection>
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
              <strong>
                {gameState.gameMode === GameMode.HUMAN_VS_AI
                  ? 'AI'
                  : TEXT.PLAYER_2_LABEL}
              </strong>
              <div>
                {TEXT.PIECES_LABEL} {gameState.players.dark.piecesRemaining}
              </div>
              <div>Captures: {gameState.players.dark.captures}</div>
            </PlayerInfo>
          </GameInfo>

          <Board>{renderBoard()}</Board>
        </GameBoardSection>

        <MoveHistory
          moves={gameState.moveHistory}
          currentPlayer={gameState.currentPlayer}
          undoMove={actions.undoMove}
        />
      </MainGameArea>
    </GameContainer>
  );
};
