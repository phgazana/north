# NORTH

> Aplicativo de organização pessoal que conecta atividades, planejamento financeiro e metas mensais.

**NORTH** é um projeto acadêmico desenvolvido pela **NODUS** para a disciplina de **Análise e Projeto de Sistemas II**.

A proposta do aplicativo é permitir que o usuário organize suas atividades pessoais e profissionais e compreenda como aquilo que já aconteceu e o que ainda está planejado pode impactar seus objetivos financeiros mensais.

---

## Status do projeto

**Em desenvolvimento — fase de prototipação e preparação para implementação.**

O projeto já possui sua documentação de análise e projeto, modelos UML, modelagem do banco de dados, definição de requisitos, casos de uso, wireframes e protótipos de alta fidelidade.

A implementação do sistema será realizada nas próximas etapas do projeto.

---

## Sobre o projeto

O NORTH centraliza atividades, entradas, saídas e metas em uma única experiência.

O sistema permite que uma atividade possua impacto financeiro opcional, possibilitando acompanhar:

- atividades pessoais e profissionais;
- prazos e prioridades;
- entradas e saídas financeiras;
- valores previstos e realizados;
- meta financeira mensal;
- resultado atual;
- projeção financeira do mês.

O objetivo não é substituir uma aplicação bancária, mas oferecer uma visão simples da relação entre **planejamento, rotina e objetivos**.

---

## Principais conceitos

O NORTH foi projetado a partir da relação entre:

**Atividade → Planejamento → Realização → Resultado → Evolução**

Uma atividade pode existir sem impacto financeiro ou possuir valores planejados e realizados. Dessa forma, o sistema permite acompanhar tanto a organização da rotina quanto seus possíveis impactos financeiros.

---

## Tecnologias

### Mobile

- React Native
- Expo
- TypeScript
- Expo Router

### Backend

- Java
- Spring Boot

### Banco de dados

- PostgreSQL

### Outros

- API REST
- JSON
- Git
- GitHub

---

## Estrutura do repositório

```text
north/
├── apresentacao/       # Materiais das apresentações acadêmicas
├── banco-de-dados/     # Modelos e scripts do banco de dados
├── codigo-fonte/       # Aplicativo mobile e backend
│   ├── mobile/
│   └── backend/
├── documentacao/       # Documentação de análise e projeto
├── prototipos/         # Wireframes e protótipos das interfaces
├── testes/             # Planos, casos e evidências de testes
├── .gitignore
└── README.md
