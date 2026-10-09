import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from './authMiddleware';

// ─── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock('../config/auth', () => ({
  JWT_SECRET: 'chave_secreta_teste',
}));

import jwt from 'jsonwebtoken';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRes(): any {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeReq(headers: Record<string, string> = {}): any {
  return { headers };
}

// ─── Testes ────────────────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 401 quando o header Authorization estiver ausente', () => {
    const req = makeReq({});
    const res = makeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o header não começar com "Bearer "', () => {
    const req = makeReq({ authorization: 'Basic algum-token' });
    const res = makeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token JWT for inválido ou expirado', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req = makeReq({ authorization: 'Bearer token.invalido.aqui' });
    const res = makeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token invalido ou expirado.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e anexar o usuário à request quando o token for válido', () => {
    const decodedUser = { id: 1, email: 'user@test.com', nome: 'Alice' };
    vi.mocked(jwt.verify).mockReturnValue(decodedUser as never);

    const req = makeReq({ authorization: 'Bearer token.valido.aqui' });
    const res = makeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual(decodedUser);
    expect(res.status).not.toHaveBeenCalled();
  });
});
