# Publicação Web no Render

O Expo Web está configurado para `web.output: "single"`. O aplicativo tem rotas com parâmetros que surgem em tempo de execução (onboarding, atividades e meses); uma exportação estática não consegue gerar antecipadamente os IDs de atividade de cada conta.

No serviço **Static Site** `north-frontend` do Render, confirme:

- **Root Directory:** `frontend` (ou, se o serviço usar a raiz do monorepo, ajuste os comandos e o diretório publicado conforme essa configuração).
- **Build Command:** `npm ci && npx expo export --platform web`.
- **Publish Directory:** `dist` quando o Root Directory for `frontend`.
- **Rewrite:** Source `/*`, Destination `/index.html`, Action `Rewrite`.
- **Environment:** `EXPO_PUBLIC_API_URL` deve apontar para a URL pública atual da API, sem barra final. Essa URL é pública e não deve conter segredos.

O rewrite faz o host servir a aplicação SPA para URLs diretas como `/onboarding/1`, `/onboarding/1.html`, `/atividade/<id>` e `/mes/<mês>`. A configuração do Render é externa a este repositório e precisa ser confirmada no painel do serviço antes do próximo deploy. O aplicativo mobile não depende desse rewrite.

Para testar localmente a mesma exportação:

```bash
cd frontend
npm ci
npx expo export --platform web
npx serve dist
```

Ao usar um servidor local de arquivos estáticos, configure também um fallback/rewrite para `index.html` ao testar rotas diretas.
