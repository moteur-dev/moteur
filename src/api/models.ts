import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config.js';
import { ModelSchema } from '../types/Model.js';
import { readJson, writeJson } from '../utils/fileUtils.js';
import { isValidId } from 'utils/idUtils.js';
import { isExistingModelSchema } from '../utils/fileUtils.js';
import { modelDir, modelFilePath } from 'utils/pathUtils.js';
import { User } from '../types/User.js';
import { assertUserCanAccessProject } from '../utils/access.js';
import { get } from 'http';
import { getProject } from './projects.js';
import { validateModel } from 'validators/validateModel.js';
import { triggerEvent } from '../utils/eventBus';

export function listModelSchemas(user: User, projectId: string): ModelSchema[] {
    if (!isValidId(projectId)) {
        throw new Error(`Invalid projectId: "${projectId}"`);
    }

    const project = getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    const base = path.join(moteurConfig.projectRoot, projectId, 'models');
    if (!fs.existsSync(base)) return [];

    return fs
        .readdirSync(base)
        .filter(file => file.endsWith('.json'))
        .map(file => readJson(path.join(base, file)) as ModelSchema);
}

export function getModelSchema(user: User, projectId: string, schemaId: string): ModelSchema {
    if (!isValidId(schemaId)) {
        throw new Error(`Invalid model schemaId: "${schemaId}"`);
    }
    if (!isExistingModelSchema(projectId, schemaId)) {
        throw new Error(`Model schema "${schemaId}" not found in project "${projectId}".`);
    }

    const project = getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    const file = modelFilePath(projectId, schemaId);
    return readJson(file) as ModelSchema;
}

export function createModelSchema(user: User, projectId: string, schema: ModelSchema): ModelSchema {
    if (isExistingModelSchema(projectId, schema.id)) {
        throw new Error(`Model schema "${schema.id}" already exists in project "${projectId}".`);
    }

    const project = getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    const base = path.join(moteurConfig.projectRoot, projectId, 'models');
    const file = path.join(base, `${schema.id}.json`);

    triggerEvent('model.beforeCreate', { model: schema, user });

    schema.fields = schema.fields || {};

    fs.mkdirSync(base, { recursive: true });
    writeJson(file, schema);

    triggerEvent('model.afterCreate', { model: schema, user });

    return schema;
}

export function updateModelSchema(
    user: User,
    projectId: string,
    schemaId: string,
    patch: Partial<ModelSchema>
): ModelSchema {
    if (!isExistingModelSchema(projectId, schemaId)) {
        throw new Error(`Model schema "${schemaId}" not found in project "${projectId}".`);
    }

    const current = getModelSchema(user, projectId, schemaId);
    const updated = { ...current, ...patch };

    triggerEvent('model.beforeUpdate', { model: updated, user });
    writeJson(modelFilePath(projectId, schemaId), updated);
    triggerEvent('model.afterUpdate', { model: updated, user });
    return updated;
}

export function deleteModelSchema(user: User, projectId: string, schemaId: string): void {
    // This ensure current model schema exists and can be accessed by the user
    const current = getModelSchema(user, projectId, schemaId);

    triggerEvent('model.beforeDelete', { model: current, user });

    const base = path.join(moteurConfig.projectRoot, projectId, 'models');
    const source = path.join(base, schemaId);
    const destDir = path.join(base, '.trash', 'schemas');
    const dest = path.join(destDir, schemaId);

    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(source, dest);

    triggerEvent('model.afterDelete', { model: current, user });
}
