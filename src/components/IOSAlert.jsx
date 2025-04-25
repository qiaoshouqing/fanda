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
      ⚠️ This game is not fully compatible with iOS devices. For the best experience, please use a desktop browser.
    </AlertContainer>
  );
};

export default IOSAlert; 