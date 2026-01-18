import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['utils/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/defs.ts',
        '**/i18n.ts',
        '**/alert.ts',
        '**/responsive.ts',
        '**/PressableLink.tsx',
        '**/useScreenRotation.ts',
        '**/config.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 95,
        branches: 75,
        statements: 85,
      },
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      utils: path.resolve(__dirname, './utils'),
      components: path.resolve(__dirname, './components'),
      context: path.resolve(__dirname, './context'),
      assets: path.resolve(__dirname, './assets'),
    },
  },
});
