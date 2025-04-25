import React from 'react';
import { styled } from 'styled-components';

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 5px;
`;

const ScoreText = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const ComboText = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${props => {
    if (props.$combo >= 10) return '#FFD700';
    if (props.$combo >= 5) return '#FFA500';
    return 'white';
  }};
  opacity: ${props => props.$combo > 0 ? 1 : 0};
  transition: opacity 0.3s, color 0.3s;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  margin-top: 2px;
`;

const ScoreCounter = ({ score, combo }) => {
  return (
    <ScoreContainer>
      <ScoreText>分数: {score}</ScoreText>
      <ComboText $combo={combo}>
        {combo > 0 && `连击: ${combo}x`}
      </ComboText>
    </ScoreContainer>
  );
};

export default ScoreCounter; 