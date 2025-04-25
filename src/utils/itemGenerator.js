// 物品类型及其生成概率
const itemTypes = [
  { type: 'stone', probability: 12, minSize: 60, maxSize: 90 },
  { type: 'cigarette', probability: 10, minSize: 70, maxSize: 100 },
  { type: 'mud', probability: 10, minSize: 60, maxSize: 80 },
  { type: 'summons', probability: 30, minSize: 80, maxSize: 120 }, // 传票，设为总量的三分之一
  { type: 'poop', probability: 8, minSize: 60, maxSize: 90 },
  { type: 'bottle', probability: 8, minSize: 70, maxSize: 100 },
  { type: 'bomb', probability: 4, minSize: 60, maxSize: 80 },  // 炸弹，不再结束游戏，所以略微增加概率
  { type: 'cabbage', probability: 5, minSize: 80, maxSize: 120 }, // 白菜，较大尺寸
  { type: 'egg', probability: 4, minSize: 50, maxSize: 70 }   // 鸡蛋，较小尺寸
];

// 生成随机ID
const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 根据概率选择物品类型
const selectRandomType = () => {
  const totalProbability = itemTypes.reduce((sum, item) => sum + item.probability, 0);
  let random = Math.random() * totalProbability;
  
  for (const item of itemTypes) {
    if (random < item.probability) {
      return item;
    }
    random -= item.probability;
  }
  
  // 默认返回石头
  return itemTypes[0];
};

// 生成随机物品
export const generateRandomItem = (screenWidth, screenHeight) => {
  const selectedItem = selectRandomType();
  
  // 随机大小
  const size = Math.floor(Math.random() * (selectedItem.maxSize - selectedItem.minSize) + selectedItem.minSize);
  
  // 位置 - 从屏幕底部边缘随机位置发射
  const x = Math.random() * (screenWidth - 100) + 50; // 避免靠边
  const y = screenHeight + 50; // 在屏幕底部下方一点，使其看起来是从外部飞入
  
  // 随机速度 - 显著增加初始速度
  const velocityY = Math.random() * -20 - 25; // 大幅增加向上的初始速度
  const velocityX = (Math.random() - 0.5) * 14; // 增加左右随机速度
  
  // 随机旋转
  const rotation = Math.random() * 360;
  const rotationSpeed = (Math.random() - 0.5) * 18; // 增加旋转速度
  
  // 物品半径用于碰撞检测
  const radius = size / 2;
  
  return {
    id: generateId(),
    type: selectedItem.type,
    x,
    y,
    size,
    velocityX,
    velocityY,
    rotation,
    rotationSpeed,
    radius
  };
}; 