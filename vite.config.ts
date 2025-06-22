// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'node16',
    ssr: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        api: 'src/api.ts',
        cli: 'src/cli.ts'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'esm'
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@moteur/types': path.resolve(__dirname, 'packages/types/src'),
      '@moteur/core': path.resolve(__dirname, 'packages/core/src'),
      '@moteur/cli': path.resolve(__dirname, 'packages/cli/src'),
      '@moteur/api': path.resolve(__dirname, 'packages/api/src')
    },
  },
});

