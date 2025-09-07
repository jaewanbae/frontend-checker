import React from 'react';
import styled from 'styled-components';

const PieceContainer = styled.div<{
  isLight: boolean;
  isKing: boolean;
  isDragging?: boolean;
}>`
  width: 80%;
  height: 80%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 2px solid ${({ theme }) => theme.colors.primary};

  background: ${({ isLight, isKing, theme }) => {
    if (isKing) {
      return isLight
        ? `radial-gradient(circle, ${theme.colors.lightKing} 0%, ${theme.colors.lightPiece} 70%)`
        : `radial-gradient(circle, ${theme.colors.darkKing} 0%, ${theme.colors.darkPiece} 70%)`;
    }
    return isLight ? theme.colors.lightPiece : theme.colors.darkPiece;
  }};

  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: grab;

  ${({ isDragging }) =>
    isDragging &&
    `
    cursor: grabbing;
    transform: scale(1.1);
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  `}

  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:active {
    cursor: grabbing;
  }

  /* King crown indicator */
  ${({ isKing }) =>
    isKing &&
    `
    &::after {
      content: '♔';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.8em;
      color: #ffd700;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
  `}
`;

interface PieceProps {
  id: string;
  isLight: boolean;
  isKing: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
}

export const Piece: React.FC<PieceProps> = ({
  id,
  isLight,
  isKing,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  return (
    <PieceContainer
      isLight={isLight}
      isKing={isKing}
      isDragging={isDragging}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-piece-id={id}
    />
  );
};
