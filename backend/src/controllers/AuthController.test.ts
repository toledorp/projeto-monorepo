import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './AuthController';

// ─── Mocks dos módulos externos ────────────────────────────────────────────────

vi.mock('../models/User', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock('../config/auth', () => ({
  JWT_SECRET: 'chave_secreta_teste',
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function makeMockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeMockRequest(body: Record<string, unknown> = {}): any {
  return { body };
}

// ─── Testes ────────────────────────────────────────────────────────────────────

describe('AuthController.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 400 quando email não for informado', async () => {
    const req = makeMockRequest({ password: 'Senha123' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Email e senha são obrigatórios',
    });
  });

  it('deve retornar 400 quando password não for informado', async () => {
    const req = makeMockRequest({ email: 'user@test.com' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Email e senha são obrigatórios',
    });
  });

  it('deve retornar 400 quando email e password não forem informados', async () => {
    const req = makeMockRequest({});
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 401 quando usuário não for encontrado no banco', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);

    const req = makeMockRequest({ email: 'inexistente@test.com', password: 'Senha123' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Credenciais invalidas.' });
  });

  it('deve retornar 401 quando usuário não possuir senha_hash', async () => {
    vi.mocked(User.findOne).mockResolvedValue({ id: 1, email: 'user@test.com', senha_hash: null } as any);

    const req = makeMockRequest({ email: 'user@test.com', password: 'Senha123' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Credenciais invalidas.' });
  });

  it('deve retornar 401 quando a senha estiver incorreta', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      senha_hash: '$2a$10$hashhash',
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const req = makeMockRequest({ email: 'user@test.com', password: 'SenhaErrada' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Credenciais invalidas.' });
  });

  it('deve retornar 200 com token JWT quando as credenciais forem válidas', async () => {
    const fakeUser = {
      id: 42,
      email: 'user@test.com',
      nome: 'Usuário Teste',
      senha_hash: '$2a$10$hashhash',
    };
    vi.mocked(User.findOne).mockResolvedValue(fakeUser as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('fake.jwt.token' as never);

    const req = makeMockRequest({ email: 'user@test.com', password: 'SenhaCorreta' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Login realizado com sucesso!',
      token: 'fake.jwt.token',
    });
  });

  it('deve retornar 500 quando ocorrer um erro inesperado', async () => {
    vi.mocked(User.findOne).mockRejectedValue(new Error('Falha de conexão com o banco'));

    const req = makeMockRequest({ email: 'user@test.com', password: 'Senha123' });
    const res = makeMockResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Falha de conexão com o banco' });
  });
});
