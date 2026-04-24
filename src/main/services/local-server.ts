import express from 'express';
import path from 'path';
import { Server } from 'node:net';

let server: Server;

export async function startLocalServer(appRoot: string): Promise<string> {
  const app = express();

  const mainDir = path.join(appRoot, '../../', 'build', 'main', 'browser');
  const sidebarDir = path.join(
    appRoot,
    '../../',
    'build',
    'sidebar',
    'browser'
  );
  const topbarDir = path.join(appRoot, '../../', 'build', 'topbar', 'browser');

  app.use('/main', express.static(mainDir));
  app.use('/sidebar', express.static(sidebarDir));
  app.use('/topbar', express.static(topbarDir));

  return new Promise((resolve, reject) => {
    try {
      server = app.listen(0, 'localhost', () => {
        const address = server.address();
        const serverPort =
          typeof address === 'string' ? address : address?.port;
        console.log(`Local server started at http://localhost:${serverPort}`);
        resolve(`http://localhost:${serverPort}`);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function stopLocalServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Local server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}
