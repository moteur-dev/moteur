import type { ModelSchema } from './Model.js';
import type { Layout } from './Layout.js';
import type { StructureSchema } from './Structure.js';

/**
 * Template content applied when creating a project from a blueprint.
 * All arrays are optional; empty or missing means no resources of that type.
 */
export interface BlueprintTemplate {
    models?: ModelSchema[];
    layouts?: Layout[];
    structures?: StructureSchema[];
}

/** Discriminator for blueprint kind. Default is 'project' when omitted. */
export type BlueprintKind = 'project' | 'model' | 'structure';

/**
 * Template for a model blueprint (kind === 'model').
 * Single model schema to instantiate in a project.
 */
export interface ModelBlueprintTemplate {
    model: ModelSchema;
}

/**
 * Template for a structure blueprint (kind === 'structure').
 * Single structure schema to instantiate in a project.
 */
export interface StructureBlueprintTemplate {
    structure: StructureSchema;
}

/**
 * Blueprint: reusable template with metadata.
 * - kind 'project' (or omitted): template is BlueprintTemplate (models, layouts, structures).
 * - kind 'model': template is ModelBlueprintTemplate (single model).
 * - kind 'structure': template is StructureBlueprintTemplate (single structure).
 */
export interface BlueprintSchema {
    id: string;
    name: string;
    description?: string;
    kind?: BlueprintKind;
    template?: BlueprintTemplate | ModelBlueprintTemplate | StructureBlueprintTemplate;
}
