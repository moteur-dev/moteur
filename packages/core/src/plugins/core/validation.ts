import { onEvent } from '../../utils/eventBus.js';
import { validateProject } from '../../validators/validateProject.js';
import { validateModel } from '../../validators/validateModel.js';

onEvent('project.beforeCreate', async ({ project }) => {
    const result = validateProject(project);
    if (result.issues.length > 0) {
        const errors = result.issues.map(issue => `${issue.path}: ${issue.message}`).join(', ');
        throw new Error(`Project validation failed: ${errors}`);
    }
});

onEvent('project.beforeUpdate', async ({ project }) => {
    const result = validateProject(project);
    if (result.issues.length > 0) {
        const errors = result.issues.map(issue => `${issue.path}: ${issue.message}`).join(', ');
        throw new Error(`Project validation failed: ${errors}`);
    }
});

onEvent('model.beforeCreate', async ({ model }) => {
    const result = validateModel(model);
    if (result.issues.length > 0) {
        const errors = result.issues.map(issue => `${issue.path}: ${issue.message}`).join(', ');
        throw new Error(`Model validation failed: ${errors}`);
    }
});

onEvent('model.beforeUpdate', async ({ model }) => {
    const result = validateModel(model);
    if (result.issues.length > 0) {
        const errors = result.issues.map(issue => `${issue.path}: ${issue.message}`).join(', ');
        throw new Error(`Model validation failed: ${errors}`);
    }
});
