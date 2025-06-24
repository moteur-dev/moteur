// Mocks
vi.mock('../../src/middlewares/auth', () => ({
  requireAdmin: (req: any, _res: any, next: any) => {
    req.user = { id: 'admin1', role: 'admin' }
    next()
  },
  requireProjectAccess: (req: any, _res: any, next: any) => {
    req.user = { id: 'editor1', role: 'admin' }
    next()
  }
}))

import request from 'supertest';
import express from 'express';
import updateRoute from '../../src/entries/update';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { getModelSchema } from '@moteur/core/models';
import { updateEntry } from '@moteur/core/entries';
import { validateEntry } from '@moteur/core/validators/validateEntry';

vi.mock('@moteur/core/models', () => ({
  getModelSchema: vi.fn()
}));
vi.mock('@moteur/core/entries', () => ({
  updateEntry: vi.fn()
}));
vi.mock('@moteur/core/validators/validateEntry', () => ({
  validateEntry: vi.fn()
}));

const mockUser = { id: 'user-123', roles: ['admin'] };
const mockSchema = {
  id: 'article',
  label: 'Article',
  fields: { title: { type: 'core/text' } }
};

const app = express();
app.use(express.json());
app.use((req:any, _res, next) => {
  req.user = mockUser;
  next();
});
app.use('/projects/:projectId/models/:modelId/entries', updateRoute);

describe('PATCH /projects/:projectId/models/:modelId/entries/:entryId', () => {
  const basePath = '/projects/test-project/models/article/entries/entry-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update an entry and return 200', async () => {
    (getModelSchema as any).mockReturnValue(mockSchema);
    (validateEntry as any).mockReturnValue({ valid: true });
    (updateEntry as any).mockResolvedValue({ id: 'entry-1', title: 'Updated Title' });

    const res = await request(app).patch(basePath).send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'entry-1', title: 'Updated Title' });
  });

  it('should return 400 if path params are missing', async () => {
    const res = await request(app).patch('/projects///entries/').send({});
    expect([400, 404]).toContain(res.status); // Allow both if route not matched
  });

  it('should return 404 if model schema is not found', async () => {
    (getModelSchema as any).mockReturnValue(null);
    const res = await request(app).patch(basePath).send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Model not found');
  });

  it('should return 400 if entry validation fails', async () => {
    (getModelSchema as any).mockReturnValue(mockSchema);
    (validateEntry as any).mockReturnValue({
      valid: false,
      issues: [{ path: 'title', message: 'Required' }]
    });

    const res = await request(app).patch(basePath).send({});

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.errors[0].field).toBe('title');
  });

  it('should return 400 on update error', async () => {
    (getModelSchema as any).mockReturnValue(mockSchema);
    (validateEntry as any).mockReturnValue({ valid: true });
    (updateEntry as any).mockRejectedValue(new Error('fail'));

    const res = await request(app).patch(basePath).send({ title: 'Fail' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('fail');
  });
});
