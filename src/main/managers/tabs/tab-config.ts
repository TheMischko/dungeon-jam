import { Rectangle } from 'electron';

const SIDEBAR_WIDTH = 0.3;
const TOPBAR_HEIGHT = 0.1;

export const getTopBarRect = (
  windowWidth: number,
  windowHeight: number,
): Rectangle => {
  return {
    x: 0,
    y: 0,
    width: windowWidth,
    height: windowHeight * TOPBAR_HEIGHT,
  };
};

export const getSideBarRect = (
  windowWidth: number,
  windowHeight: number,
): Rectangle => {
  const topBar = getTopBarRect(windowWidth, windowHeight);
  return {
    x: 0,
    y: topBar.height,
    width: windowWidth * SIDEBAR_WIDTH,
    height: windowHeight - topBar.height,
  };
};

export const getMainTabRect = (
  windowWidth: number,
  windowHeight: number,
): Rectangle => {
  const sideBar = getSideBarRect(windowWidth, windowHeight);
  return {
    x: sideBar.width,
    y: sideBar.y,
    width: windowWidth - sideBar.width,
    height: windowHeight - sideBar.y,
  };
};
