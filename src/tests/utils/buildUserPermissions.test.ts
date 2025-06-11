
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Permission } from '../../types/Permission.js';
import { parsePermission, Action, ResourceType } from '../../types/Permission.js';
import { buildUserPermissions } from '../../utils/buildUserPermissions.js';
import type { User } from '../../types/User.js';


vi.mock('../../utils/projectPolicy.js', () => ({
  loadProjectPolicy: () => ({
    roles: {
      admin: [
        { action: Action.Edit,    resource: ResourceType.Field, scope: ['proj1', '*', '*'] }
      ],
      reviewer: [
        { action: Action.View,    resource: ResourceType.Field, scope: ['proj1', '*', '*'] }
      ]
    },
    roleHierarchy: {
      admin: ['reviewer']
    }
  })
}));

describe('buildUserPermissions', () => {
  const rawUser: User = {
    id: 'u1',
    email: 'user1@example.com',
    roles: ['admin'],
    extraPermissions: ['edit:field:proj1:model1:custom'],
    projects: ['proj1'],
    //defaultProjectId: 'proj1',
    passwordHash: '',
    isActive: true,
  };

  it('should resolve roles and include inherited permissions', () => {
    const result = buildUserPermissions('proj1', rawUser);

    expect(result.permissions).toEqual(expect.arrayContaining([
      { action: Action.Edit,    resource: ResourceType.Field, scope: ['proj1','*','*'] },
      { action: Action.View,    resource: ResourceType.Field, scope: ['proj1','*','*'] }
    ]));
  });

  it('should append extraPermissions overrides', () => {
    const result = buildUserPermissions('proj1', rawUser);
    const extra = parsePermission('edit:field:proj1:model1:custom');
    expect(result.permissions).toEqual(expect.arrayContaining([ extra ]));
  });

});
