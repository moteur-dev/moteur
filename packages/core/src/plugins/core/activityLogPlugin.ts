import { onEvent } from '../../utils/eventBus.js';
import {
    log,
    logGlobal,
    toActivityEvent,
    GLOBAL_PROJECT_ID,
    systemUser
} from '../../activityLogger.js';

function registerActivityListeners() {
    const created = 'created' as const;
    const updated = 'updated' as const;
    const deleted = 'deleted' as const;

    onEvent('project.afterCreate', async ({ project, user }) => {
        log(toActivityEvent(project.id, 'project', project.id, created, user));
    });
    onEvent('project.afterUpdate', async ({ project, user }) => {
        log(toActivityEvent(project.id, 'project', project.id, updated, user));
    });
    onEvent('project.afterDelete', async ({ project, user }) => {
        log(toActivityEvent(project.id, 'project', project.id, deleted, user));
    });

    onEvent('model.afterCreate', async ({ model, user, projectId }) => {
        log(toActivityEvent(projectId, 'model', model.id, created, user));
    });
    onEvent('model.afterUpdate', async ({ model, user, projectId }) => {
        log(toActivityEvent(projectId, 'model', model.id, updated, user));
    });
    onEvent('model.afterDelete', async ({ model, user, projectId }) => {
        log(toActivityEvent(projectId, 'model', model.id, deleted, user));
    });

    onEvent('entry.afterCreate', async ({ entry, user, modelId, projectId }) => {
        log(toActivityEvent(projectId, 'entry', `${modelId}__${entry.id}`, created, user));
    });
    onEvent('entry.afterUpdate', async ({ entry, user, modelId, projectId }) => {
        log(toActivityEvent(projectId, 'entry', `${modelId}__${entry.id}`, updated, user));
    });
    onEvent('entry.afterDelete', async ({ entry, user, modelId, projectId }) => {
        log(toActivityEvent(projectId, 'entry', `${modelId}__${entry.id}`, deleted, user));
    });

    onEvent('layout.afterCreate', async ({ layout, user, projectId }) => {
        log(toActivityEvent(projectId, 'layout', layout.id, created, user));
    });
    onEvent('layout.afterUpdate', async ({ layout, user, projectId }) => {
        log(toActivityEvent(projectId, 'layout', layout.id, updated, user));
    });
    onEvent('layout.afterDelete', async ({ layout, user, projectId }) => {
        log(toActivityEvent(projectId, 'layout', layout.id, deleted, user));
    });

    onEvent('structure.afterCreate', async ({ structure, user, projectId }) => {
        log(toActivityEvent(projectId, 'structure', structure.type, created, user));
    });
    onEvent('structure.afterUpdate', async ({ structure, user, projectId }) => {
        log(toActivityEvent(projectId, 'structure', structure.type, updated, user));
    });
    onEvent('structure.afterDelete', async ({ structure, user, projectId }) => {
        log(toActivityEvent(projectId, 'structure', structure.type, deleted, user));
    });

    onEvent('user.afterCreate', async ({ user, performedBy }) => {
        const actor = performedBy ?? systemUser();
        logGlobal(toActivityEvent(GLOBAL_PROJECT_ID, 'user', user.id, created, actor));
    });

    onEvent('blueprint.afterCreate', async ({ blueprint, user }) => {
        logGlobal(toActivityEvent(GLOBAL_PROJECT_ID, 'blueprint', blueprint.id, created, user));
    });
    onEvent('blueprint.afterUpdate', async ({ blueprint, user }) => {
        logGlobal(toActivityEvent(GLOBAL_PROJECT_ID, 'blueprint', blueprint.id, updated, user));
    });
    onEvent('blueprint.afterDelete', async ({ blueprint, user }) => {
        logGlobal(toActivityEvent(GLOBAL_PROJECT_ID, 'blueprint', blueprint.id, deleted, user));
    });
}

registerActivityListeners();
