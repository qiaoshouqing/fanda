import React from 'react';
import { styled } from 'styled-components';

const ItemImage = styled.div`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  left: ${props => props.$x - props.$size / 2}px;
  top: ${props => props.$y - props.$size / 2}px;
  background-image: url(${props => props.$image});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: rotate(${props => props.$rotation}deg);
  transform-origin: center;
  transition: transform 0.1s ease-out;
  filter: ${props => props.$type === 'bomb' ? 'drop-shadow(0 0 5px red)' : 'none'};
  z-index: ${props => props.$type === 'summons' ? 5 : props.$type === 'bomb' ? 10 : 1};
`;

// 物品图像映射 - 修正为使用SVG文件
const itemImages = {
  stone: '/assets/stone.svg',
  cigarette: '/assets/cigarette.svg',
  mud: '/assets/mud.svg',
  summons: '/assets/summons.svg',
  poop: '/assets/poop.svg',
  bottle: '/assets/bottle.svg',
  bomb: '/assets/bomb.svg',
  cabbage: '/assets/cabbage.svg',
  egg: '/assets/egg.svg'
};

const Item = ({ item }) => {
  const { x, y, type, size, rotation, id } = item;
  
  return (
    <ItemImage
      $x={x}
      $y={y}
      $size={size}
      $rotation={rotation}
      $image={itemImages[type]}
      $type={type}
      $id={id}
    />
  );
};

export default Item; 