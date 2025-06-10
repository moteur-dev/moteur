import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config.js';
import { Layout } from '../types/Layout.js';

export function loadLayouts(project: string): Layout[] {
    const projectRoot = moteurConfig.projectRoot || 'data/projects';
    const dir = path.resolve(`${projectRoot}/${project}/layouts`);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const filePath = path.join(dir, f);
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                const layout = JSON.parse(raw) as Layout;
                return layout;
            } catch (err) {
                console.warn(`[Moteur] Failed to load layout ${f}`, err);
                return null;
            }
        })
        .filter((l): l is Layout => l !== null);
}
