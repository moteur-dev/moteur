import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateStructureField } from '../../../../src/validators/fields/core/validateStructureField.js';
import { Field } from '@moteur/types/Field.js';
import { getStructure } from '../../../../src/structures.js';

// --- Mock getStructure ---
vi.mock('../../../../src/structures.js', () => ({
    getStructure: vi.fn()
}));

describe('validateStructureField', () => {
    const sharedSchemaFields = {
        title: { type: 'core/text', label: 'Title', options: { required: true } },
        description: { type: 'core/text', label: 'Description' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates structure using shared schema', () => {
        (getStructure as vi.Mock).mockReturnValue({ fields: sharedSchemaFields });

        const field: Field = {
            type: 'core/structure',
            label: 'My Structure',
            options: { structure: 'core/mySharedStructure' }
        };

        const value = {
            content: {
                title: 'Example',
                description: 'A test'
            }
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toEqual([]);
    });

    it('validates structure using inline schema', () => {
        const field: Field = {
            type: 'core/structure',
            label: 'My Structure',
            options: {
                inlineSchema: {
                    fields: sharedSchemaFields
                }
            }
        };

        const value = {
            content: {
                title: 'Example',
                description: 'A test'
            }
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toEqual([]);
    });

    it('errors when both structure and inlineSchema are defined', () => {
        const field: Field = {
            type: 'core/structure',
            label: 'Invalid Config',
            options: {
                structure: 'core/mySharedStructure',
                inlineSchema: { fields: sharedSchemaFields }
            }
        };

        const value = {
            content: {
                title: 'Example'
            }
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toContainEqual(
            expect.objectContaining({
                type: 'error',
                code: 'INVALID_STRUCTURE_CONFIGURATION'
            })
        );
    });

    it('errors when structure is missing and no inlineSchema is provided', () => {
        const field: Field = {
            type: 'core/structure',
            label: 'Missing Schema'
        };

        const value = {
            content: {
                title: 'Example'
            }
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toContainEqual(
            expect.objectContaining({
                type: 'error',
                code: 'MISSING_STRUCTURE_OR_SCHEMA'
            })
        );
    });

    it('errors when shared schema is not found', () => {
        (getStructure as vi.Mock).mockImplementation(() => {
            throw new Error('Schema not found');
        });

        const field: Field = {
            type: 'core/structure',
            label: 'Missing Shared Schema',
            options: { structure: 'core/nonexistent' }
        };

        const value = {
            content: {
                title: 'Example'
            }
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toContainEqual(
            expect.objectContaining({
                type: 'error',
                code: 'STRUCTURE_SCHEMA_NOT_FOUND'
            })
        );
    });

    it('errors when content is not an object', () => {
        const field: Field = {
            type: 'core/structure',
            label: 'Content Invalid',
            options: {
                inlineSchema: { fields: sharedSchemaFields }
            }
        };

        const value = {
            content: 'Not an object'
        };

        const issues = validateStructureField(value, field, 'data.structureField');
        expect(issues).toContainEqual(
            expect.objectContaining({
                type: 'error',
                code: 'INVALID_STRUCTURE_CONTENT'
            })
        );
    });
});
