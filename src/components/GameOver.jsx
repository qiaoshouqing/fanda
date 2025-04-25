import React from 'react';
import { styled } from 'styled-components';

const GameOverContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  color: white;
  text-align: center;
`;

const GameOverTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
`;

const GameOverReason = styled.p`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  max-width: 80%;
  text-align: left;
`;

const FinalScore = styled.div`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const PlayAgainButton = styled(Button)`
  background-color: #4caf50;
  
  &:hover {
    background-color: #45a049;
  }
`;

const HomeButton = styled(Button)`
  background-color: #2196F3;
  
  &:hover {
    background-color: #0b7dda;
  }
`;

const BilibiliLink = styled.a`
  color: #FB7299;
  margin-top: 20px;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: #FC9EB8;
    text-decoration: underline;
  }
`;

const getReasonText = (reason) => {
  switch (reason) {
    case 'timeOver':
      return '时间到！你的15秒游戏时间已结束。';
    case 'cutSummons':
      return '你切到了传票！你礼貌吗？';
    default:
      return '游戏结束！';
  }
};

const GameOver = ({ reason, score, onRestart, onGoHome }) => {
  return (
    <GameOverContainer>
      <GameOverTitle>游戏结束</GameOverTitle>
      <GameOverReason>{getReasonText(reason)}</GameOverReason>
      <FinalScore>最终得分: {score}</FinalScore>
      <ButtonsContainer>
        <PlayAgainButton onClick={onRestart}>再玩一次</PlayAgainButton>
        <HomeButton onClick={onGoHome}>回到主页</HomeButton>
      </ButtonsContainer>
      <BilibiliLink href="http://space.bilibili.com/24775213" target="_blank">
        关注UP主：萌威Wilson
      </BilibiliLink>
    </GameOverContainer>
  );
};

export default GameOver; 