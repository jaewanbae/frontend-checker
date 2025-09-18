import React from 'react';
import styled from 'styled-components';

interface AIToggleProps {
  isAIMode: boolean;
  onToggle: (isAIMode: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ToggleLabel = styled.span<{ isActive: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props =>
    props.isActive
      ? props.theme.colors.primary
      : props.theme.colors.textSecondary};
  transition: ${({ theme }) => theme.transitions.fast};
`;

const ToggleSwitch = styled.div<{ isOn: boolean; disabled?: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  background: ${props =>
    props.disabled
      ? props.theme.colors.textSecondary
      : props.isOn
        ? props.theme.colors.primary
        : props.theme.colors.border};
  border-radius: 12px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: ${({ theme }) => theme.transitions.fast};
  opacity: ${props => (props.disabled ? 0.6 : 1)};

  &:hover {
    background: ${props =>
      props.disabled
        ? props.theme.colors.textSecondary
        : props.isOn
          ? props.theme.colors.secondary
          : props.theme.colors.textSecondary};
  }
`;

const ToggleThumb = styled.div<{ isOn: boolean }>`
  position: absolute;
  top: 2px;
  left: ${props => (props.isOn ? '26px' : '2px')};
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.fast};
`;

const AIToggle: React.FC<AIToggleProps> = ({
  isAIMode,
  onToggle,
  disabled = false,
  className,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(!isAIMode);
    }
  };

  return (
    <ToggleContainer className={className}>
      <ToggleLabel isActive={!isAIMode}>Human</ToggleLabel>
      <ToggleSwitch
        isOn={isAIMode}
        disabled={disabled}
        onClick={handleToggle}
        role="switch"
        aria-checked={isAIMode}
        aria-label={`Switch to ${isAIMode ? 'human' : 'AI'} opponent`}
      >
        <ToggleThumb isOn={isAIMode} />
      </ToggleSwitch>
      <ToggleLabel isActive={isAIMode}>AI</ToggleLabel>
    </ToggleContainer>
  );
};

export default AIToggle;
