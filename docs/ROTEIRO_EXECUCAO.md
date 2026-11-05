# Roteiro para executar o NORTH

## Requisitos

Java 21, Maven, Node.js/npm e Docker Compose (ou PostgreSQL local).

## Configurar ambiente

Na raiz do repositório:

```bash
cp .env.example .env
```

Edite `.env` e defina `POSTGRES_PASSWORD` e `DB_PASSWORD` com a mesma senha local, além de `JWT_SECRET` como Base64 de ao menos 32 bytes aleatórios (`openssl rand -base64 32`). O exemplo contém marcadores que precisam ser substituídos. Não versione `.env`.

## Banco de dados e API

```bash
docker compose up -d postgres
cd backend
set -a
source ../.env
set +a
mvn test
mvn spring-boot:run
```

Flyway executa a migração inicial. Consulte `http://localhost:8080/actuator/health`. Sem Docker, configure uma instância PostgreSQL local com os mesmos valores em `.env`.

## Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run start
```

O aplicativo já possui integração HTTP com a API. Por padrão usa `localhost:8080` na web e `10.0.2.2:8080` no Android Emulator. Para dispositivo físico ou outro host, configure `EXPO_PUBLIC_API_URL` com a URL acessível; não use essa variável para segredos. Veja `INTEGRACAO_FRONTEND.md` e `API_CONTRATO.md`.

## Verificações

Execute `mvn test` para os testes do backend. Para checar tipos do frontend, execute `npx tsc --noEmit` em `frontend/`. A validação de integração com PostgreSQL e dispositivos deve ser feita nos ambientes disponíveis.
