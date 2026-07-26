import express from 'express';
import path from 'path';
import { Server } from 'node:net';

let server: Server;

export async function startLocalServer(
  appRoot: string,
  env: string | 'production' | 'test'
): Promise<string> {
  const app = express();
  console.log('APP ROOT', appRoot);
  console.log('ENV', env);

  const mainDir =
    env !== 'test'
      ? path.join(appRoot, '../../', 'build', 'main', 'browser')
      : path.join(appRoot, '../', 'main', 'browser');
  const sidebarDir =
    env !== 'test'
      ? path.join(appRoot, '../../', 'build', 'sidebar', 'browser')
      : path.join(appRoot, '../', 'sidebar', 'browser');
  const topbarDir =
    env !== 'test'
      ? path.join(appRoot, '../../', 'build', 'topbar', 'browser')
      : path.join(appRoot, '../', 'topbar', 'browser');

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
