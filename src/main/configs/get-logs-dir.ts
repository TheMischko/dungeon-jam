import path from 'path';
import { app } from 'electron';

export const getLogsDir = () => {
  return path.join(app.getPath('userData'), 'logs');
};

export const generateLogsFilePath = () => {
  const date = new Date();
  const safeDateStr = date.toISOString().replace(/:/g, '-');
  const fileName = `${safeDateStr}.log`;
  return path.join(getLogsDir(), fileName);
};

