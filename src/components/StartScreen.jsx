import React from 'react';
import { styled } from 'styled-components';

const StartScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 10px;
  color: #FF8C00;
  text-shadow: 3px 3px 6px rgba(255, 0, 0, 0.5);
  transform: skew(-5deg);
  letter-spacing: 2px;
  font-weight: 900;
  -webkit-text-stroke: 1px black;
  
  span {
    color: #FF4500;
    font-size: 3.8rem;
    position: relative;
    display: inline-block;
    animation: shake 2s infinite;
  }
  
  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }
`;

const Subtitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #FFDF00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  font-style: italic;
  font-weight: bold;
  letter-spacing: 1px;
`;

const StartButton = styled.button`
  padding: 15px 40px;
  font-size: 1.5rem;
  margin-top: 20px;
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

const HighScore = styled.p`
  font-size: 1.2rem;
  margin-top: 20px;
  color: #FFF59D;
`;

const Instructions = styled.div`
  margin: 30px 0;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.5;
  text-align: left;
`;

const Footer = styled.p`
  position: absolute;
  bottom: 10px;
  font-size: 0.8rem;
  color: #CCC;
`;

const BilibiliLink = styled.a`
  color: #FB7299;
  margin-top: 15px;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: #FC9EB8;
    text-decoration: underline;
  }
`;

const StartScreen = ({ onStart, highScore }) => {
  return (
    <StartScreenContainer>
      <Title>超级无敌<span>芬达切切切</span>!</Title>
      <Subtitle>『你礼貌吗』豪华版</Subtitle>
      
      <Instructions>
        <p>游戏规则：用菜刀切割飞行的物品来获取分数！</p>
        <p>- 游戏时长只有15秒，抓紧时间切割吧！</p>
        <p>- 切割石头、烟头等物品获得积分，不同物品分数不同</p>
        <p>- 菜刀切到传票会结束游戏，游戏会喊"你礼貌吗？"</p>
        <p>- 小心传票，它出现的几率比其他物品高！</p>
        <p>- 连续切割可以获得连击加成</p>
      </Instructions>
      
      {highScore > 0 && <HighScore>历史最高分: {highScore}</HighScore>}
      
      <StartButton onClick={onStart}>开始切割!</StartButton>
      
      <BilibiliLink href="http://space.bilibili.com/24775213" target="_blank">
        关注UP主：萌威Wilson
      </BilibiliLink>
      
      <Footer>免责声明：本游戏仅供娱乐，无意冒犯任何人</Footer>
    </StartScreenContainer>
  );
};

export default StartScreen; 