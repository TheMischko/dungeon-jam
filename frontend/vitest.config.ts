import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@shared\/(.*)$/, replacement: path.resolve(__dirname, '../shared/$1') },
      { find: /^@shared$/, replacement: path.resolve(__dirname, '../shared') },
      { find: /^@general\/public-api$/, replacement: path.resolve(__dirname, './projects/general/src/public-api.ts') },
      { find: /^@general\/(.*)$/, replacement: path.resolve(__dirname, './projects/general/src/lib/$1') },
      { find: /^@general$/, replacement: path.resolve(__dirname, './projects/general/src/public-api.ts') },
      { find: /^styles\/(.*)$/, replacement: path.resolve(__dirname, './projects/general/styles/$1') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
