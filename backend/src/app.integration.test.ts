import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('Teste de integração: Endpoint base da Aplicação', () => {
  describe('GET /api/health', () => {
    it('deve responder com status 200 e payload de status operation', async () => {
      // Act: Dispara a requisição HTTP para rota de healt check
      const response = await request(app)
        .get('/api/health')
        .set('Accept', 'aplication/json');

      // Assert: Valida status, cabecalho e corpo retornado
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty(
        'mensagem',
        'Servidor Backend rodando com sucesso.',
      );
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Tratamento de Rotas Inexistentes', () => {
    it('deve retornar status 404 ao requisitar uma rota nao mapeada', async () => {
      const response = await request(app).get('/api/rota-que-nao-existe');

      expect(response.status).toBe(404);
    });
  });
});
