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

/**
 * Project blueprint: reusable template with metadata and optional
 * models, layouts, and structures to apply to a new project.
 */
export interface BlueprintSchema {
    id: string;
    name: string;
    description?: string;
    template?: BlueprintTemplate;
}
