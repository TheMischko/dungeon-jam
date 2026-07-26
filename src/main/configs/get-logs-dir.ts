import path from 'path';
import { app } from 'electron';
import { getLocalISODateString } from '../utils/get-local-iso-date-string';

export const getLogsDir = () => {
  return path.join(app.getPath('userData'), 'logs');
};

export const generateLogsFilePath = () => {
  const safeDateStr = getLocalISODateString();
  const fileName = `${safeDateStr}.log`;
  return path.join(getLogsDir(), fileName);
};
