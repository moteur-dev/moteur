import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node', // change to 'jsdom' if testing DOM
        include: ['src/**/*.test.ts'], // adjust as needed
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['**/*.test.ts'],
            skipFull: false, // <= keep report even if everything is covered
            reportsDirectory: './coverage'
        }
    }
});
