import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { styled } from 'styled-components';

// 样式化游戏容器
const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// 游戏画布容器
const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 重启按钮
const RestartButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid white;
  border-radius: 5px;
  padding: 8px 15px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// 游戏信息面板
const GameInfoPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
`;

// 计时器组件
const TimerDisplay = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

// 分数和连击组件
const ScoreDisplay = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

// 开始界面
const StartScreenOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 200;
  color: white;
  text-align: center;
`;

// 标题样式
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

// 副标题样式
const Subtitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #FFDF00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  font-style: italic;
  font-weight: bold;
  letter-spacing: 1px;
`;

// 游戏规则说明
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

// 开始按钮
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

// B站链接样式
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

// 底部声明
const Footer = styled.p`
  position: absolute;
  bottom: 10px;
  font-size: 0.8rem;
  color: #CCC;
`;

// 游戏结束界面
const GameOverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 200;
  color: white;
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

// PixiJS 游戏组件
const PixiGame = () => {
  // 游戏状态
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fantaHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOverReason, setGameOverReason] = useState('');
  
  // 引用
  const pixiContainerRef = useRef(null);
  const appRef = useRef(null);
  const itemsRef = useRef([]);
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const trailsRef = useRef([]);
  const knifeRef = useRef(null);
  const timerRef = useRef(null);
  const generatorRef = useRef(null);
  const comboTimerRef = useRef(null);
  const audioRef = useRef({
    meizuo: new Audio('/assets/sounds/meizuo.MP3'),
    areyoupolite: new Audio('/assets/sounds/areyoupolite.MP3')
  });
  
  // 初始化PixiJS应用
  useEffect(() => {
    if (!pixiContainerRef.current) return;
    
    // 创建PixiJS应用
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x111111,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });
    
    // 添加到DOM
    pixiContainerRef.current.appendChild(app.view);
    appRef.current = app;
    
    // 创建用于刀光轨迹的图形
    const trailsGraphics = new PIXI.Graphics();
    app.stage.addChild(trailsGraphics);
    
    // 创建菜刀光标
    const knife = new PIXI.Container();
    const knifeHandle = new PIXI.Graphics();
    knifeHandle.beginFill(0x8B4513);
    knifeHandle.drawRoundedRect(0, 0, 50, 18, 3);
    knifeHandle.endFill();
    knifeHandle.position.set(45, 35);
    
    const knifeBlade = new PIXI.Graphics();
    knifeBlade.beginFill(0xE0E0E0);
    knifeBlade.drawRoundedRect(0, 0, 65, 40, 8);
    knifeBlade.endFill();
    knifeBlade.position.set(-15, 24);
    
    knife.addChild(knifeHandle);
    knife.addChild(knifeBlade);
    knife.pivot.set(40, 40);
    knife.rotation = Math.PI / 6; // 30度
    knife.visible = false;
    app.stage.addChild(knife);
    knifeRef.current = knife;
    
    // 预加载音效
    Object.values(audioRef.current).forEach(audio => {
      audio.load();
      audio.volume = 0;
      audio.play().catch(() => {});
      audio.pause();
      audio.volume = 1;
    });
    
    // 监听窗口大小变化
    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      trailsGraphics.clear();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 动画循环
    app.ticker.add(() => {
      // 只在游戏进行中更新
      if (gameState !== 'playing') return;
      
      // 更新物品位置
      updateItems();
      
      // 绘制轨迹
      drawTrails(trailsGraphics);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      pixiContainerRef.current.innerHTML = '';
    };
  }, [gameState]);
  
  // 更新物品位置
  const updateItems = () => {
    const app = appRef.current;
    if (!app) return;
    
    const itemsToRemove = [];
    
    itemsRef.current.forEach((item, index) => {
      // 更新位置
      item.y += item.velocityY;
      item.x += item.velocityX;
      item.velocityY += 0.4; // 重力
      item.rotation += item.rotationSpeed;
      
      // 更新显示对象位置
      item.sprite.position.set(item.x, item.y);
      item.sprite.rotation = item.rotation;
      
      // 如果物品落到屏幕下方，移除
      if (item.y > app.renderer.height + 100) {
        itemsToRemove.push(index);
      }
    });
    
    // 从后往前移除，避免索引问题
    for (let i = itemsToRemove.length - 1; i >= 0; i--) {
      const index = itemsToRemove[i];
      const item = itemsRef.current[index];
      app.stage.removeChild(item.sprite);
      itemsRef.current.splice(index, 1);
    }
  };
  
  // 绘制轨迹
  const drawTrails = (graphics) => {
    graphics.clear();
    
    // 限制轨迹最大数量
    if (trailsRef.current.length > 15) {
      trailsRef.current = trailsRef.current.slice(-15);
    }
    
    trailsRef.current.forEach((trail, index) => {
      const alpha = 1 - index / trailsRef.current.length;
      
      // 主刀光轨迹
      graphics.lineStyle(20, 0xFFFFFF, alpha * 0.7, 0.5, true);
      graphics.moveTo(trail.x1, trail.y1);
      graphics.lineTo(trail.x2, trail.y2);
      
      // 刀光辉光
      graphics.lineStyle(30, 0xC8E6FF, alpha * 0.5, 0.5, true);
      graphics.moveTo(trail.x1, trail.y1);
      graphics.lineTo(trail.x2, trail.y2);
    });
  };
  
  // 生成随机物品
  const generateRandomItem = () => {
    const app = appRef.current;
    if (!app) return;
    
    const itemTypes = [
      { type: 'stone', probability: 12, minSize: 60, maxSize: 90, texture: 'stone.svg' },
      { type: 'cigarette', probability: 10, minSize: 70, maxSize: 100, texture: 'cigarette.svg' },
      { type: 'mud', probability: 10, minSize: 60, maxSize: 80, texture: 'mud.svg' },
      { type: 'summons', probability: 30, minSize: 80, maxSize: 120, texture: 'summons.svg' },
      { type: 'poop', probability: 8, minSize: 60, maxSize: 90, texture: 'poop.svg' },
      { type: 'bottle', probability: 8, minSize: 70, maxSize: 100, texture: 'bottle.svg' },
      { type: 'bomb', probability: 4, minSize: 60, maxSize: 80, texture: 'bomb.svg' },
      { type: 'cabbage', probability: 5, minSize: 80, maxSize: 120, texture: 'cabbage.svg' },
      { type: 'egg', probability: 4, minSize: 50, maxSize: 70, texture: 'egg.svg' }
    ];
    
    // 根据概率选择物品类型
    const totalProbability = itemTypes.reduce((sum, item) => sum + item.probability, 0);
    let random = Math.random() * totalProbability;
    let selectedItem = itemTypes[0];
    
    for (const item of itemTypes) {
      if (random < item.probability) {
        selectedItem = item;
        break;
      }
      random -= item.probability;
    }
    
    // 随机大小
    const size = Math.floor(Math.random() * (selectedItem.maxSize - selectedItem.minSize) + selectedItem.minSize);
    
    // 位置 - 从屏幕底部边缘随机位置发射
    const x = Math.random() * (app.renderer.width - 100) + 50;
    const y = app.renderer.height + 50;
    
    // 随机速度
    const velocityY = Math.random() * -20 - 25;
    const velocityX = (Math.random() - 0.5) * 14;
    
    // 随机旋转
    const rotation = Math.random() * Math.PI * 2;
    const rotationSpeed = (Math.random() - 0.5) * 0.3;
    
    // 物品半径用于碰撞检测
    const radius = size / 2;
    
    // 创建显示对象
    const sprite = new PIXI.Sprite(PIXI.Texture.from(`/assets/${selectedItem.texture}`));
    sprite.anchor.set(0.5);
    sprite.width = size;
    sprite.height = size;
    sprite.position.set(x, y);
    sprite.rotation = rotation;
    
    app.stage.addChild(sprite);
    
    // 创建物品数据
    const item = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: selectedItem.type,
      x,
      y,
      size,
      velocityX,
      velocityY,
      rotation,
      rotationSpeed,
      radius,
      sprite
    };
    
    itemsRef.current.push(item);
  };
  
  // 添加切割效果
  const addSliceEffect = (x, y) => {
    const app = appRef.current;
    if (!app) return;
    
    // 创建切割效果精灵
    const slice = new PIXI.Sprite(PIXI.Texture.from('/assets/slice.svg'));
    slice.anchor.set(0.5);
    slice.width = slice.height = 60;
    slice.position.set(x, y);
    slice.alpha = 1;
    app.stage.addChild(slice);
    
    // 创建切割效果动画
    const startScale = 1;
    const endScale = 1.5;
    const duration = 300; // 毫秒
    const startTime = Date.now();
    
    const animateSlice = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      slice.scale.set(startScale + (endScale - startScale) * progress);
      slice.alpha = 1 - progress;
      
      if (progress < 1) {
        requestAnimationFrame(animateSlice);
      } else {
        app.stage.removeChild(slice);
        slice.destroy();
      }
    };
    
    requestAnimationFrame(animateSlice);
  };
  
  // 播放音效
  const playSound = (type) => {
    try {
      if (type === 'summons') {
        audioRef.current.areyoupolite.currentTime = 0;
        audioRef.current.areyoupolite.play();
      } else {
        audioRef.current.meizuo.currentTime = 0;
        audioRef.current.meizuo.play();
      }
    } catch (error) {
      console.log('音效播放失败:', error);
    }
  };
  
  // 检测碰撞
  const checkCollision = (start, end) => {
    // 创建轨迹向量
    const trailVector = {
      x: end.x - start.x,
      y: end.y - start.y
    };
    
    const trailLength = Math.sqrt(trailVector.x * trailVector.x + trailVector.y * trailVector.y);
    
    // 轨迹太短，不检测
    if (trailLength < 10) return;
    
    // 规范化轨迹向量
    const normalizedTrail = {
      x: trailVector.x / trailLength,
      y: trailVector.y / trailLength
    };
    
    // 切割范围
    const cutRange = 35;
    
    // 碰撞预筛选
    const preFilterDistance = itemsRef.current.length > 15 
      ? (trailLength + cutRange * 2) 
      : (trailLength + cutRange * 2 + 50);
    
    // 预筛选可能碰撞的物品
    const possibleHits = itemsRef.current.filter(item => {
      // 快速边界检查
      const minX = Math.min(start.x, end.x) - cutRange - item.radius;
      const maxX = Math.max(start.x, end.x) + cutRange + item.radius;
      const minY = Math.min(start.y, end.y) - cutRange - item.radius;
      const maxY = Math.max(start.y, end.y) + cutRange + item.radius;
      
      if (item.x < minX || item.x > maxX || item.y < minY || item.y > maxY) {
        return false;
      }
      
      // 计算距离
      const distToStart = Math.sqrt(Math.pow(item.x - start.x, 2) + Math.pow(item.y - start.y, 2));
      const distToEnd = Math.sqrt(Math.pow(item.x - end.x, 2) + Math.pow(item.y - end.y, 2));
      
      return distToStart + distToEnd < preFilterDistance;
    });
    
    if (possibleHits.length === 0) return;
    
    const hitItems = [];
    const animatedItems = [];
    let comboIncrease = 0;
    let gameOverTriggered = false;
    let pointsEarned = 0;
    
    possibleHits.forEach(item => {
      // 计算物品中心到轨迹起点的向量
      const itemToStart = {
        x: item.x - start.x,
        y: item.y - start.y
      };
      
      // 计算物品中心在轨迹上的投影长度
      const projectionLength = itemToStart.x * normalizedTrail.x + itemToStart.y * normalizedTrail.y;
      
      // 计算物品中心到轨迹的最短距离
      const projectionPoint = {
        x: start.x + normalizedTrail.x * projectionLength,
        y: start.y + normalizedTrail.y * projectionLength
      };
      
      const distance = Math.sqrt(
        Math.pow(item.x - projectionPoint.x, 2) + 
        Math.pow(item.y - projectionPoint.y, 2)
      );
      
      // 检测碰撞
      if (distance < (cutRange + item.radius) && 
          projectionLength >= -cutRange && 
          projectionLength <= trailLength + cutRange) {
        
        hitItems.push(item.id);
        
        // 添加到需要动画的物品列表
        animatedItems.push({
          id: item.id,
          x: item.x,
          y: item.y,
          type: item.type
        });
        
        if (item.type === 'summons') {
          // 传票被击中，游戏结束
          playSound('summons');
          gameOverTriggered = true;
        } else {
          // 增加分数 - 根据物品类型给予不同分数
          let points = 5 + Math.floor(combo / 3); // 基础分数
          
          // 不同物品类型的分数
          if (item.type === 'bomb') {
            points = 15; // 炸弹给更高分数
          } else if (item.type === 'cabbage') {
            points = 12; // 白菜较高分数
          } else if (item.type === 'egg') {
            points = 8; // 鸡蛋中等分数
          }
          
          pointsEarned += points;
          
          // 播放声音
          playSound(item.type);
          
          // 增加连击
          comboIncrease++;
        }
      }
    });
    
    // 批量处理命中效果
    if (animatedItems.length > 0) {
      // 添加切割效果
      animatedItems.forEach(item => {
        addSliceEffect(item.x, item.y);
      });
      
      // 移除被击中的物品
      const app = appRef.current;
      hitItems.forEach(id => {
        const index = itemsRef.current.findIndex(item => item.id === id);
        if (index !== -1) {
          const item = itemsRef.current[index];
          app.stage.removeChild(item.sprite);
          itemsRef.current.splice(index, 1);
        }
      });
      
      // 处理分数和连击
      if (comboIncrease > 0) {
        setScore(prev => prev + pointsEarned);
        setCombo(prev => prev + comboIncrease);
        
        // 更新连击计时器
        if (comboTimerRef.current) {
          clearTimeout(comboTimerRef.current);
        }
        
        comboTimerRef.current = setTimeout(() => {
          setCombo(0);
        }, 2000);
      }
      
      // 处理游戏结束
      if (gameOverTriggered) {
        endGame('cutSummons');
      }
    }
  };
  
  // 处理鼠标/触摸移动
  const handleMove = (e) => {
    if (gameState !== 'playing') return;
    
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      
      // 鼠标拖动时才处理轨迹
      if (e.buttons !== 1) {
        updateKnifePosition(clientX, clientY);
        return;
      }
    }
    
    // 更新菜刀位置
    updateKnifePosition(clientX, clientY);
    
    const current = { x: clientX, y: clientY };
    
    // 添加新轨迹
    if (lastTouchRef.current.x !== 0 && lastTouchRef.current.y !== 0) {
      // 计算轨迹长度
      const dx = current.x - lastTouchRef.current.x;
      const dy = current.y - lastTouchRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 忽略太短的移动
      if (distance > 10) {
        // 添加轨迹
        trailsRef.current.push({
          x1: lastTouchRef.current.x,
          y1: lastTouchRef.current.y,
          x2: current.x,
          y2: current.y
        });
        
        // 检测碰撞
        checkCollision(lastTouchRef.current, current);
        
        // 更新最后触摸点
        lastTouchRef.current = { ...current };
      }
    } else {
      // 首次触摸，只记录位置
      lastTouchRef.current = { ...current };
    }
  };
  
  // 处理触摸/鼠标结束
  const handleEnd = () => {
    lastTouchRef.current = { x: 0, y: 0 };
  };
  
  // 更新菜刀位置
  const updateKnifePosition = (x, y) => {
    if (!knifeRef.current) return;
    
    knifeRef.current.position.set(x, y);
    knifeRef.current.visible = true;
  };
  
  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(15);
    
    const app = appRef.current;
    if (!app) return;
    
    // 清空物品和轨迹
    itemsRef.current.forEach(item => {
      app.stage.removeChild(item.sprite);
    });
    itemsRef.current = [];
    trailsRef.current = [];
    
    // 生成初始物品
    for (let i = 0; i < 3; i++) {
      generateRandomItem();
    }
    
    // 开始物品生成器
    startItemGenerator();
    
    // 开始倒计时
    startTimer();
  };
  
  // 开始物品生成器
  const startItemGenerator = () => {
    if (generatorRef.current) {
      clearInterval(generatorRef.current);
    }
    
    // 根据分数调整难度
    const getDifficulty = () => {
      if (score < 100) return { interval: 700, max: 12 };
      if (score < 300) return { interval: 600, max: 15 };
      if (score < 600) return { interval: 500, max: 18 };
      if (score < 1000) return { interval: 400, max: 22 };
      return { interval: 350, max: 25 };
    };
    
    const { interval, max } = getDifficulty();
    
    generatorRef.current = setInterval(() => {
      if (itemsRef.current.length < max) {
        generateRandomItem();
      }
    }, interval);
  };
  
  // 开始倒计时
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => endGame('timeOver'), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 结束游戏
  const endGame = (reason) => {
    setGameState('gameOver');
    setGameOverReason(reason);
    
    // 停止所有计时器
    if (generatorRef.current) {
      clearInterval(generatorRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    
    // 更新最高分
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fantaHighScore', score.toString());
    }
  };
  
  // 重新开始游戏
  const handleRestart = () => {
    // 清理所有资源
    if (generatorRef.current) {
      clearInterval(generatorRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    
    // 清理所有音频资源
    Object.values(audioRef.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // 返回开始界面
    setGameState('start');
  };
  
  // 获取游戏结束原因文本
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
  
  return (
    <GameContainer>
      <CanvasContainer ref={pixiContainerRef}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
      />
      
      {/* 游戏信息面板 - 只在游戏进行中显示 */}
      {gameState === 'playing' && (
        <>
          <GameInfoPanel>
            <TimerDisplay>剩余时间: {timeLeft}秒</TimerDisplay>
            <ScoreDisplay>得分: {score} {combo > 1 && `(连击 x${combo})`}</ScoreDisplay>
          </GameInfoPanel>
          
          <RestartButton onClick={handleRestart}>
            重新开始
          </RestartButton>
        </>
      )}
      
      {/* 开始界面 */}
      {gameState === 'start' && (
        <StartScreenOverlay>
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
          
          {highScore > 0 && <p>历史最高分: {highScore}</p>}
          
          <StartButton onClick={startGame}>开始切割!</StartButton>
          
          <BilibiliLink href="http://space.bilibili.com/24775213" target="_blank">
            关注UP主：萌威Wilson
          </BilibiliLink>
          
          <Footer>免责声明：本游戏仅供娱乐，无意冒犯任何人</Footer>
        </StartScreenOverlay>
      )}
      
      {/* 游戏结束界面 */}
      {gameState === 'gameOver' && (
        <GameOverOverlay>
          <GameOverTitle>游戏结束</GameOverTitle>
          <GameOverReason>{getReasonText(gameOverReason)}</GameOverReason>
          <FinalScore>最终得分: {score}</FinalScore>
          
          <ButtonsContainer>
            <StartButton onClick={startGame}>再玩一次</StartButton>
            <StartButton onClick={handleRestart} style={{ backgroundColor: '#2196F3' }}>
              回到主页
            </StartButton>
          </ButtonsContainer>
          
          <BilibiliLink href="http://space.bilibili.com/24775213" target="_blank">
            关注UP主：萌威Wilson
          </BilibiliLink>
        </GameOverOverlay>
      )}
    </GameContainer>
  );
};

export default PixiGame; 