#Estagio 1: Build da aplicação

# 1. Define a imagem de origem base 
FROM node:24-alpine AS builder

#Instalação do pnpm global localmente
RUN corepack enable && corepack prepara pnpm@latest --activate

# 2. Define diretório de trabalho interno do container
WORKDIR /app

#Copia dos manufestos de dependencias do backend
COPY package.json pnpm.lock.yaml* ./

# Instalação de todas as dependências (incluido devDependencies para o build)
RUN npm install --frozen-lockfile

# Desativa a restrição do pnpm 11
RUN pnpm config set strict-dep-builds false

# 4. Copia do codigo fonte e da configuração do TypeScript
COPY tsconfig.json ./
COPY src ./src

#compilação do TypeScript para o JavaScript(gera a pasta dist/)
RUN pnpm run build

#remoção das dependências de desenvolvimento para diminuir o tamanho final
RUN pnpm prune --prod


# Estágio 2 : Imagem Final de Exevução (Produção)
FROM node:24-alpine AS runner

WORKDIR /app

# Definição do ambiente como produção
ENV NODE_ENV=production
ENV PORT=3000

