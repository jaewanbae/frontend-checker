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
  gap: 12px;
  padding: 8px 16px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ToggleLabel = styled.span<{ isActive: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props =>
    props.isActive
      ? props.theme.colors.primary
      : props.theme.colors.textSecondary};
  transition: color 0.2s ease;
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
  transition: background-color 0.2s ease;
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
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.2s ease;
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
