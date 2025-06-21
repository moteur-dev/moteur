// vite.config.ts
import { defineConfig } from 'vite';
import path, {dirname} from 'path';
import { fileURLToPath } from 'url';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'node16',
    ssr: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        api: 'src/routes/index.ts',
        cli: 'src/cli/moteur.ts'
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
    },
  },
});

