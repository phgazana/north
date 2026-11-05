# Banco de dados NORTH

A migração inicial é `migrations/V1__initial_schema.sql`. A cópia executada automaticamente pelo backend fica em `backend/src/main/resources/db/migration/V1__initial_schema.sql` e deve permanecer sincronizada.

O schema cria `usuarios`, `atividades` e `metas_mensais`, tipos enumerados para estado/tipo financeiro/estado do impacto e índices para consultas comuns e lixeira. Flyway registra e executa a migração no primeiro start da API; `ddl-auto=validate` faz Hibernate validar os mapeamentos sem alterar o schema.
