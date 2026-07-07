<!-- @format -->

## Documentação das APIs

As APIs ficam dentro de:

```
src/app/api
```

### Serviços

#### Buscar serviços

```
GET /api/services
```

Retorna a lista de serviços cadastrados.

#### Criar serviço

```
POST /api/services
```

Cria um novo serviço.

Dados esperados:

```json
{
  "name": "Corte masculino",
  "description": "Corte tradicional ou degradê",
  "durationMinutes": 30,
  "price": 35
}
```

#### Editar serviço

```
PUT /api/services/:id
```

Atualiza os dados de um serviço existente.

#### Excluir/desativar serviço

```
DELETE /api/services/:id
```

Remove ou desativa um serviço cadastrado.

---

### Barbeiros

#### Buscar barbeiros

```
GET /api/barbers
```

Retorna a lista de barbeiros cadastrados.

#### Criar barbeiro

```
POST /api/barbers
```

Cria um novo barbeiro.

Dados esperados:

```json
{
  "name": "João Silva",
  "phone": "(98) 99999-9999",
  "availabilities": [
    {
      "dayOfWeek": 1,
      "startTimeMinutes": 540,
      "endTimeMinutes": 570
    }
  ]
}
```

#### Editar barbeiro

```
PUT /api/barbers/:id
```

Atualiza dados do barbeiro e seus horários disponíveis.

#### Excluir/desativar barbeiro

```
DELETE /api/barbers/:id
```

Remove ou desativa um barbeiro cadastrado.

---

### Agendamentos

#### Buscar agendamentos

```
GET /api/appointments
```

Retorna agendamentos cadastrados.

#### Criar agendamento

```
POST /api/appointments
```

Cria um novo agendamento.

Dados esperados:

```json
{
  "serviceId": "id_do_servico",
  "barberId": "id_do_barbeiro",
  "date": "2026-07-07",
  "startTimeMinutes": 540
}
```

#### Buscar meus agendamentos

```
GET /api/appointments/me
```

Retorna os agendamentos do cliente logado.

#### Cancelar agendamento

```
PATCH /api/appointments/:id/cancel
```

Altera o status de um agendamento para cancelado.
