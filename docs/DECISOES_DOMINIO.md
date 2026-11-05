# NORTH — decisões de domínio da base inicial

## Atividade
- Identificador UUID e vínculo obrigatório ao usuário.
- Estados: `PENDENTE`, `CONCLUIDA`, `CANCELADA`.
- `data_prevista` e `horario_previsto` organizam a agenda; `data_realizada` informa em qual data o impacto financeiro realizado será contabilizado.
- Reabrir atividade concluída retorna a `PENDENTE` e limpa `data_realizada`, `tipo_financeiro_realizado`, `valor_realizado` e `impacto_financeiro_realizado`; o planejamento permanece.
- Cancelar mantém a atividade registrada em estado `CANCELADA`; reabertura é possível.
- Mover para a lixeira é exclusão lógica, independente do estado. Restaurar desfaz a exclusão dentro de 30 dias.
- Depois de 30 dias desde `excluida_em`, a limpeza automática exclui permanentemente a linha.
- Favorito e prioridade são independentes: favorito é preferência pessoal; prioridade altera organização visual. Atraso é derivado da data e do estado, não é gravado como estado.

## Impacto financeiro
- `tipo_financeiro`: `ENTRADA` ou `SAIDA`; valores são positivos e a direção define a operação.
- Valores planejados e realizados são campos distintos.
- Status planejado: `SEM_IMPACTO`, `PLANEJADO`, `INDEFINIDO`. Status realizado: `SEM_IMPACTO`, `REALIZADO`, `INDEFINIDO`. O banco valida o par de tipo/valor e o estado correspondente.
- Essa distinção impede que a ausência de impacto financeiro seja confundida com um valor que ainda não foi conhecido. O frontend atual ainda precisará expor `INDEFINIDO` para aproveitar totalmente esta regra.
- Realizado mensal: soma de entradas realizadas menos saídas realizadas em `data_realizada` dentro do mês.
- Projeção: resultado realizado + entradas planejadas conhecidas de atividades pendentes do mês - saídas planejadas conhecidas de atividades pendentes do mês.
- Canceladas não entram na projeção; excluídas da lixeira não entram em listas nem cálculos normais.
- O resumo assinala projeção parcial quando existem atividades pendentes do período com impacto planejado `INDEFINIDO` ou atividades concluídas no período com impacto realizado `INDEFINIDO`. O número não presume que atividades `SEM_IMPACTO` tenham valor desconhecido.

## Meta
- No máximo uma meta por usuário, ano e mês.
- Meta é opcional e seu resumo é derivado; não é armazenado como uma cópia de valores calculados das atividades.

## Limites da versão
- Esta base não inclui fluxo de recuperação de senha com e-mail.
- Esta base não aplica ainda rate limiting, verificação de e-mail, refresh token ou mecanismo de revogação JWT; antes de publicação real, esses itens devem ser planejados.
- O frontend enviado continua usando dados locais até a etapa explícita de integração com `/api`.
