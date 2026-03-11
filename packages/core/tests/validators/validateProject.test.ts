import { describe, it, expect } from 'vitest';
import { validateProject } from '../../src/validators/validateProject.js';
import type { ProjectSchema } from '@moteur/types/Project.js';

function minimalProject(overrides: Partial<ProjectSchema> = {}): ProjectSchema {
    return {
        id: 'my-site',
        label: 'My Site',
        defaultLocale: 'en',
        ...overrides
    };
}

describe('validateProject', () => {
    it('returns valid for a normal project id', () => {
        const result = validateProject(minimalProject());
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('rejects reserved project id (exact match, lowercase)', () => {
        const result = validateProject(minimalProject({ id: 'admin' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_RESERVED_ID' && i.path === 'id')).toBe(
            true
        );
    });

    it('rejects reserved project id (case-insensitive)', () => {
        expect(validateProject(minimalProject({ id: 'admin' })).valid).toBe(false);
        expect(validateProject(minimalProject({ id: 'api' })).valid).toBe(false);
    });

    it('rejects project id starting with moteur-', () => {
        const result = validateProject(minimalProject({ id: 'moteur-foo' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_RESERVED_ID')).toBe(true);
    });

    it('rejects project id starting with plugin-', () => {
        const result = validateProject(minimalProject({ id: 'plugin-analytics' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_RESERVED_ID')).toBe(true);
    });

    it('rejects project id starting with plugins-', () => {
        const result = validateProject(minimalProject({ id: 'plugins-foo' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_RESERVED_ID')).toBe(true);
    });

    it('rejects project id starting with node-', () => {
        const result = validateProject(minimalProject({ id: 'node-addon' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_RESERVED_ID')).toBe(true);
    });

    it('rejects project id starting with a dot', () => {
        const result = validateProject(minimalProject({ id: '.hidden' }));
        expect(result.valid).toBe(false);
        expect(
            result.issues.some(i => i.code === 'PROJECT_INVALID_ID' && i.message?.includes('dot'))
        ).toBe(true);
    });

    it('rejects project id that does not start with a letter', () => {
        expect(validateProject(minimalProject({ id: '123site' })).valid).toBe(false);
        expect(validateProject(minimalProject({ id: '_private' })).valid).toBe(false);
    });

    it('rejects project id that is not all lowercase', () => {
        const result = validateProject(minimalProject({ id: 'my-Site' }));
        expect(result.valid).toBe(false);
        expect(
            result.issues.some(
                i => i.code === 'PROJECT_INVALID_ID' && i.message?.includes('lowercase')
            )
        ).toBe(true);
    });

    it('allows project id that only contains a reserved word as substring', () => {
        const result = validateProject(minimalProject({ id: 'my-admin-dashboard' }));
        expect(result.valid).toBe(true);
    });

    it('rejects empty id', () => {
        const result = validateProject(minimalProject({ id: '' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_INVALID_ID')).toBe(true);
    });

    it('rejects missing label', () => {
        const result = validateProject(minimalProject({ label: '' }));
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.code === 'PROJECT_INVALID_LABEL')).toBe(true);
    });
});
