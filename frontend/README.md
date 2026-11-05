# NORTH Frontend

Aplicativo Expo/React Native com TypeScript e Expo Router, integrado à API NORTH.

## Executar

```bash
npm install
npm run start
```

Atalhos: `npm run android`, `npm run ios` e `npm run web`. Configure `EXPO_PUBLIC_API_URL` para alterar a URL padrão da API (web `http://localhost:8080`; Android Emulator `http://10.0.2.2:8080`). Não inclua segredos em variáveis `EXPO_PUBLIC_*`.

Rotas e telas ficam em `src/app/`; serviços HTTP em `src/services/`; estado global em `src/context.tsx`. O contrato da API e detalhes de configuração estão em `../docs/API_CONTRATO.md` e `../docs/INTEGRACAO_FRONTEND.md`.
