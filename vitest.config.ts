import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Root Vitest config for reference. Actual tests live in packages (api, cli, core, presence).
 * Run all tests from root: pnpm test
 * Run tests in a package: pnpm --filter @moteur/core test
 */
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: [], // tests are in packages/*/tests — use: pnpm test
        passWithNoTests: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});
