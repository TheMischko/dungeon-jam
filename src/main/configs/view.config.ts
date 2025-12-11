import { WebPreferences } from 'electron';
import * as path from 'node:path';

export interface ViewConfig {
  width: number;
  height: number;
  defaultPreferences: Partial<WebPreferences>;
  indexHTML: string;
}

export function getDefaultViewConfig(buildPath: string): ViewConfig {
  return {
    width: 1280,
    height: 800,
    defaultPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(buildPath),
    },
    indexHTML: getSoundCaptureIndexPath(buildPath),
  };
}

export function getPreloadPath(buildPath: string): string {
  return path.join(buildPath, 'preload.js');
}

export function getSoundCaptureIndexPath(buildPath: string): string {
  return path.join(buildPath, 'sound-capture', 'index.html');
}
