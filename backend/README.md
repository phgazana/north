# NORTH Backend

API Java/Spring Boot 3.5.16 com PostgreSQL e migrações Flyway. Requer Java 21 e Maven.

Pelo diretório raiz do pacote:

```bash
docker compose up -d postgres
cd backend
set -a && source ../.env && set +a
mvn spring-boot:run
```

O backend inicia na porta 8080. `/actuator/health` é público; endpoints `/api/**` exceto `/api/auth/**` exigem JWT Bearer. Ao iniciar, Flyway executa a migração `V1__initial_schema.sql` e Hibernate valida o mapeamento (`ddl-auto=validate`).

Veja `../docs/API_CONTRATO.md` para os endpoints, `../docs/NORTH_API.http` para solicitações de exemplo e `../docs/INTEGRACAO_FRONTEND.md` para a configuração e os recursos conectados no frontend.

Esta é uma base de desenvolvimento, não uma implantação pronta para produção. Antes de publicar, implemente e revise política de segredo, rate limiting, verificação de e-mail, recuperação de senha, revogação/renovação de tokens, observabilidade e testes de integração com PostgreSQL real.
