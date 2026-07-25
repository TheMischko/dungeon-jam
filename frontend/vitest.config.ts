import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@general/public-api': path.resolve(__dirname, './projects/general/src/public-api.ts'),
      '@general': path.resolve(__dirname, './projects/general/src/lib'),
      'general/models': path.resolve(__dirname, './projects/general/models'),
      'general': path.resolve(__dirname, './projects/general/src/public-api.ts'),
      'styles': path.resolve(__dirname, './projects/general/styles'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
