import { Rectangle } from 'electron';

const SIDEBAR_WIDTH = 0.3;
const TOPBAR_HEIGHT_PX = 60;

export const getTopBarRect = (windowWidth: number, _: number): Rectangle => {
  return {
    x: 0,
    y: 0,
    width: windowWidth,
    height: TOPBAR_HEIGHT_PX,
  };
};

export const getSideBarRect = (
  windowWidth: number,
  windowHeight: number
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
  windowHeight: number
): Rectangle => {
  const sideBar = getSideBarRect(windowWidth, windowHeight);
  return {
    x: sideBar.width,
    y: sideBar.y,
    width: windowWidth - sideBar.width,
    height: windowHeight - sideBar.y,
  };
};
