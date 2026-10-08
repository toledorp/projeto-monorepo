import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage:{
      //Define o provedor nativo V8
      provider: 'v8',

      //Diretorios onde os relatoris de cobertura serão gerados
      reportsDirectory: './coverage',

      //Padrões de arquivos incluidos na analise de cobertura
      include: ['src/**/*.ts'],

      //Excluir arquivos e pastas que devem seer desconsiderados na analise de cobertura
      exclude: [
        'src/**/*.test.ts', 
        'src/**/*.spec.ts',
        'src/types/**',
        'src/server.ts',
        'srs/migrations/**',
      ],

      //Definição de limites mínimos obrigatórios (Quality Gate local)
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      }


    }
  },
});
