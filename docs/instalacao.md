<!-- @format -->

## Como instalar e executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js;
- npm;
- Git;
- Acesso ao banco de dados PostgreSQL usado pelo projeto.

### Clonar o repositório

```bash
git clone https://github.com/Gabriel-olimpio/barbearia-pds.git
```

Entrar na pasta do projeto:

```bash
cd barbearia-pds/barberalgo
```

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

Criar um arquivo `.env` dentro da pasta `barberalgo`.

Exemplo:

```
DATABASE_URL="sua_connection_string_do_banco"
```

O arquivo `.env` não deve ser enviado para o GitHub, pois contém informações sensíveis de conexão com o banco.

### Sincronizar o banco com o Prisma

```bash
npx prisma db push
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Executar o projeto

```bash
npm run dev
```

A aplicação ficará disponível em:

```
http://localhost:3000
```

---

## 5. Estrutura de pastas

Estrutura geral do repositório:

```
barbearia-pds/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── barberalgo/
│   ├── prisma/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── diagramas/
│
└── README.md
```

### `.github/workflows`

Contém o arquivo de configuração do GitHub Actions, responsável por executar validações automáticas no projeto.

### `barberalgo`

Contém o código principal da aplicação.

### `barberalgo/prisma`

Contém o arquivo `schema.prisma`, responsável por definir os modelos do banco de dados.

### `barberalgo/src/app`

Contém as páginas e rotas da aplicação usando o App Router do Next.js.

### `barberalgo/src/app/api`

Contém as rotas de API utilizadas para acessar e manipular os dados do sistema.

### `diagramas`

Contém os diagramas do projeto, como:

- Diagrama de casos de uso;
- Diagrama de classes;
- Diagramas de sequência;
- Protótipos de telas.

---

## 6. Funcionalidades implementadas

### Cadastro de serviços

O administrador pode cadastrar serviços oferecidos pela barbearia, informando:

- Nome;
- Descrição;
- Duração;
- Valor.

Também é possível editar e excluir/desativar serviços cadastrados.

### Cadastro de barbeiros

O administrador pode cadastrar barbeiros, informando:

- Nome;
- Telefone;
- Horários disponíveis.

Os horários são salvos no banco e utilizados posteriormente no fluxo de agendamento.

### Agendamento

O cliente pode realizar um agendamento escolhendo:

- Serviço;
- Barbeiro;
- Data;
- Horário disponível.

O sistema busca os dados no banco e grava o agendamento com status inicial de agendado.

### Visualização de agendamentos

O cliente pode visualizar seus agendamentos futuros e passados, com informações como:

- Serviço;
- Barbeiro;
- Data;
- Horário;
- Status.

Também pode cancelar agendamentos futuros.

### Dashboard administrativo

O administrador poderá visualizar métricas da barbearia, como:

- Total de agendamentos;
- Atendimentos realizados;
- Agendamentos cancelados;
- Serviços mais agendados;
- Horários de maior movimentação.

### Gerenciamento de usuários

O administrador poderá consultar usuários cadastrados, editar informações e excluir ou desativar usuários.

### Agenda do barbeiro

O barbeiro poderá visualizar os agendamentos feitos para ele, com informações do cliente, serviço, data e horário.
