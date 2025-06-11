import { onEvent } from '../../utils/eventBus';
import { Audit } from '../../types/Audit';
import { User } from '../../types/User';

onEvent('project.beforeCreate', async ({ project, user }) => {
    project.meta = project.meta || {};
    project.meta.audit = updateAudit(user, project.meta.audit);
});

onEvent('project.beforeUpdate', async ({ project, user }) => {
    project.meta = project.meta || {};
    project.meta.audit = updateAudit(user, project.meta.audit);
});

onEvent('model.beforeCreate', async ({ model, user }) => {
    model.meta = model.meta || {};
    model.meta.audit = updateAudit(user, model.meta.audit);
});

onEvent('model.beforeUpdate', async ({ model, user }) => {
    model.meta = model.meta || {};
    model.meta.audit = updateAudit(user, model.meta.audit);
});

function updateAudit(user: User, existingAudit: Audit = {}): Audit {
    const now = new Date().toISOString();
    const isNew = !existingAudit.revision || existingAudit.revision === 0;

    return {
        createdAt: isNew ? now : existingAudit.createdAt,
        createdBy: isNew ? user.id : existingAudit.createdBy,
        updatedAt: now,
        updatedBy: user.id,
        revision: (existingAudit.revision || 0) + 1
    };
}
