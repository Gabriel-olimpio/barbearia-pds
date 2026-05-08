<!-- @format -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md

## Projeto

Este repositório contém o BarberAlgo, um sistema de agendamento para barbearias.

O sistema deve permitir:

- cadastro e login de usuários;
- diferenciação entre Cliente, Barbeiro e Administrador;
- cadastro de barbeiros;
- cadastro de serviços;
- consulta de horários disponíveis;
- criação, listagem e cancelamento de agendamentos;
- visualização de dashboard administrativo com métricas de agendamento, barbeiro, serviço e receita.

## Stack principal

Use preferencialmente:

- Next.js com App Router;
- TypeScript;
- Tailwind CSS;
- Prisma ORM;
- PostgreSQL;
- Server Actions quando fizer sentido;
- componentes reutilizáveis em React.

Não adicione novas dependências sem justificar a necessidade.

## Organização de pastas

Siga esta estrutura como referência:

```text
src/
  app/
    page.tsx
    login/
    dashboard/
    agendamentos/
    servicos/
    barbeiros/

  actions/
    appointment-actions.ts
    service-actions.ts
    barber-actions.ts
    auth-actions.ts

  components/
    ui/
    forms/
    layout/

  lib/
    prisma.ts
    auth.ts
    validations.ts

  types/
<!-- END:nextjs-agent-rules -->
```
