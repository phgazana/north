# NORTH

Aplicativo para organizar atividades e acompanhar seus impactos financeiros nas metas mensais. Este repositório reúne o aplicativo mobile, a API, a configuração do PostgreSQL e os documentos de produto e análise.

## Estrutura

- `frontend/` — aplicativo React Native com Expo, TypeScript e Expo Router, integrado à API.
- `backend/` — API REST em Java 21, Spring Boot, Spring Security, JPA e Flyway.
- `banco-de-dados/` — migração SQL de referência; a migração executada pelo Flyway fica em `backend/src/main/resources/db/migration/`.
- `compose.yaml` — PostgreSQL para desenvolvimento local.
- `docs/` — contrato da API, decisões de domínio, roteiro de execução e integração frontend.
- `documentacao/` — PRD, requisitos, diagramas, blueprint de UX, wireframes, design system e protótipos legados ainda úteis como referência.
- `apresentacao/`, `prototipos/` e `testes/` — materiais acadêmicos e de apoio existentes.

## Requisitos

- Java 21 e Maven
- Node.js e npm
- Docker Compose (ou PostgreSQL instalado localmente)

## Configuração local

Crie `.env` a partir do exemplo e substitua os valores de configuração:

```bash
cp .env.example .env
```

Defina `POSTGRES_PASSWORD`, `DB_PASSWORD` e `JWT_SECRET`. O segredo JWT deve ser Base64 de pelo menos 32 bytes aleatórios. Gere um com `openssl rand -base64 32`. Não versione `.env`.

Inicie o banco:

```bash
docker compose up -d postgres
```

Inicie a API:

```bash
cd backend
set -a
source ../.env
set +a
mvn spring-boot:run
```

A API fica em `http://localhost:8080`; a verificação de saúde está em `/actuator/health`. Flyway aplica a migração inicial no primeiro início.

Inicie o aplicativo em outro terminal:

```bash
cd frontend
npm install
npm run start
```

O cliente usa `http://localhost:8080` na web e `http://10.0.2.2:8080` no Android Emulator. Configure `EXPO_PUBLIC_API_URL` para outros ambientes/dispositivos. Esse valor é uma URL pública, nunca coloque segredos nela.

## Funcionalidades presentes

O frontend possui cadastro, login, sessão persistida com armazenamento seguro, conta, atividades (criar, editar, duplicar, concluir, reabrir, cancelar, favoritos e prioridades), lixeira/restauração, metas mensais, histórico e resumos. A API fornece autenticação JWT, isolamento por usuário, operações de atividades e lixeira, metas e resumo mensal. Consulte `docs/API_CONTRATO.md`.

## Verificações

Na raiz, `mvn -f backend/pom.xml test` executa os testes do backend. Para verificar tipos do frontend, use `cd frontend && npx tsc --noEmit`; `npm run lint` está listado no projeto, sujeito à configuração de lint disponível. O roteiro detalhado está em `docs/ROTEIRO_EXECUCAO.md`.
