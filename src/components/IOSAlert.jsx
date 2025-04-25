import React from 'react';
import { styled } from 'styled-components';

const AlertContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffcc00;
  color: #333;
  padding: 15px;
  text-align: center;
  z-index: 1000;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const IOSAlert = () => {
  return (
    <AlertContainer>
      ⚠️ 此游戏与iOS设备不完全兼容，会产生异常卡顿。为获得最佳体验，请使用桌面浏览器。
    </AlertContainer>
  );
};

export default IOSAlert; 