# NORTH — Contrato inicial da API

Base local: `http://localhost:8080/api`. Datas são strings ISO 8601: `YYYY-MM-DD`; horário: `HH:mm:ss` (o frontend pode enviar `HH:mm`). Valores financeiros são decimais positivos, em reais, usando JSON number. Em integrações futuras, preferir serialização decimal consistente e nunca transformar `null` em `0`.

## Autenticação

### `POST /auth/register`
```json
{"name":"Pessoa Usuária","email":"pessoa@example.com","password":"senha-com-8-ou-mais"}
```
Retorna `accessToken`, `tokenType`, `expiresInSeconds` e `user`.
O objeto `user` inclui `id`, `name`, `email`, `createdAt`, `landingScreen` (`home` ou `activities`) e `onboardingCompleted`.

### `POST /auth/login`
```json
{"email":"pessoa@example.com","password":"senha-com-8-ou-mais"}
```
Todos os endpoints abaixo exigem `Authorization: Bearer <accessToken>`.

## Conta
- `GET /me`: consultar nome/e-mail/id e preferências persistidas da conta.
- `PATCH /me`: `{ "name": "Nome atualizado" }`.
- `PATCH /me/preferences`: `{ "landingScreen": "activities" }` para salvar a tela inicial da conta (`home` ou `activities`).
- `POST /me/onboarding/complete`: marca o onboarding da conta como concluído; operação idempotente.

Contas existentes são consideradas com onboarding concluído na migração. Contas novas iniciam com `onboardingCompleted: false`; a conclusão e a preferência são persistidas por usuário autenticado.

## Atividades
- `GET /activities`: filtros opcionais `status`, `from`, `to`, `type`, `priority`, `favorite`, `search`.
- `POST /activities`: cria atividade pendente.
- `GET /activities/{id}`: detalhe pertencente ao usuário autenticado.
- `PUT /activities/{id}`: substitui os campos editáveis da atividade (use `null` para limpar campos opcionais).
- `POST /activities/{id}/complete`: conclui com data/impacto realizado.
- `POST /activities/{id}/reopen`: volta para pendente e limpa realização/cancelamento; preserva planejamento.
- `POST /activities/{id}/cancel`: cancela sem excluir.
- `POST /activities/{id}/duplicate`: cria uma nova atividade pendente sem copiar favorito nem dados realizados.
- `PATCH /activities/{id}/favorite`: `{ "value": true }`.
- `PATCH /activities/{id}/priority`: `{ "value": true }`.
- `POST /activities/{id}/trash`: move para a lixeira sem alterar o estado de negócio.

Exemplo de `POST /activities` com impacto financeiro previsto:
```json
{
  "title":"Mercado",
  "icon":"market",
  "date":"2026-10-28",
  "time":"10:00:00",
  "priority":false,
  "favorite":false,
  "plannedImpactStatus":"PLANEJADO",
  "plannedType":"SAIDA",
  "plannedValue":150.00,
  "description":"Comprar itens da semana",
  "observation":"Comparar preços"
}
```

Status financeiro planejado: `SEM_IMPACTO`, `PLANEJADO`, `INDEFINIDO`. Se não enviar `plannedImpactStatus`, a API infere `PLANEJADO` quando o tipo e valor estiverem presentes; sem valor, usa `SEM_IMPACTO` por compatibilidade. Para valor que ainda não se conhece, envie `INDEFINIDO`. Esse campo permite distinguir atividade sem impacto financeiro de projeção incompleta.

Para conclusão, `POST /activities/{id}/complete` recebe `realizedAt` (opcional; padrão data atual), `realizedImpactStatus`, `realizedType`, `realizedValue` e `observation`. Estados de impacto realizado: `SEM_IMPACTO`, `REALIZADO`, `INDEFINIDO`. Tipo e valor devem ser enviados juntos; valor zero não representa ausência de dado.

## Lixeira
- `GET /trash`: itens excluídos logicamente dentro do prazo.
- `POST /trash/{id}/restore`: restaura atividade dentro da retenção.
- `DELETE /trash/{id}`: exclusão definitiva iniciada pelo usuário.
- Limpeza automática diária remove itens com mais de 30 dias desde `excluida_em`.

## Metas e resumo mensal
- `GET /goals?year=2026`: metas do ano do usuário.
- `GET /goals/{year}/{month}`: uma meta do período (pode não existir ainda).
- `PUT /goals`: `{ "year":2026, "month":10, "value":2000.00 }` (cria ou atualiza a única meta daquele usuário/mês).
- `GET /monthly-summary/history?year=2026`: resumo dos 12 meses do ano.
- `GET /monthly-summary?year=2026&month=10`: resumo calculado com entradas/saídas realizadas, resultado realizado, planejamentos conhecidos, projeção, meta, distância, percentual realizado, sinalização de projeção parcial (impactos planejados ou realizados ainda indefinidos) e atividades relacionadas.

## Códigos comuns
- `400`: validação/parâmetros inválidos.
- `401`: falta ou invalidade do token/credenciais.
- `404`: recurso não encontrado para esse usuário.
- `409`: transição de estado ou regra de integridade conflitante.
- `410`: prazo de restauração expirado.

A API não deve revelar a existência de recursos de outro usuário: o acesso é sempre limitado pelo identificador do usuário autenticado.
