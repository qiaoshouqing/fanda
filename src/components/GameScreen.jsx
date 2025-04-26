import React, { useState, useEffect, useRef, memo } from 'react';
import { styled } from 'styled-components';
import { useWindowSize } from 'react-use';
import Item from './Item';
import ScoreCounter from './ScoreCounter';
import { generateRandomItem } from '../utils/itemGenerator';

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  touch-action: none;
  cursor: none; /* 隐藏默认鼠标指针 */
  background-color: rgba(0, 0, 0, 0.1); /* 轻微背景色以便更好地查看问题 */
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
`;

// 切割特效容器
const SliceEffectsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 40;
`;

// 切割特效
const SliceEffect = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  background-image: url('/assets/slice.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: ${props => props.$opacity};
  transform: translate(-50%, -50%) scale(${props => props.$scale});
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  z-index: 45;
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
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

// 切割消息提示
const CutMessageDisplay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: bold;
  color: #FFD700;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 15px 25px;
  border-radius: 15px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
  z-index: 70;
  opacity: ${props => props.$opacity};
  transition: opacity 0.3s ease-in, transform 0.3s ease-out;
  pointer-events: none;
  border: 2px solid #FF8C00;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.6);
  max-width: 80%;
  text-align: center;
  transform: translate(-50%, -50%) scale(${props => props.$scale});
`;

// 使用memo优化Item组件渲染
const MemoizedItem = memo(Item);

// 菜刀鼠标指针
const KnifeCursor = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  pointer-events: none; /* 确保鼠标事件能穿透到下面的元素 */
  z-index: 60; /* 确保在轨迹上方 */
  transform: translate(-50%, -70%) rotate(30deg);
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
`;

// 刀柄
const KnifeHandle = styled.div`
  position: absolute;
  width: 50px;
  height: 18px;
  background-color: #8B4513;
  border-radius: 3px;
  top: 35px;
  left: 45px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
`;

// 刀身
const KnifeBlade = styled.div`
  position: absolute;
  width: 65px;
  height: 40px;
  background-color: #E0E0E0;
  border-radius: 0 8px 8px 0;
  top: 24px;
  left: -15px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: white;
    opacity: 0.5;
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #A0A0A0;
    opacity: 0.7;
  }
`;

// Add this styled component for the restart button
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

const GameScreen = ({ onGameOver, onScore, score }) => {
  const { width, height } = useWindowSize();
  const [items, setItems] = useState([]);
  const [trails, setTrails] = useState([]);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(null);
  const [debug, setDebug] = useState({ itemsCount: 0, lastGen: null });
  const [sliceEffects, setSliceEffects] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15); // 15秒倒计时
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cutMessage, setCutMessage] = useState({ text: '', opacity: 0, scale: 0.5, timer: null });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const itemGeneratorRef = useRef(null);
  const audioRef = useRef({
    meizuo: new Audio('/assets/sounds/meizuo.MP3'),
    areyoupolite: new Audio('/assets/sounds/areyoupolite.MP3')
  });
  
  // 初始化游戏 - 立即生成几个物品
  useEffect(() => {
    // 立即生成几个初始物品
    const initialItems = Array.from({ length: 3 }, () => generateRandomItem(width, height));
    setItems(initialItems);
    
    // 启动物品生成器和轨迹动画
    startItemGenerator();
    animateTrail();
    
    // 预加载音效
    Object.values(audioRef.current).forEach(audio => {
      audio.load();
      // 静音预加载触发，解决部分浏览器未预加载问题
      audio.volume = 0;
      audio.play().catch(() => {});
      audio.pause();
      audio.volume = 1;
    });
    
    // 启动30秒倒计时
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // 延迟一点调用游戏结束，确保最后一秒的显示
          setTimeout(() => onGameOver('timeOver'), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(itemGeneratorRef.current);
      cancelAnimationFrame(animationRef.current);
      clearInterval(timerInterval);
    };
  }, []);
  
  // 更新调试信息
  useEffect(() => {
    setDebug(prev => ({
      ...prev,
      itemsCount: items.length
    }));
  }, [items]);
  
  // 根据难度调整生成物品的频率
  const getDifficulty = () => {
    if (score < 100) return { interval: 700, max: 12 };
    if (score < 300) return { interval: 600, max: 15 };
    if (score < 600) return { interval: 500, max: 18 };
    if (score < 1000) return { interval: 400, max: 22 };
    return { interval: 350, max: 25 };
  };
  
  // 开始生成物品
  const startItemGenerator = () => {
    if (itemGeneratorRef.current) {
      clearInterval(itemGeneratorRef.current);
    }
    
    const { interval, max } = getDifficulty();
    
    itemGeneratorRef.current = setInterval(() => {
      // 使用函数形式获取最新的items状态来判断
      setItems(prevItems => {
        if (prevItems.length < max) {
          return [...prevItems, generateRandomItem(width, height)];
        }
        return prevItems;
      });
      
      // 更新调试信息
      setDebug(prev => ({ ...prev, lastGen: new Date().toISOString() }));
    }, interval);
  };
  
  // 更新物品位置 - 设置较低的更新频率，但使用动画帧来平滑过渡
  useEffect(() => {
    let lastTime = 0;
    let animFrameId;
    
    const updateItems = (timestamp) => {
      // 限制更新频率，大约20ms一次（约50fps）但使用RAF的平滑性
      if (timestamp - lastTime > 20) {
        lastTime = timestamp;
        
        setItems(prevItems => 
          prevItems.map(item => {
            // 更新位置
            const updatedItem = {
              ...item,
              x: item.x + item.velocityX,
              y: item.y + item.velocityY,
              velocityY: item.velocityY + 0.4, // 增强重力效果
              rotation: item.rotation + item.rotationSpeed
            };
            
            // 如果物品落到屏幕下方，移除
            if (updatedItem.y > height + 100) {
              return null;
            }
            
            return updatedItem;
          }).filter(Boolean)
        );
      }
      
      animFrameId = requestAnimationFrame(updateItems);
    };
    
    animFrameId = requestAnimationFrame(updateItems);
    
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [height]);
  
  // 根据得分更新难度
  useEffect(() => {
    startItemGenerator();
  }, [score]);
  
  // 连击系统
  useEffect(() => {
    if (combo > 0) {
      if (comboTimer) clearTimeout(comboTimer);
      
      const timer = setTimeout(() => {
        setCombo(0);
      }, 2000);
      
      setComboTimer(timer);
    }
    
    return () => {
      if (comboTimer) clearTimeout(comboTimer);
    };
  }, [combo]);
  
  // 轨迹动画
  const animateTrail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 只在真正需要时更新画布尺寸
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    ctx.clearRect(0, 0, width, height);
    
    // 限制轨迹最大数量，防止内存泄漏
    if (trails.length > 15) {
      setTrails(prevTrails => prevTrails.slice(-15));
    }
    
    // 绘制轨迹
    trails.forEach((trail, index) => {
      const alpha = 1 - index / trails.length;
      
      // 创建渐变色的刀光
      const gradient = ctx.createLinearGradient(trail.x1, trail.y1, trail.x2, trail.y2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.7})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.7})`);
      
      // 主刀光轨迹 - 增加宽度与菜刀匹配
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 20;  // 增加宽度从8到20
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.stroke();
      
      // 刀光辉光 - 同样增加宽度
      ctx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 30;  // 增加宽度从14到30
      ctx.beginPath();
      ctx.moveTo(trail.x1, trail.y1);
      ctx.lineTo(trail.x2, trail.y2);
      ctx.stroke();
    });
    
    // 使用节流方式移除最旧的轨迹，减少过多状态更新
    if (trails.length > 5) {
      setTimeout(() => {
        setTrails(prevTrails => prevTrails.slice(1));
      }, 50);
    }
    
    animationRef.current = requestAnimationFrame(animateTrail);
  };
  
  // 添加切割效果 - 批量处理
  const addSliceEffects = (items) => {
    if (items.length === 0) return;
    
    setSliceEffects(prev => {
      // 创建所有新效果
      const newEffects = items.map(item => ({
        id: `slice_${Date.now()}_${Math.floor(Math.random() * 1000)}_${item.id}`,
        x: item.x,
        y: item.y,
        opacity: 1,
        scale: 1,
        createdAt: Date.now()
      }));
      
      // 合并并限制数量
      const updated = [...prev, ...newEffects];
      return updated.length > 12 ? updated.slice(-12) : updated;
    });
  };
  
  // 使用单个定时器管理所有切割效果的生命周期
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setSliceEffects(prev => {
        // 只有当真的有过期效果时才更新状态
        const filtered = prev.filter(effect => now - effect.createdAt < 300);
        return filtered.length < prev.length ? filtered : prev;
      });
    }, 100); // 每100ms清理一次过期的效果
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
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
  
  // 初始化时确保菜刀不可见
  useEffect(() => {
    // 移动设备检测
    const isTouchDevice = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          (navigator.msMaxTouchPoints > 0);
    
    // 如果是触摸设备，初始隐藏菜刀
    if (!isTouchDevice) {
      // 监听鼠标进入和离开游戏区域
      const container = containerRef.current;
      
      const handleMouseEnter = (e) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      };
      
      const handleMouseLeave = () => {
        setCursorPosition({ x: 0, y: 0 });
      };
      
      if (container) {
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
      }
      
      return () => {
        if (container) {
          container.removeEventListener('mouseenter', handleMouseEnter);
          container.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, []);
  
  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      const { clientX, clientY } = e.touches[0];
      setCursorPosition({ x: clientX, y: clientY });
    }
  };
  
  // 处理滑动事件 - 优化处理方法，减少重复计算
  const handleMove = (e) => {
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      setCursorPosition({ x: clientX, y: clientY });
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      
      // 只有按下鼠标按钮时才处理轨迹，但总是更新光标位置
      setCursorPosition({ x: clientX, y: clientY });
      
      if (e.buttons !== 1) {
        return;
      }
    }
    
    const current = { x: clientX, y: clientY };
    
    // 添加新轨迹
    if (lastTouch.x !== 0 && lastTouch.y !== 0) {
      // 计算轨迹长度 - 忽略太短的移动
      const dx = current.x - lastTouch.x;
      const dy = current.y - lastTouch.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 增加最小距离，减少过多的轨迹生成
      if (distance > 10) {
        // 使用函数更新以确保轨迹不会过多
        setTrails(prevTrails => {
          const newTrails = [
            ...prevTrails,
            {
              x1: lastTouch.x,
              y1: lastTouch.y,
              x2: current.x,
              y2: current.y
            }
          ];
          // 如果轨迹太多，只保留最近的一些
          return newTrails.length > 20 ? newTrails.slice(-20) : newTrails;
        });
        
        // 检测碰撞
        checkCollision(lastTouch, current);
        
        // 更新最后触摸点
        setLastTouch(current);
      }
    } else {
      // 首次触摸，只记录位置
      setLastTouch(current);
    }
  };
  
  // 重置触摸点
  const handleEnd = () => {
    setLastTouch({ x: 0, y: 0 });
  };
  
  // 显示切割消息
  const showCutMessage = (itemType) => {
    // 清除之前的计时器
    if (cutMessage.timer) {
      clearTimeout(cutMessage.timer);
    }
    
    let messageText = '';
    switch (itemType) {
      case 'stone':
        messageText = '他们朝我扔石头，我拿石头砌小楼';
        break;
      case 'cigarette':
        messageText = '他们朝我扔烟头，我捡起烟头抽两口';
        break;
      case 'poop':
        messageText = '他们朝我扔粑粑，我拿粑粑做蛋挞';
        break;
      case 'cabbage':
        messageText = '他们朝我扔白菜，我拿白菜炒盘菜';
        break;
      case 'egg':
        messageText = '他们朝我扔鸡蛋，我拿鸡蛋做蛋炒饭';
        break;
      case 'bottle':
        messageText = '他们朝我扔芬达，我就喝两口芬达';
        break;
      case 'mud':
        messageText = '他们朝我扔泥巴，我拿泥巴种荷花';
        break;
      case 'bomb':
        messageText = '他们朝我扔炸弹，我拿炸弹炸他们';
        break;
      default:
        return; // 不显示消息
    }
    
    // 设置消息并显示, 带有弹出动画效果
    setCutMessage({ 
      text: messageText, 
      opacity: 1,
      scale: 1.2, // 开始时放大一点
      timer: setTimeout(() => {
        // 先缩小到正常大小
        setCutMessage(prev => ({ ...prev, scale: 1 }));
        
        // 然后1.5秒后开始淡出
        setTimeout(() => {
          setCutMessage(prev => ({ ...prev, opacity: 0, scale: 0.9 }));
        }, 1500);
      }, 100)
    });
  };
  
  // 检测轨迹与物品的碰撞 - 批量处理命中和效果 - 优化性能
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
    
    // 增加切割有效范围 - 从默认的物品半径扩大到与菜刀视觉尺寸相近
    const cutRange = 35; // 切割范围与菜刀尺寸匹配
    
    // 如果屏幕上物品太多，进行更激进的预筛选以提高性能
    const preFilterDistance = items.length > 15 ? (trailLength + cutRange * 2) : (trailLength + cutRange * 2 + 50);
    
    // 检查每个物品 - 使用四叉树或空间划分可以进一步优化，但这里先用简单方法
    // 首先过滤掉明显不可能碰撞的物品（粗略检测）
    const possibleHits = items.filter(item => {
      // 快速边界检查 - 丢弃明显远离轨迹的物品
      const minX = Math.min(start.x, end.x) - cutRange - item.radius;
      const maxX = Math.max(start.x, end.x) + cutRange + item.radius;
      const minY = Math.min(start.y, end.y) - cutRange - item.radius;
      const maxY = Math.max(start.y, end.y) + cutRange + item.radius;
      
      if (item.x < minX || item.x > maxX || item.y < minY || item.y > maxY) {
        return false;
      }
      
      // 计算物品到轨迹起点和终点的距离
      const distToStart = Math.sqrt(Math.pow(item.x - start.x, 2) + Math.pow(item.y - start.y, 2));
      const distToEnd = Math.sqrt(Math.pow(item.x - end.x, 2) + Math.pow(item.y - end.y, 2));
      
      // 如果物品到起点和终点的距离之和接近轨迹长度(+切割范围的2倍)，则可能发生碰撞
      return distToStart + distToEnd < preFilterDistance;
    });
    
    // 如果没有可能的碰撞物体，提前退出
    if (possibleHits.length === 0) return;
    
    const hitItems = [];
    const animatedItems = [];
    let comboIncrease = 0;
    let gameOverTriggered = false;
    let pointsEarned = 0;
    let lastCutItemType = null;
    
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
      
      // 如果距离小于有效切割范围+物品半径，且投影点在轨迹上，则发生碰撞
      if (distance < (cutRange + item.radius) && 
          projectionLength >= -cutRange && // 允许切割轨迹起点前一点距离
          projectionLength <= trailLength + cutRange) {
        hitItems.push(item.id);
        
        // 添加到需要动画的物品列表
        animatedItems.push({
          id: item.id,
          x: item.x,
          y: item.y,
          type: item.type
        });
        
        // 记录最后切到的物品类型，用于显示消息
        lastCutItemType = item.type;
        
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
          } else if (item.type === 'poop') {
            points = 20; // 给便便最高分数
          }
          
          pointsEarned += points;
          
          // 播放声音
          playSound(item.type);
          
          // 增加连击
          comboIncrease++;
        }
      }
    });
    
    // 批量处理所有命中效果
    if (animatedItems.length > 0) {
      // 添加切割效果
      addSliceEffects(animatedItems);
      
      // 显示相应的切割消息
      if (lastCutItemType) {
        showCutMessage(lastCutItemType);
      }
      
      // 移除被击中的物品
      setItems(prevItems => 
        prevItems.filter(item => !hitItems.includes(item.id))
      );
      
      // 处理分数和连击
      if (comboIncrease > 0) {
        setCombo(prev => prev + comboIncrease);
        onScore(pointsEarned, animatedItems.some(item => item.type === 'bomb'));
      }
      
      // 处理游戏结束
      if (gameOverTriggered) {
        onGameOver('cutSummons');
      }
    }
  };
  
  // 手动添加物品按钮 (仅用于调试)
  const handleDebugAddItem = () => {
    const newItem = generateRandomItem(width, height);
    setItems(prevItems => [...prevItems, newItem]);
    
    // 为调试物品添加切割效果
    addSliceEffects([{
      id: newItem.id,
      x: newItem.x,
      y: newItem.y,
      type: newItem.type
    }]);
  };
  
  // 处理触摸结束事件
  const handleTouchEnd = () => {
    // 触摸结束时不要清除菜刀位置，保持最后的位置
    handleEnd();
  };
  
  // 处理重启游戏
  const handleRestart = () => {
    // 清理所有游戏资源
    clearInterval(itemGeneratorRef.current);
    cancelAnimationFrame(animationRef.current);
    
    // 清理所有音频资源
    Object.values(audioRef.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // 清理所有可能的状态
    setItems([]);
    setTrails([]);
    setSliceEffects([]);
    setLastTouch({ x: 0, y: 0 });
    
    // 返回到主界面
    onGameOver('restart');
  };
  
  return (
    <GameContainer 
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleMove}
      onTouchEnd={handleTouchEnd}
    >
      <Canvas ref={canvasRef} />
      
      {/* 切割消息显示 */}
      <CutMessageDisplay $opacity={cutMessage.opacity} $scale={cutMessage.scale}>
        {cutMessage.text}
      </CutMessageDisplay>
      
      {/* 菜刀鼠标指针 - 仅当位置有效时显示 */}
      {cursorPosition.x > 0 && cursorPosition.y > 0 && (
        <KnifeCursor $x={cursorPosition.x} $y={cursorPosition.y}>
          <KnifeHandle />
          <KnifeBlade />
        </KnifeCursor>
      )}
      
      {/* 游戏信息面板 */}
      <GameInfoPanel>
        <TimerDisplay>
          剩余时间: {timeLeft}秒
        </TimerDisplay>
        <ScoreCounter score={score} combo={combo} />
      </GameInfoPanel>
      
      {/* 重新开始按钮 */}
      <RestartButton onClick={handleRestart}>
        重新开始
      </RestartButton>
      
      {/* 切割特效 */}
      <SliceEffectsContainer>
        {sliceEffects.map(effect => (
          <SliceEffect
            key={effect.id}
            $x={effect.x}
            $y={effect.y}
            $opacity={effect.opacity}
            $scale={effect.scale}
          />
        ))}
      </SliceEffectsContainer>
      
      {/* 使用记忆化的物品组件 */}
      {items.map(item => (
        <MemoizedItem 
          key={item.id}
          item={item}
        />
      ))}
    </GameContainer>
  );
};

export default GameScreen; 