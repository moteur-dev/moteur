import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config';
import { ProjectSchema } from '../types/Project';

export function loadProjects(): ProjectSchema[] {
    const root = path.resolve(moteurConfig.projectRoot ?? 'projects');

    if (!fs.existsSync(root)) return [];

    return fs
        .readdirSync(root)
        .filter(dir => {
            const fullPath = path.join(root, dir, 'project.json');
            return fs.existsSync(fullPath);
        })
        .map(dir => {
            const configPath = path.join(root, dir, 'project.json');
            try {
                const raw = fs.readFileSync(configPath, 'utf-8');
                const schema = JSON.parse(raw) as ProjectSchema;
                return { ...schema, id: dir }; // enforce folder name as ID fallback
            } catch (err) {
                console.error(`[Moteur] Failed to load project config for "${dir}"`, err);
                return null;
            }
        })
        .filter((p): p is ProjectSchema => p !== null);
}
