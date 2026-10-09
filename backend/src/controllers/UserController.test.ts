import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserController } from './UserController';

// ─── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../models/User', () => ({
  User: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeRes(): any {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides: { body?: any; params?: any } = {}): any {
  return {
    body: overrides.body ?? {},
    params: overrides.params ?? {},
  };
}

// ─── index ─────────────────────────────────────────────────────────────────────

describe('UserController.index', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 200 com lista de usuários', async () => {
    const fakeUsers = [{ id: 1, nome: 'Alice', email: 'alice@test.com' }];
    vi.mocked(User.findAll).mockResolvedValue(fakeUsers as any);

    const req = makeReq();
    const res = makeRes();

    await UserController.index(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it('deve retornar 500 em caso de erro', async () => {
    vi.mocked(User.findAll).mockRejectedValue(new Error('DB offline'));

    const req = makeReq();
    const res = makeRes();

    await UserController.index(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── show ──────────────────────────────────────────────────────────────────────

describe('UserController.show', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para ID não numérico', async () => {
    const req = makeReq({ params: { id: 'abc' } });
    const res = makeRes();

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'O ID informado deve ser um numero valido.',
    });
  });

  it('deve retornar 400 para ID <= 0', async () => {
    const req = makeReq({ params: { id: '0' } });
    const res = makeRes();

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 404 quando usuário não for encontrado', async () => {
    vi.mocked(User.findByPk).mockResolvedValue(null);

    const req = makeReq({ params: { id: '999' } });
    const res = makeRes();

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
  });

  it('deve retornar 200 com dados do usuário', async () => {
    const fakeUser = { id: 1, nome: 'Alice', email: 'alice@test.com', createdAt: new Date() };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it('deve retornar 500 em caso de erro', async () => {
    vi.mocked(User.findByPk).mockRejectedValue(new Error('Erro de conexão'));

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();

    await UserController.show(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── create ────────────────────────────────────────────────────────────────────

describe('UserController.create', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 quando nome estiver ausente', async () => {
    const req = makeReq({ body: { email: 'a@test.com', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'O campo nome é obrigatório.' });
  });

  it('deve retornar 400 quando nome for string vazia', async () => {
    const req = makeReq({ body: { nome: '   ', email: 'a@test.com', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'O campo nome é obrigatório.' });
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const req = makeReq({ body: { nome: 'Alice', email: 'invalido', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Informe um e-mail valido.' });
  });

  it('deve retornar 400 para e-mail ausente', async () => {
    const req = makeReq({ body: { nome: 'Alice', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 400 para senha com menos de 6 caracteres', async () => {
    const req = makeReq({ body: { nome: 'Alice', email: 'alice@test.com', password: '123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'A senha deve conter no minimo 6 caracteres.',
    });
  });

  it('deve retornar 400 quando e-mail já estiver cadastrado', async () => {
    vi.mocked(User.findOne).mockResolvedValue({ id: 1 } as any);

    const req = makeReq({ body: { nome: 'Alice', email: 'alice@test.com', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Já existe um usuário cadastrado com este e-mail.',
    });
  });

  it('deve retornar 201 com dados do usuário criado', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('$2a$10$hashgerado' as never);
    const fakeCreated = {
      id: 10,
      nome: 'Alice',
      email: 'alice@test.com',
      createdAt: new Date(),
    };
    vi.mocked(User.create).mockResolvedValue(fakeCreated as any);

    const req = makeReq({ body: { nome: 'Alice', email: 'alice@test.com', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: fakeCreated.id,
      nome: fakeCreated.nome,
      email: fakeCreated.email,
      createdAt: fakeCreated.createdAt,
    });
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    vi.mocked(User.findOne).mockRejectedValue(new Error('Falha'));

    const req = makeReq({ body: { nome: 'Alice', email: 'alice@test.com', password: 'senha123' } });
    const res = makeRes();

    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── update ────────────────────────────────────────────────────────────────────

describe('UserController.update', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para ID inválido', async () => {
    const req = makeReq({ params: { id: 'xyz' }, body: { nome: 'Novo' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 404 quando usuário não for encontrado', async () => {
    vi.mocked(User.findByPk).mockResolvedValue(null);

    const req = makeReq({ params: { id: '99' }, body: { nome: 'Novo' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
  });

  it('deve retornar 404 quando nome for string inválida', async () => {
    const fakeUser = { id: 1, nome: 'Alice', email: 'alice@test.com', save: vi.fn() };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);

    const req = makeReq({ params: { id: '1' }, body: { nome: '   ' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'O campo nome deve ser um texto valido.',
    });
  });

  it('deve retornar 400 quando e-mail for inválido', async () => {
    const fakeUser = { id: 1, nome: 'Alice', email: 'alice@test.com', save: vi.fn() };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);

    const req = makeReq({ params: { id: '1' }, body: { email: 'invalido' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Informe um e-mail valido.' });
  });

  it('deve retornar 400 quando e-mail já estiver em uso por outro usuário', async () => {
    const fakeUser = { id: 1, nome: 'Alice', email: 'alice@test.com', save: vi.fn() };
    const outroUser = { id: 2, nome: 'Bob', email: 'bob@test.com' };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);
    vi.mocked(User.findOne).mockResolvedValue(outroUser as any);

    const req = makeReq({ params: { id: '1' }, body: { email: 'bob@test.com' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Este e-mail já está em uso.' });
  });

  it('deve retornar 200 ao atualizar nome com sucesso', async () => {
    const fakeUser = {
      id: 1,
      nome: 'Alice',
      email: 'alice@test.com',
      createdAt: new Date(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);

    const req = makeReq({ params: { id: '1' }, body: { nome: 'Alice Atualizada' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(fakeUser.save).toHaveBeenCalled();
  });

  it('deve retornar 200 ao atualizar e-mail para um que pertence ao mesmo usuário', async () => {
    const fakeUser = {
      id: 1,
      nome: 'Alice',
      email: 'alice@test.com',
      createdAt: new Date(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    // findOne retorna o próprio usuário (mesmo id) — e-mail pertence ao mesmo
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);
    vi.mocked(User.findOne).mockResolvedValue({ ...fakeUser, id: 1 } as any);

    const req = makeReq({ params: { id: '1' }, body: { email: 'alice@test.com' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    vi.mocked(User.findByPk).mockRejectedValue(new Error('DB error'));

    const req = makeReq({ params: { id: '1' }, body: { nome: 'Alice' } });
    const res = makeRes();

    await UserController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── delete ────────────────────────────────────────────────────────────────────

describe('UserController.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para ID inválido', async () => {
    const req = makeReq({ params: { id: 'nao-numero' } });
    const res = makeRes();

    await UserController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deve retornar 404 quando usuário não for encontrado', async () => {
    vi.mocked(User.findByPk).mockResolvedValue(null);

    const req = makeReq({ params: { id: '999' } });
    const res = makeRes();

    await UserController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
  });

  it('deve retornar 204 ao remover o usuário com sucesso', async () => {
    const fakeUser = {
      id: 1,
      nome: 'Alice',
      destroy: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(User.findByPk).mockResolvedValue(fakeUser as any);

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();

    await UserController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(fakeUser.destroy).toHaveBeenCalled();
  });

  it('deve retornar 500 em caso de erro inesperado', async () => {
    vi.mocked(User.findByPk).mockRejectedValue(new Error('DB error'));

    const req = makeReq({ params: { id: '1' } });
    const res = makeRes();

    await UserController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
