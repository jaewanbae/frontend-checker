import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { UI_CONFIG } from '../../constants/gameConstants';

const SquareContainer = styled.div<{
  isLight: boolean;
  isHighlighted?: boolean;
  isValidMove?: boolean;
  isSelected?: boolean;
}>`
  aspect-ratio: 1;
  background-color: ${({ isLight, theme }) =>
    isLight ? theme.colors.lightSquare : theme.colors.darkSquare};
  border: ${UI_CONFIG.SQUARE_BORDER_WIDTH}px solid
    ${({ theme }) => theme.colors.border};

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ isValidMove }) => (isValidMove ? 'pointer' : 'default')};

  position: relative;

  ${({ isHighlighted, theme }) =>
    isHighlighted &&
    `
    background-color: ${theme.colors.hover};
    box-shadow: inset 0 0 0 2px ${theme.colors.secondary};
  `}

  ${({ isValidMove, theme }) =>
    isValidMove &&
    `
    background-color: ${theme.colors.validMove};
    box-shadow: inset 0 0 0 2px ${theme.colors.success};
  `}
  
  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background-color: ${theme.colors.selected};
    box-shadow: inset 0 0 0 3px ${theme.colors.primary};
  `}
  
  &:hover {
    ${({ isValidMove, theme }) =>
      isValidMove &&
      `
      background-color: ${theme.colors.validMove};
      box-shadow: inset 0 0 0 3px ${theme.colors.success};
      filter: brightness(1.1);
    `}
  }

  transition: ${({ theme }) => theme.transitions.fast};
`;

interface SquareProps {
  row: number;
  col: number;
  isLight: boolean;
  isHighlighted?: boolean;
  isValidMove?: boolean;
  isSelected?: boolean;
  isDropZone?: boolean;
  onClick?: () => void;
  onDrop?: (position: { row: number; col: number }) => void;
  children?: React.ReactNode;
}

export const Square: React.FC<SquareProps> = ({
  row,
  col,
  isLight,
  isHighlighted = false,
  isValidMove = false,
  isSelected = false,
  isDropZone = false,
  onClick,
  onDrop,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isDropZone) return;

    const cleanup = dropTargetForElements({
      element,
      onDrop: ({ source }) => {
        onDrop?.({ row, col });
      },
    });

    return cleanup;
  }, [row, col, isDropZone, onDrop]);

  return (
    <SquareContainer
      ref={ref}
      isLight={isLight}
      isHighlighted={isHighlighted}
      isValidMove={isValidMove}
      isSelected={isSelected}
      onClick={onClick}
      data-row={row}
      data-col={col}
    >
      {children}
    </SquareContainer>
  );
};
