import path from 'node:path';

import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsConfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  cacheDir: './.vitest/cache',
  test: {
    mockReset: true,
    restoreMocks: true,
    includeSource: ['**/*.ts'],
    outputFile: {
      json: './.vitest/output.json',
      html: './.vitest/output.html'
    },
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './.vitest/coverage',
      reporter: ['text', 'html-spa', 'json', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    pool: 'forks',
    poolOptions: {
      threads: {
        singleThread: false
      },
      forks: {
        isolate: true
      }
    },
    retry: 2,
    testTimeout: 10_000,
    hookTimeout: 10_000,
    sequence: {
      hooks: 'stack',
      shuffle: false
    },
    typecheck: {
      enabled: true,
      ignoreSourceErrors: false
    },
    // TODO - benchmark
    unstubEnvs: true,
    dangerouslyIgnoreUnhandledErrors: false
  },
  esbuild: {
    keepNames: true
  }
});
