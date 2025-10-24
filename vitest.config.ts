import { defineConfig} from "vitest/config";
import path from 'path';

export default defineConfig({
  test: {
    // Use Node environment for Electron backend testing
    environment: 'node',

    // Test file patterns
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'build', 'frontend'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      //outputDir: './coverage',
      exclude: [
        'node_modules/',
        'build/',
        'src/**/*.spec.ts',
        '**/*.d.ts',
        '**/index.ts',
      ],
      //lines: 80,
      //functions: 80,
      //branches: 70,
      //statements: 80,
    },

    // Globals for test functions (describe, it, expect, etc.)
    globals: true,

    // Watch mode settings
    watch: false,

    // Isolate test environments
    isolate: true,

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});

