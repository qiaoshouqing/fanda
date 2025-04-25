import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { Howl } from 'howler';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import GameOver from './components/GameOver';

// 游戏状态枚举
const GameState = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

// 音效
const sounds = {
  slice: new Howl({
    src: ['/sounds/slice.mp3'],
    volume: 0.5
  }),
  gameOver: new Howl({
    src: ['/sounds/gameover.mp3'],
    volume: 0.7
  }),
  noSeat: new Howl({
    src: ['/sounds/noseat.mp3'],
    volume: 0.8
  }),
  background: new Howl({
    src: ['/sounds/background.mp3'],
    volume: 0.3,
    loop: true
  })
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

function App() {
  const [gameState, setGameState] = useState(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fantaHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOverReason, setGameOverReason] = useState('');

  // 更新最高分
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fantaHighScore', score.toString());
    }
  }, [score, highScore]);

  // 开始游戏
  const startGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
    sounds.background.play();
  };
  
  // 回到主页
  const goToHome = () => {
    setGameState(GameState.START);
    // 停止所有可能的音效
    Object.values(sounds).forEach(sound => {
      if (sound.playing()) {
        sound.stop();
      }
    });
  };

  // 结束游戏
  const endGame = (reason = '') => {
    setGameOverReason(reason);
    
    // 如果是通过重新开始按钮，直接回到开始界面
    if (reason === 'restart') {
      goToHome();
      return;
    }
    
    setGameState(GameState.GAME_OVER);
    sounds.background.stop();
    
    // 根据结束原因播放不同音效
    if (reason === 'cutSummons') {
      sounds.noSeat.play();
    } else {
      sounds.gameOver.play();
    }
  };

  // 处理得分
  const handleScore = (points, isSummons = false) => {
    setScore(prevScore => prevScore + points);
    if (isSummons) {
      sounds.noSeat.play();
    } else {
      sounds.slice.play();
    }
  };

  return (
    <AppContainer>
      {gameState === GameState.START && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}
      
      {gameState === GameState.PLAYING && (
        <GameScreen onGameOver={endGame} onScore={handleScore} score={score} />
      )}
      
      {gameState === GameState.GAME_OVER && (
        <GameOver 
          reason={gameOverReason} 
          score={score} 
          onRestart={startGame}
          onGoHome={goToHome}
        />
      )}
    </AppContainer>
  );
}

export default App; 