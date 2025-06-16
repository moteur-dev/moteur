import { User } from '../types/User';
import { ProjectSchema } from '../types/Project';
import { ModelSchema } from '../types/Model';
import { ProjectBlueprintRegistry } from '../registry/ProjectBlueprintRegistry';
import { ModelBlueprintRegistry } from '../registry/ModelBlueprintRegistry';
import { ProjectBlueprint, ModelBlueprint } from '../types/Blueprint';
import { generateProjectBlueprint } from '../utils/generateBlueprint';
import { generateModelBlueprint } from '../utils/generateBlueprint';

export function listProjectBlueprints(): string[] {
    const registry = new ProjectBlueprintRegistry();
    return Object.keys(registry.list());
}

export function getProjectBlueprint(id: string): ProjectBlueprint {
    const registry = new ProjectBlueprintRegistry();
    return registry.get(id);
}

export async function generateProjectFromBlueprint(
    user: User,
    blueprintId: string,
    projectId: string
): Promise<ProjectSchema> {
    const registry = new ProjectBlueprintRegistry();
    const blueprint = registry.get(blueprintId);
    return await generateProjectBlueprint(user, blueprint, projectId);
}

export function listModelBlueprints(): string[] {
    const registry = new ModelBlueprintRegistry();
    return Object.keys(registry.list());
}

export function getModelBlueprint(id: string): ModelBlueprint {
    const registry = new ModelBlueprintRegistry();
    return registry.get(id);
}

export async function generateModelFromBlueprint(
    user: User,
    blueprintId: string,
    projectId: string,
    targetModelId?: string
): Promise<ModelSchema> {
    const registry = new ModelBlueprintRegistry();
    const blueprint = registry.get(blueprintId);
    const model = await generateModelBlueprint({
        user: user,
        blueprintId: blueprint.id,
        projectId: projectId,
        targetModelId: targetModelId
    });
    if (!model) {
        throw new Error(`Failed to generate model from blueprint ${blueprintId}`);
    }
    return model;
}
