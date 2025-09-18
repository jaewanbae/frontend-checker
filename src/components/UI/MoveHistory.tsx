import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Move, PieceColor } from '../../types/game.types';
import { PieceType } from '../../constants/gameEnums';
import { GAME_CONFIG } from '../../constants/gameConstants';

interface MoveHistoryProps {
  moves: Move[];
  currentPlayer: PieceColor;
  undoMove: () => void;
}

const MoveHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 250px;
  height: calc(${({ theme }) => theme.responsive.boardSize.base}, ${GAME_CONFIG.MAX_BOARD_SIZE + 100}px) + 80px);
  min-height: calc(${GAME_CONFIG.MIN_BOARD_SIZE + 100}px + 80px);
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;

  /* Responsive sizing using theme utilities */
  ${({ theme }) => theme.responsive.height900} {
    height: calc(${({ theme }) => theme.responsive.boardSize.height900} + ${({ theme }) => theme.spacing.sm});
    max-width: 280px;
  }

  ${({ theme }) => theme.responsive.height800} {
    height: calc(${({ theme }) => theme.responsive.boardSize.height800} + ${({ theme }) => theme.spacing.sm});
    max-width: 260px;
  }

  ${({ theme }) => theme.responsive.height700} {
    height: calc(${({ theme }) => theme.responsive.boardSize.height700} + ${({ theme }) => theme.spacing.xs});
    max-width: 240px;
  }

  ${({ theme }) => theme.responsive.height600} {
    height: calc(${({ theme }) => theme.responsive.boardSize.height600} + ${({ theme }) => theme.spacing.xs});
    max-width: 220px;
  }

  ${({ theme }) => theme.responsive.desktop} {
    max-width: 250px;
  }

  ${({ theme }) => theme.responsive.tablet} {
    max-width: 200px;
    height: calc(min(90vw, 40vh, 300px) + ${({ theme }) => theme.spacing.xs});
  }
`;

const MoveHistoryHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.textSecondary};

  /* Responsive header sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: 1rem;
  }

  ${({ theme }) => theme.responsive.height700} {
    padding: ${({ theme }) => theme.spacing.xs};
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.responsive.height600} {
    padding: ${({ theme }) => theme.spacing.xs};
    font-size: 0.8rem;
  }
`;

const MovesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  scroll-behavior: smooth;

  /* Responsive moves list sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    padding: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height700} {
    padding: ${({ theme }) => theme.spacing.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height600} {
    padding: ${({ theme }) => theme.spacing.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const MoveItem = styled.div<{ isCurrentPlayer: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ isCurrentPlayer, theme }) =>
    isCurrentPlayer ? theme.colors.selected : theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border-left: 3px solid
    ${({ isCurrentPlayer, theme }) =>
      isCurrentPlayer ? theme.colors.primary : theme.colors.textSecondary};
  transition: ${({ theme }) => theme.transitions.fast};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  /* Responsive move item sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    padding: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height700} {
    padding: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height600} {
    padding: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

const MoveHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  /* Responsive move header sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height700} {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height600} {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

const PlayerName = styled.span<{ color: PieceColor }>`
  font-weight: 600;
  color: ${({ color, theme }) =>
    color === PieceColor.LIGHT ? theme.colors.primary : theme.colors.danger};

  /* Responsive player name sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.responsive.height700} {
    font-size: 0.8rem;
  }

  ${({ theme }) => theme.responsive.height600} {
    font-size: 0.7rem;
  }
`;

const MoveNumber = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;

  /* Responsive move number sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    font-size: 0.8rem;
  }

  ${({ theme }) => theme.responsive.height700} {
    font-size: 0.7rem;
  }

  ${({ theme }) => theme.responsive.height600} {
    font-size: 0.6rem;
  }
`;

const MoveDetails = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  /* Responsive move details sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    gap: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height700} {
    gap: ${({ theme }) => theme.spacing.xs};
  }

  ${({ theme }) => theme.responsive.height600} {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const LocationValue = styled.span`
  font-family: 'Courier New', monospace;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.textSecondary};

  /* Responsive location value sizing using theme utilities */
  ${({ theme }) => theme.responsive.height800} {
    padding: 1px ${({ theme }) => theme.spacing.sm};
    font-size: 0.8rem;
  }

  ${({ theme }) => theme.responsive.height700} {
    padding: 1px ${({ theme }) => theme.spacing.xs};
    font-size: 0.7rem;
  }

  ${({ theme }) => theme.responsive.height600} {
    padding: 1px ${({ theme }) => theme.spacing.xs};
    font-size: 0.6rem;
  }
`;

const MoveActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ActionBadge = styled.span<{ type: 'capture' | 'kinging' }>`
  font-size: 0.8rem;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 500;
  background-color: ${({ type, theme }) =>
    type === 'capture' ? theme.colors.danger : theme.colors.warning};
  color: ${({ theme }) => theme.colors.textLight};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  opacity: 0.5;
`;

const EmptyStateText = styled.p`
  font-size: 0.9rem;
  line-height: 1.4;
`;

const UndoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing.lg};
  height: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: auto;
  transition: all ${({ theme }) => theme.transitions.fast};
  user-select: none;
  padding: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.textLight};
    transform: scale(1.15) rotate(-15deg);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:active {
    transform: scale(0.95) rotate(-10deg);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.danger}33;
  }
`;

// Helper function to format position as chess notation
const formatPosition = (row: number, col: number): string => {
  const file = String.fromCharCode(97 + col); // a-h
  const rank = 8 - row; // 8-1
  return `${file}${rank}`;
};

// Helper function to get piece symbol
const getPieceSymbol = (pieceType: PieceType, isKing: boolean): string => {
  if (isKing) {
    return pieceType === PieceType.PAWN ? '♔' : '♚';
  }
  return pieceType === PieceType.PAWN ? '●' : '○';
};

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentPlayer,
  undoMove,
}) => {
  const movesListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new moves are added
  useEffect(() => {
    if (movesListRef.current) {
      movesListRef.current.scrollTop = movesListRef.current.scrollHeight;
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <MoveHistoryContainer>
        <MoveHistoryHeader>Move History</MoveHistoryHeader>
        <EmptyState>
          <EmptyStateIcon>📋</EmptyStateIcon>
          <EmptyStateText>
            No moves yet.
            <br />
            Start the game to see move history here.
          </EmptyStateText>
        </EmptyState>
      </MoveHistoryContainer>
    );
  }

  return (
    <MoveHistoryContainer>
      <MoveHistoryHeader>Move History</MoveHistoryHeader>
      <MovesList ref={movesListRef}>
        {moves.map((move, index) => {
          const isCurrentPlayer = move.piece.color === currentPlayer;
          const pieceSymbol = getPieceSymbol(
            move.piece.type,
            move.piece.isKing
          );

          return (
            <MoveItem key={index} isCurrentPlayer={isCurrentPlayer}>
              <MoveHeader>
                <PlayerName color={move.piece.color}>
                  {pieceSymbol}{' '}
                  {move.piece.color === PieceColor.LIGHT ? 'Light' : 'Dark'}{' '}
                  {move.piece.isKing && (
                    <ActionBadge type="kinging">King</ActionBadge>
                  )}
                </PlayerName>
                <MoveNumber>#{index + 1}</MoveNumber>
              </MoveHeader>

              <MoveDetails>
                <LocationValue>
                  {formatPosition(move.from.row, move.from.col)}
                </LocationValue>
                <span>→</span>
                <LocationValue>
                  {formatPosition(move.to.row, move.to.col)}
                </LocationValue>
                {index === moves.length - 1 && (
                  <UndoButton onClick={undoMove} title="Undo last move">
                    ↶
                  </UndoButton>
                )}
              </MoveDetails>

              <MoveActions>
                {move.isCapture && move.capturedPiece && (
                  <ActionBadge type="capture">
                    Captured{' '}
                    {move.capturedPiece.color === PieceColor.LIGHT
                      ? 'Light'
                      : 'Dark'}
                  </ActionBadge>
                )}
                {move.isKinging && (
                  <ActionBadge type="kinging">Kinged!</ActionBadge>
                )}
                {move.isMultipleJump && (
                  <ActionBadge type="capture">Multi-jump</ActionBadge>
                )}
              </MoveActions>
            </MoveItem>
          );
        })}
      </MovesList>
    </MoveHistoryContainer>
  );
};
