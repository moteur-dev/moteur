import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listModelSchemasCommand,
  getModelSchemaCommand,
  createModelSchemaCommand,
  patchModelSchemaCommand,
  deleteModelSchemaCommand
} from '../../../cli/commands/models.js';

import {
  listModelSchemas,
  getModelSchema,
  createModelSchema,
  updateModelSchema,
  deleteModelSchema
} from '../../../api/models.js';

vi.mock('../../../api/models.js', () => ({
  listModelSchemas: vi.fn(),
  getModelSchema: vi.fn(),
  createModelSchema: vi.fn(),
  updateModelSchema: vi.fn(),
  deleteModelSchema: vi.fn()
}));

vi.mock('../utils/projectSelectPrompt.js', () => ({
  projectSelectPrompt: vi.fn(() => 'testProject')
}));

vi.mock('../utils/resolveInputData.js', () => ({
  resolveInputData: vi.fn(() => ({ label: 'Patched' }))
}));

vi.mock('../utils/editModelSchemaFields.js', () => ({
  editModelSchemaFields: vi.fn()
}));

vi.mock('../../../cli/utils/auth.js', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('../../../cli/utils/auth.js');
  const mockUser = {
    id: 'user1',
    email: 'moteur@example.com',
    password: 'password'
  };
  return {
    ...actual,
    cliLoadAuthToken: vi.fn(() => 'mocked-auth-token'),
    cliLoadUser: vi.fn(() => mockUser),
    cliRequireRole: vi.fn(() => mockUser),
    verifyJWT: vi.fn(() => ({}))
  };
});


describe('modelsMenu commands', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('listModelSchemasCommand outputs JSON when --json is set', async () => {
    (listModelSchemas as vi.Mock).mockReturnValue([{ id: 'm1', label: 'Model 1' }]);

    await listModelSchemasCommand({ projectId: 'testProject', json: true });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0][0];
    expect(JSON.parse(output)).toEqual([{ id: 'm1', label: 'Model 1' }]);
  });

  it('listModelSchemasCommand outputs text when no --json or --quiet', async () => {
    (listModelSchemas as vi.Mock).mockReturnValue([{ id: 'm1', label: 'Model 1' }]);

    await listModelSchemasCommand({ projectId: 'testProject' });

    expect(logSpy).toHaveBeenCalledWith('📁 Model Schemas in project "testProject":');
  });

  it('listModelSchemasCommand outputs nothing with --quiet and no models', async () => {
    (listModelSchemas as vi.Mock).mockReturnValue([]);

    await listModelSchemasCommand({ projectId: 'testProject', quiet: true });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('getModelSchemaCommand outputs JSON when --json is set', async () => {
    (getModelSchema as vi.Mock).mockReturnValue({ id: 'm1', label: 'Model 1' });

    await getModelSchemaCommand({ projectId: 'testProject', id: 'm1', json: true });

    const output = logSpy.mock.calls[0][0];
    expect(JSON.parse(output)).toEqual({ id: 'm1', label: 'Model 1' });
  });

  it('getModelSchemaCommand outputs text when no --json or --quiet', async () => {
    (getModelSchema as vi.Mock).mockReturnValue({ id: 'm1', label: 'Model 1' });

    await getModelSchemaCommand({ projectId: 'testProject', id: 'm1' });

    expect(logSpy).toHaveBeenCalledWith('📁 Model Schema "m1":');
  });

  it('createModelSchemaCommand logs creation message', async () => {
    (createModelSchema as vi.Mock).mockReturnValue({ id: 'm1', label: 'New Model' });

    await createModelSchemaCommand({
      projectId: 'testProject',
      data: JSON.stringify({ label: 'New Model' }),
      quiet: false
    });

    expect(logSpy).toHaveBeenCalledWith('✅ Created model schema "m1" in project "testProject".');
  });

  it('patchModelSchemaCommand logs patch message', async () => {
    (updateModelSchema as vi.Mock).mockReturnValue({ id: 'm1', label: 'Patched' });

    await patchModelSchemaCommand({
      projectId: 'testProject',
      id: 'm1',
      data: JSON.stringify({ label: 'Patched' })
    });

    expect(logSpy).toHaveBeenCalledWith('🔧 Patched model schema "m1" in project "testProject".');
  });

  it('deleteModelSchemaCommand logs deletion message', async () => {
    await deleteModelSchemaCommand({ projectId: 'testProject', id: 'm1' });

    expect(logSpy).toHaveBeenCalledWith(
      '🗑️ Moved model schema "m1" to trash in project "testProject".'
    );
  });
});
