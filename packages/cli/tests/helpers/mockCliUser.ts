import { vi } from 'vitest';

vi.mock('@moteur/core/auth.js', async () => {
  const actual = await import('@moteur/core/auth.js');
  return {
    ...actual,
    verifyJWT: vi.fn(() => ({
      id: 'user1',
      email: 'moteur@example.com',
      isActive: true,
      roles: ['admin'],
    })),
  };
});

vi.mock('../../src/utils/auth.js', async () => {
  const actual = await import('../../src/utils/auth.js');
  const mockUser = {
    id: 'user1',
    email: 'moteur@example.com',
    isActive: true,
    roles: ['admin'],
  };
  return {
    ...actual,
    cliLoadAuthToken: vi.fn(() => 'mocked-token'),
    cliLoadUser: vi.fn(() => mockUser),
    cliRequireRole: vi.fn(() => mockUser),
  };
});
