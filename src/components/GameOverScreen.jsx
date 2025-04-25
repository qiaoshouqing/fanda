import React from 'react';
import { styled } from 'styled-components';

const GameOverContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 20px;
`;

const GameOverTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #FF5252;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ScoreDisplay = styled.div`
  font-size: 2rem;
  margin: 20px 0;
`;

const Score = styled.p`
  margin: 5px 0;
  font-size: ${props => props.$isHighScore ? '2.5rem' : '2rem'};
  color: ${props => props.$isHighScore ? '#FFD700' : 'white'};
`;

const HighScoreText = styled.span`
  color: #FFD700;
  font-weight: bold;
  font-size: 1.2rem;
  display: block;
  margin-top: 5px;
`;

const RestartButton = styled.button`
  padding: 15px 40px;
  font-size: 1.5rem;
  margin-top: 30px;
  background-color: #FF8C00;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;

  &:hover {
    background-color: #FFA500;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const GameOverScreen = ({ score, highScore, onRestart }) => {
  const isNewHighScore = score > highScore;
  
  return (
    <GameOverContainer>
      <GameOverTitle>游戏结束</GameOverTitle>
      
      <ScoreDisplay>
        <Score $isHighScore={isNewHighScore}>
          得分: {score}
          {isNewHighScore && <HighScoreText>新的最高分！</HighScoreText>}
        </Score>
        {!isNewHighScore && <Score>最高分: {highScore}</Score>}
      </ScoreDisplay>
      
      <RestartButton onClick={onRestart}>再来一次</RestartButton>
    </GameOverContainer>
  );
};

export default GameOverScreen; 