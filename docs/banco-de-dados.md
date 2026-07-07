<!-- @format -->

## Banco de dados

O sistema utiliza PostgreSQL como banco de dados e Prisma ORM para comunicação entre aplicação e banco.

Os principais modelos do sistema são:

### User

Representa os usuários do sistema.

Pode ser:

- Cliente;
- Barbeiro;
- Administrador.

### BarberProfile

Representa as informações específicas de um barbeiro.

### Service

Representa os serviços oferecidos pela barbearia.

### Availability

Representa os horários disponíveis de cada barbeiro.

### Appointment

Representa os agendamentos realizados pelos clientes.

## Prisma

O Prisma é utilizado para:

- Modelar o banco de dados;
- Criar e atualizar tabelas;
- Consultar dados;
- Inserir registros;
- Atualizar registros;
- Excluir ou desativar registros.

Comandos principais utilizados:

### Sincronizar schema com banco

```bash
npx prisma db push
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Abrir Prisma Studio
