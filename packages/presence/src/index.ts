import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Loading ', resolve(__dirname, '../../.env'));
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Make sure all fields are registered
import '@moteur/core/fields';

export { createPresenceServer } from './server';
