import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isStrongPassword,
  UserInput,
  validateUserInput,
  //validateUserInput,
  //UserInput,
} from './validators';

describe('Módulo de Validação: validators.ts', () => {
  describe('Função isValidEmail', () => {
    it('Deve retornar true para um endereço de e-mail válido AAA( Arrange, Act, Assert)', () => {
      // 1. Arrange (Preparar)
      const validEmail = 'aluno.fatec@so.gov.br';

      // 2. Act (Agir)
      const result = isValidEmail(validEmail);

      // 3. Assert (Afirmar)
      expect(result).toBe(true);
    });

    it('deve retornar false para e-mails com formato inválido', () => {
      // Arrange & Act
      expect(isValidEmail('usuario_sem_arroba.com')).toBe(false);
      expect(isValidEmail('usuario@dominio')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Função isStrongPassword', () => {
    it('Deve aceitar uma senha com 8 caracteres, maiúscula e número', () => {
      // Arrange
      const strongPassword = 'Password123';

      // Act
      const result = isStrongPassword(strongPassword);

      // Assert
      expect(result).toBe(true);
    });

    it('Deve rejeitar senhas com menos de 8 caracteres', () => {
      const shortPassword = 'Pass1';

      const result = isStrongPassword(shortPassword);

      expect(result).toBe(false);
    });

    it('Deve rejeitar senhas sem letras maiúsculas', () => {
      const noUpperPassword = 'password123';

      const result = isStrongPassword(noUpperPassword);

      expect(result).toBe(false);
    });

    it('Deve rejeitar senhas sem números', () => {
      const noNumberPassword = 'PassowrdSemNumero';

      const result = isStrongPassword(noNumberPassword);

      expect(result).toBe(false);
    });
  });

  describe('Função validateUserInput', () => {
    it('deve validar com sucesso um usuário com todos os campos corretos', () => {
      // Arrange
      const input: UserInput = {
        name: 'Carlos Silva',
        email: 'carlos.silva@fatec.sp.gov.br',
        password: 'Password123',
        role: 'aluno',
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('deve retornar erro quando o nome tiver menos de 3 caracteres', () => {
      // Arrange
      const input: Partial<UserInput> = {
        name: 'AB',
        email: 'aluno@fatec.sp.gov.br',
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'O nome deve conter no mínimo 3 caracteres.',
      );
    });

    it('deve retornar erro para perfil de acesso inválido', () => {
      // Arrange
      const input = {
        name: 'Carlos Silva',
        email: 'carlos.silva@fatec.sp.gov.br',
        role: 'visitante' as any,
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'O Perfil de acesso informado é inválido.',
      );
    });

    it('deve retornar erro de e-mail quando o e-mail estiver ausente', () => {
      // Arrange — cobre o branch onde input.email é undefined
      const input: Partial<UserInput> = {
        name: 'Carlos Silva',
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('O e-mail informado é inválido.');
    });

    it('deve retornar erro de senha quando password for informado mas não atender os critérios', () => {
      // Arrange — cobre o branch onde password !== undefined mas isStrongPassword retorna false
      const input: Partial<UserInput> = {
        name: 'Carlos Silva',
        email: 'carlos.silva@fatec.sp.gov.br',
        password: 'fraca',
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'A senha deve ter no mínimo 8 caracteres, incluindo 1 letra maiúscula e 1 número.',
      );
    });

    it('não deve adicionar erro de senha quando password não for informado', () => {
      // Arrange — cobre o branch onde password === undefined (campo opcional)
      const input: Partial<UserInput> = {
        name: 'Carlos Silva',
        email: 'carlos.silva@fatec.sp.gov.br',
      };

      // Act
      const validation = validateUserInput(input);

      // Assert
      expect(validation.isValid).toBe(true);
      expect(validation.errors).not.toContain(
        'A senha deve ter no mínimo 8 caracteres, incluindo 1 letra maiúscula e 1 número.',
      );
    });
  });
});
