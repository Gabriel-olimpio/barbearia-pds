# design.md — Diretrizes de UI/UX do BarberAlgo

## 1. Objetivo deste documento

Este documento orienta o Codex na melhoria de UI/UX do projeto **BarberAlgo**, com foco nas telas que já estão funcionando, mas ainda precisam de melhor organização visual, consistência e experiência de uso.

O objetivo **não é alterar regras de negócio, APIs, autenticação, Prisma ou sidebar**. O foco é melhorar o design das telas, mantendo o comportamento já existente.

---

## 2. Contexto do projeto

O BarberAlgo é um sistema web de agendamento para barbearia, com três perfis principais:

- **Cliente:** realiza agendamentos e consulta seus próprios agendamentos.
- **Barbeiro:** visualiza sua agenda.
- **Administrador:** gerencia serviços, barbeiros, usuários, agendamentos e dashboard.

O projeto utiliza:

- Next.js com App Router;
- React;
- TypeScript;
- Tailwind CSS;
- Prisma;
- PostgreSQL;
- lucide-react para ícones.

O visual desejado deve ser inspirado no estilo do **shadcn/ui**: limpo, leve, com cards bem definidos, boa hierarquia visual, espaçamento consistente, bordas suaves e componentes reutilizáveis.

---

## 3. Escopo da tarefa

### Telas prioritárias

Melhorar a UI/UX das seguintes telas:

1. `/meus-agendamentos`
2. `/agendamentos`
3. `/dashboard`

### Arquivos principais prováveis

Priorizar alterações nestes arquivos:

```text
src/app/(app)/meus-agendamentos/MeusAgendamentosClient.tsx
src/app/(app)/agendamentos/AgendamentosClient.tsx
src/app/(app)/dashboard/DashboardClient.tsx
```

Também pode criar componentes auxiliares se isso deixar o código mais organizado, por exemplo:

```text
src/components/ui/PageHeader.tsx
src/components/ui/EmptyState.tsx
src/components/ui/StatusBadge.tsx
src/components/ui/LoadingState.tsx
src/components/ui/ErrorAlert.tsx
src/components/ui/MetricCard.tsx
```

Não é obrigatório criar todos esses componentes. Crie apenas se for útil e sem complicar o projeto.

---

## 4. O que NÃO deve ser alterado

Não mexer na sidebar, pois ela já está sendo ajustada separadamente.

Não alterar:

```text
src/components/Sidebar.tsx
src/app/(app)/layout.tsx
```

Exceto se houver erro visual muito grave causado diretamente pela integração com as páginas. Mesmo assim, evitar mexer nesses arquivos.

Também não alterar:

- Rotas de API;
- Regras de negócio;
- Prisma schema;
- Autenticação;
- Permissões;
- Formato esperado das respostas das APIs;
- Nome das rotas;
- Funcionalidades já existentes.

A tarefa é de **UI/UX**, não de backend.

---

## 5. Direção visual desejada

### Estilo geral

Usar um visual limpo, moderno e administrativo, inspirado em shadcn/ui:

- Fundo geral suave;
- Cards brancos ou escuros, conforme o padrão atual do projeto;
- Bordas discretas;
- Sombras leves;
- Textos com boa hierarquia;
- Ícones discretos;
- Espaçamento consistente;
- Estados de carregamento, erro e vazio bem definidos.

### Tema visual sugerido

Manter a identidade de barbearia com visual sóbrio:

```text
Fundo principal: #0a0a0a ou #09090b
Cards: #111113, #18181b ou branco se a tela já estiver clara
Bordas: zinc-800 / zinc-200
Texto principal: zinc-50 / zinc-900
Texto secundário: zinc-400 / zinc-600
Destaque: #bdff31 ou verde suave já usado no projeto
Ações destrutivas: red-600 / red-700
Ações positivas: green-600 / green-700
```

Se a tela atual estiver em tema escuro, manter tema escuro. Não misturar tema claro e escuro dentro da mesma tela.

---

## 6. Padrão de layout das páginas

Todas as páginas principais devem seguir uma estrutura semelhante:

```tsx
<main className="min-h-screen px-6 py-8">
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
    {/* Cabeçalho da página */}
    {/* Conteúdo principal */}
  </div>
</main>
```

### Cabeçalho padrão

Cada tela deve ter:

- Pequeno label de contexto;
- Título grande;
- Descrição curta;
- Ação principal quando fizer sentido.

Exemplo visual:

```tsx
<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div>
    <p className="text-sm font-medium text-zinc-400">Área do Cliente</p>
    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50">
      Meus agendamentos
    </h1>
    <p className="mt-2 max-w-2xl text-sm text-zinc-400">
      Visualize seus horários futuros, cancelados e concluídos.
    </p>
  </div>

  {/* Ação principal opcional */}
</header>
```

---

## 7. Componentes visuais recomendados

### Botões

Usar classes consistentes para botões:

#### Botão primário

```tsx
className="inline-flex items-center justify-center rounded-xl bg-[#bdff31] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
```

#### Botão secundário

```tsx
className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
```

#### Botão destrutivo

```tsx
className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
```

### Inputs e selects

```tsx
className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-[#bdff31] focus:ring-2 focus:ring-[#bdff31]/20"
```

### Cards

```tsx
className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm"
```

### Badges de status

Criar um padrão visual para status:

- `SCHEDULED` / Agendado: verde ou lime;
- `CANCELED` / Cancelado: vermelho;
- `COMPLETED` / Concluído: azul ou emerald;
- `NO_SHOW` / Não compareceu: amarelo/amber ou zinc.

Exemplo:

```tsx
function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    SCHEDULED: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    CANCELED: "border-red-400/30 bg-red-400/10 text-red-300",
    COMPLETED: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    NO_SHOW: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  };

  return classes[status] ?? "border-zinc-700 bg-zinc-800 text-zinc-300";
}
```

---

## 8. Estados obrigatórios de UI

As telas devem prever quatro estados visuais:

### 1. Carregamento

Evitar apenas texto solto como `Carregando...`.

Preferir um card central ou skeleton simples:

```tsx
<div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
  Carregando informações...
</div>
```

### 2. Erro

Exibir erro em alerta visual:

```tsx
<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
  {error}
</div>
```

### 3. Vazio

Quando não houver dados, usar empty state com mensagem amigável e ação quando possível.

Exemplo:

```tsx
<div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
  <h3 className="text-lg font-semibold text-zinc-100">Nenhum agendamento encontrado</h3>
  <p className="mt-2 text-sm text-zinc-400">
    Quando você realizar um agendamento, ele aparecerá aqui.
  </p>
</div>
```

### 4. Sucesso

Quando possível, substituir `alert()` por feedback visual na tela.

Se não der tempo, pode manter `alert()`, mas melhorar a interface ao redor.

---

## 9. Tela `/meus-agendamentos`

### Problemas atuais percebidos

A tela funciona, mas a experiência ainda pode melhorar:

- Conteúdo aparece de forma simples, sem hierarquia visual forte;
- Agendamentos futuros e histórico poderiam estar melhor separados;
- Falta botão claro para criar novo agendamento;
- Cards podem ter melhor organização das informações;
- Status pode ser exibido com badge visual;
- O botão de cancelar precisa parecer uma ação destrutiva e ter melhor posicionamento;
- Estado vazio deve orientar o cliente sobre o próximo passo.

### Objetivo da melhoria

Transformar a tela em uma página clara de consulta de agendamentos, com destaque para próximos horários e histórico.

### Requisitos de UI/UX

A tela deve ter:

1. Cabeçalho com título, descrição e botão `Novo agendamento`;
2. Resumo com quantidade de agendamentos futuros e histórico;
3. Seção `Próximos agendamentos`;
4. Seção `Histórico`;
5. Cards de agendamento com boa leitura;
6. Badges de status;
7. Botão de cancelar apenas nos agendamentos futuros;
8. Estado vazio com mensagem amigável;
9. Estado de erro em alerta;
10. Estado de carregamento mais bonito.

### Card de agendamento deve exibir

- Nome do serviço;
- Nome do barbeiro;
- Data;
- Horário;
- Valor;
- Status;
- Botão cancelar, se for futuro.

### Sugestão de layout

```text
[Área do Cliente]      [Novo agendamento]
Meus agendamentos
Visualize seus horários marcados, cancelados e concluídos.

[Agendamentos futuros: 2] [Histórico: 4]

Próximos agendamentos
[Card] [Card]

Histórico
[Card] [Card]
```

### Ações

- Adicionar link/botão para `/agendamentos`;
- Manter cancelamento funcionando;
- Confirmar cancelamento antes de executar;
- Atualizar a lista após cancelar.

### Não alterar

- Não alterar endpoint `/api/appointments/me`;
- Não alterar endpoint de cancelamento;
- Não alterar regra de filtro de agendamentos;
- Não mexer em autenticação.

---

## 10. Tela `/agendamentos`

### Problemas atuais percebidos

A tela funciona, mas pode melhorar em fluxo e clareza:

- O fluxo de seleção ainda parece um formulário comum;
- Falta uma indicação clara de etapas;
- Falta link claro para `Meus agendamentos`;
- A confirmação poderia parecer um resumo de pedido/agendamento;
- Os horários disponíveis precisam ter melhor aparência;
- O DatePicker precisa ficar visualmente integrado ao restante da tela;
- O usuário precisa entender melhor o que falta selecionar.

### Objetivo da melhoria

Transformar a tela em um fluxo guiado de agendamento, semelhante a um checkout simples:

1. Escolher serviço;
2. Escolher barbeiro;
3. Escolher data;
4. Escolher horário;
5. Conferir resumo;
6. Confirmar.

### Requisitos de UI/UX

A tela deve ter:

1. Cabeçalho com título e descrição;
2. Botão/link para `/meus-agendamentos`;
3. Card principal com o formulário;
4. Indicador visual de etapas ou seções numeradas;
5. Selects padronizados;
6. DatePicker com estilo igual aos inputs;
7. Horários em botões/chips;
8. Estado vazio quando não houver horários disponíveis;
9. Card lateral ou inferior de `Resumo do agendamento`;
10. Botão de confirmação destacado.

### Fluxo visual sugerido

```text
[Área do Cliente]                  [Meus agendamentos]
Novo agendamento
Escolha serviço, barbeiro, data e horário.

[1 Serviço] [2 Barbeiro] [3 Data] [4 Horário]

Card formulário:
- Serviço
- Barbeiro
- Data
- Horários disponíveis

Card resumo:
Serviço: Corte masculino
Barbeiro: João
Data: 07/07/2026
Horário: 09:00
[Confirmar agendamento]
```

### Melhorias específicas

#### Serviço

Ao selecionar serviço, limpar horário e confirmação.

#### Barbeiro

Ao selecionar barbeiro, limpar horário e confirmação.

#### Data

Ao selecionar data, limpar horário e confirmação.

#### Horários

- Horário selecionado deve ter destaque forte;
- Horários indisponíveis não devem aparecer ou devem ser claramente bloqueados;
- Quando não houver horários, mostrar mensagem clara:

```text
Nenhum horário disponível para este barbeiro nesta data.
Tente escolher outra data ou outro barbeiro.
```

### Resumo do agendamento

O resumo deve mostrar apenas os itens já selecionados. Para os campos faltantes, usar texto secundário:

```text
Serviço: Selecione um serviço
Barbeiro: Selecione um barbeiro
Data: Selecione uma data
Horário: Selecione um horário
```

### Não alterar

- Não alterar chamada de criação de agendamento;
- Não alterar regras de conflito de horário;
- Não alterar formato do body enviado para `/api/appointments`;
- Não mexer na lógica de banco.

---

## 11. Tela `/dashboard`

### Problemas atuais percebidos

A tela já tem dados e cards, mas pode melhorar em apresentação:

- Cards podem ter hierarquia visual mais clara;
- Rankings e gráficos simples podem ficar mais legíveis;
- Estado de loading pode ser melhor;
- Alerta de erro deve ficar padronizado;
- Métricas precisam ser agrupadas por importância;
- Dashboard deve parecer uma tela administrativa mais consolidada.

### Objetivo da melhoria

Criar uma visão administrativa clara e elegante das métricas da barbearia, com leitura rápida e boa organização.

### Requisitos de UI/UX

A tela deve ter:

1. Cabeçalho com `Área Administrativa`, título e descrição;
2. Grid de cards de métricas principais;
3. Cards de ranking para serviços e barbeiros;
4. Cards de barras simples para status, dias e horários;
5. Estado de carregamento visual;
6. Estado de erro em alerta;
7. Estado vazio em rankings/gráficos;
8. Layout responsivo.

### Métricas principais sugeridas

Exibir em cards:

- Total de agendamentos;
- Agendamentos futuros;
- Atendimentos concluídos;
- Agendamentos cancelados;
- Receita estimada;
- Clientes cadastrados;
- Barbeiros ativos;
- Serviços ativos.

Não precisa inventar métricas novas se a API não retornar. Usar apenas os dados já disponíveis no objeto `DashboardData`.

### Organização visual sugerida

```text
[Área Administrativa]
Dashboard da Administração
Visão geral das principais métricas da barbearia.

Grid de métricas:
[Total agendamentos] [Futuros] [Concluídos] [Cancelados]
[Receita estimada] [Clientes] [Barbeiros] [Serviços]

Grid inferior:
[Serviços mais agendados] [Barbeiros com mais agendamentos]
[Status dos agendamentos] [Dias mais movimentados] [Horários mais movimentados]
```

### Cards de métrica

Cada card deve conter:

- Ícone;
- Título curto;
- Valor principal;
- Texto auxiliar opcional.

Exemplo:

```text
Total de agendamentos
35
Todos os status registrados
```

### Rankings

Os rankings devem mostrar:

- Posição;
- Nome;
- Quantidade;
- Barra de progresso proporcional.

### Gráficos simples

Não usar biblioteca nova de gráficos se não for necessário.

Pode manter barras simples em CSS/Tailwind.

### Não alterar

- Não alterar endpoint `/api/dashboard`;
- Não alterar estrutura de `DashboardData`;
- Não adicionar dependências de gráficos sem necessidade;
- Não mexer em permissões.

---

## 12. Responsividade

As telas devem funcionar bem em:

- Desktop;
- Notebook;
- Tablet;
- Celular.

### Regras práticas

- Usar `grid-cols-1` no mobile;
- Usar `md:grid-cols-2` ou `lg:grid-cols-4` em telas maiores;
- Evitar tabelas largas sem responsividade;
- Cards devem quebrar bem em telas pequenas;
- Botões principais devem ocupar largura total no mobile quando fizer sentido.

Exemplo:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* cards */}
</div>
```

---

## 13. Acessibilidade básica

Aplicar melhorias simples:

- Inputs com `label` visível;
- Botões com texto claro;
- Contraste adequado;
- Foco visível em inputs e botões;
- Não usar apenas cor para indicar status;
- Usar `aria-label` em botões com apenas ícone;
- Não deixar botões importantes sem descrição.

---

## 14. Regras sobre alert, confirm e feedback

Hoje algumas ações usam `alert()` e `confirm()`.

Para esta tarefa:

- Pode manter `confirm()` no cancelamento, se não houver tempo para modal;
- Se for simples, substituir `alert()` por mensagens visuais na tela;
- Não instalar biblioteca de toast sem autorização;
- Não criar um sistema complexo de notificação.

Preferência:

```text
Erro → alerta visual na tela
Sucesso → mensagem visual discreta
Cancelamento → confirmação antes da ação
```

---

## 15. Uso de lucide-react

O projeto já utiliza `lucide-react`. Pode usar ícones para melhorar a leitura visual.

Ícones sugeridos:

```text
CalendarDays → agendamentos
Clock3 → horário
Scissors → serviço/barbearia
User → cliente/barbeiro
Users → usuários
BarChart3 → dashboard
CheckCircle2 → concluído/sucesso
XCircle → cancelado/erro
CircleDollarSign → receita
Plus → novo agendamento
ArrowRight → avançar
```

Usar ícones com moderação. Eles devem ajudar a leitura, não poluir a tela.

---

## 16. Padrão de textos

Usar linguagem simples e direta.

### Exemplos bons

```text
Novo agendamento
Meus agendamentos
Próximos agendamentos
Histórico
Nenhum horário disponível
Agendamento cancelado com sucesso
Não foi possível carregar os dados
```

### Evitar

```text
Erro genérico
Dados indisponíveis
Operação inválida
```

Preferir mensagens que expliquem o que aconteceu e o que o usuário pode fazer.

---

## 17. Checklist de aceite

A tarefa será considerada concluída quando:

- `/meus-agendamentos` estiver visualmente organizada;
- `/agendamentos` tiver fluxo mais claro e botão para `Meus agendamentos`;
- `/dashboard` tiver cards e métricas mais legíveis;
- Sidebar não tiver sido alterada;
- APIs e regras de negócio não tiverem sido alteradas;
- Estados de loading, erro e vazio estiverem tratados;
- Telas estiverem responsivas;
- O projeto rodar com `npm run dev`;
- O projeto passar em `npm run lint`;
- O projeto passar em `npm run build`.

---

## 18. Prompt sugerido para o Codex

Use este prompt junto com este arquivo:

```text
Leia o arquivo design.md e aplique as melhorias de UI/UX no BarberAlgo.

Priorize as telas:
- src/app/(app)/meus-agendamentos/MeusAgendamentosClient.tsx
- src/app/(app)/agendamentos/AgendamentosClient.tsx
- src/app/(app)/dashboard/DashboardClient.tsx

Objetivo:
Melhorar o design e a experiência dessas telas, usando Tailwind CSS e uma estética inspirada em shadcn/ui.

Restrições:
- Não mexer na sidebar.
- Não alterar src/components/Sidebar.tsx.
- Não alterar src/app/(app)/layout.tsx.
- Não alterar APIs.
- Não alterar Prisma.
- Não alterar regras de negócio.
- Não instalar novas dependências sem necessidade.
- Manter as funcionalidades existentes funcionando.

Melhorias esperadas:
- Criar melhor hierarquia visual.
- Padronizar cards, botões, inputs e badges.
- Melhorar estados de loading, erro e vazio.
- Adicionar botão de navegação de /agendamentos para /meus-agendamentos.
- Melhorar o resumo do agendamento.
- Melhorar cards de agendamentos futuros e histórico.
- Melhorar visual do dashboard com cards e rankings mais legíveis.
- Garantir responsividade.

Ao final, rode ou indique que deve ser rodado:
- npm run lint
- npm run build
```

---

## 19. Observação final

A prioridade é deixar as telas com aparência mais profissional para apresentação, mantendo a aplicação estável. Se houver dúvida entre melhorar visual e alterar lógica, escolha melhorar apenas o visual.
