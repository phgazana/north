# Integração do frontend com a API

O frontend atual já se comunica com a API REST. `src/services/api.ts` centraliza a URL, autenticação Bearer e tratamento de erros; `auth.ts`, `activities.ts` e `summaries.ts` implementam chamadas de autenticação, atividades, metas e resumos. `src/context.tsx` carrega a sessão e mantém o estado da interface sincronizado com as respostas do servidor. `tokenStorage.ts` usa armazenamento seguro no dispositivo e armazenamento local no navegador.

## Configuração da URL

Defina `EXPO_PUBLIC_API_URL` no ambiente do Expo quando a API não estiver no endereço padrão:

- Web: `http://localhost:8080`.
- Android Emulator: `http://10.0.2.2:8080`.
- Dispositivo físico: endereço IP local do computador na rede.

Essa variável contém somente a URL pública da API. Segredos do backend devem permanecer no `.env` da raiz e nunca ser adicionados a variáveis `EXPO_PUBLIC_*`.

## Recursos conectados

- Cadastro, login, consulta de sessão e logout.
- Criação, edição, duplicação, conclusão, reabertura, cancelamento e listagem de atividades.
- Filtros da interface, favoritos, prioridade e lixeira com restauração.
- Metas mensais e resumos/histórico financeiro.

O módulo `src/data/mock/data.ts` permanece no projeto como dado local de referência; a camada de contexto usa os serviços HTTP para as operações do aplicativo. As respostas e regras do servidor estão descritas em `API_CONTRATO.md`.

## Verificação manual

Com PostgreSQL e API iniciados, valide cadastro/login, recarga de sessão, operações de atividade, lixeira/restauração, metas e resumo em meses diferentes. Teste web, Android Emulator e dispositivo físico conforme os ambientes utilizados. O backend inclui testes unitários em `backend/src/test/`.
