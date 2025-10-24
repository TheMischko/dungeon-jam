import { defineConfig} from "vitest/config";
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'build', 'frontend'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/main/**/*.ts'],
      exclude: [
        'node_modules/',
        'build/',
        'src/**/*.spec.ts',
        'src/main/testing/**',
        '**/*.d.ts',
        'src/index.ts',
        'src/preload.ts',
        'src/sound-capture/**',
      ],
      // Skip processing of generated code
      skipFull: true,
    },
    globals: true,
    watch: false,
    isolate: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});

