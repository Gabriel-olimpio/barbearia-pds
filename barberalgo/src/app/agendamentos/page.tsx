"use client";

import { useState } from "react";

export default function AgendamentosPage() {
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [barbeiro, setBarbeiro] = useState("");
const horarios = [];
const [mostrarConfirmacao, setMostrarConfirmacao] =
  useState(false);

for (let hora = 9; hora < 20; hora++) {
  for (let minuto = 0; minuto < 60; minuto += 15) {
    horarios.push(
      `${hora.toString().padStart(2, "0")}:${minuto
        .toString()
        .padStart(2, "0")}`
    );
  }
}

const barbeiros = [
  "João",
  "Carlos",
  "Pedro",
];

const servicos = [
  {
    id: 1,
    nome: "Barba",
    duracao: 15,
  },
  {
    id: 2,
    nome: "Corte",
    duracao: 30,
  },
  {
    id: 3,
    nome: "Corte + Barba",
    duracao: 45,
  },
];

const [agendamentos, setAgendamentos] =
  useState([
  {
    barbeiro: "Carlos",
    data: "2026-06-08",
    horario: "09:00",
    duracao: 45,
  },
  {
    barbeiro: "Carlos",
    data: "2026-06-08",
    horario: "14:00",
    duracao: 30,
  },
  {
  barbeiro: "Carlos",
  data: "2026-06-08",
  horario: "10:00",
  duracao: 45,
},
]);

const servicoSelecionado = servicos.find(
  (s) => s.nome === servico
);

const duracaoServico =
  servicoSelecionado?.duracao || 0;

const agendamentosDoDia = agendamentos.filter(
  (agendamento) =>
    agendamento.barbeiro === barbeiro &&
    agendamento.data === data
);

const horariosOcupados = agendamentosDoDia.flatMap(
  (agendamento) => {
    const [h, m] = agendamento.horario
      .split(":")
      .map(Number);   

    const inicioEmMinutos = h * 60 + m;

    const quantidadeBlocos =
      agendamento.duracao / 15;

    return Array.from(
      { length: quantidadeBlocos },
      (_, i) => {
        const totalMinutos =
          inicioEmMinutos + i * 15;

        const hora = Math.floor(
          totalMinutos / 60
        );

        const minuto =
          totalMinutos % 60;

        return `${hora
          .toString()
          .padStart(2, "0")}:${minuto
          .toString()
          .padStart(2, "0")}`;
      }
    );
  }
);

const horarioConflita = (
  horarioInicio: string
) => {
  const [h, m] = horarioInicio
    .split(":")
    .map(Number);

  const inicioEmMinutos = h * 60 + m;

  const quantidadeBlocos =
    duracaoServico / 15;

  for (
    let i = 0;
    i < quantidadeBlocos;
    i++
  ) {
    const totalMinutos =
      inicioEmMinutos + i * 15;

    const hora = Math.floor(
      totalMinutos / 60
    );

    const minuto =
      totalMinutos % 60;

    const horario = `${hora
      .toString()
      .padStart(2, "0")}:${minuto
      .toString()
      .padStart(2, "0")}`;

    if (
      horariosOcupados.includes(horario)
    ) {
      return true;
    }
  }

  return false;
};


const horariosValidos = horarios.filter((hora) => {
  const [h, m] = hora.split(":").map(Number);

  const inicioEmMinutos = h * 60 + m;

  const fimEmMinutos =
    inicioEmMinutos + duracaoServico;

  return fimEmMinutos <= 20 * 60;
});

const horariosDisponiveis = horariosValidos.filter(
  (hora) => !horarioConflita(hora)
);

const confirmarAgendamento = () => {
  if (
    !servicoSelecionado ||
    !barbeiro ||
    !data ||
    !horario
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  const novoAgendamento = {
    barbeiro,
    data,
    horario,
    duracao: servicoSelecionado.duracao,
  };

  setAgendamentos([
    ...agendamentos,
    novoAgendamento,
  ]);

  setMostrarConfirmacao(false);

  setServico("");
  setBarbeiro("");
  setData("");
  setHorario("");

  alert("Agendamento realizado!");
};

const abrirConfirmacao = () => {
  if (
    !servicoSelecionado ||
    !barbeiro ||
    !data ||
    !horario
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  setMostrarConfirmacao(true);
};

  return (
    <div>
      <h1>Agendamento de Serviços</h1>

      <br />

      <label>Serviço:</label>

      <br />

<select
  value={servico}
  onChange={(e) => setServico(e.target.value)}
>
  <option value="">Selecione um serviço</option>

{servicos.map((servico) => (
  <option
  key={servico.id}
  value={servico.nome}
>
  {servico.nome}
</option>
))}

</select>

      <br />
      <br />

<br />
<br />

<label>Barbeiro:</label>

<br />

<select
  value={barbeiro}
  onChange={(e) => setBarbeiro(e.target.value)}
>
  <option value="">Selecione um barbeiro</option>

  {barbeiros.map((nome) => (
    <option key={nome} value={nome}>
      {nome}
    </option>
  ))}

</select>

<br />
<br />

<label>Data:</label>

<br />

<input
  type="date"
  value={data}
  min={new Date().toISOString().split("T")[0]}
  onChange={(e) => setData(e.target.value)}
/>

<br />
<br />

{servico && barbeiro && data && (
  <>
    <label>Horários disponíveis:</label>

    <br />
    <br />

{horariosDisponiveis.map((hora) => (
  <button
    key={hora}
    onClick={() => setHorario(hora)}
    style={{
      marginRight: "10px",
      marginBottom: "10px",
      padding: "8px",
      cursor: "pointer",
      border:
        horario === hora
          ? "2px solid green"
          : "1px solid gray",
    }}
  >
    {hora}
  </button>
))}
  </>
)}
      <br />
      <br />
{mostrarConfirmacao && (
  <div
    style={{
      border: "1px solid black",
      padding: "20px",
      marginTop: "20px",
    }}
  >
    <h2>Confirmar Agendamento</h2>

    <p>Serviço: {servico}</p>

    <p>Barbeiro: {barbeiro}</p>

    <p>
  Data: {new Date(data).toLocaleDateString("pt-BR")}
</p>

    <p>Horário: {horario}</p>

    <button
      onClick={confirmarAgendamento}
    >
      Confirmar
    </button>

    <button
      onClick={() =>
        setMostrarConfirmacao(false)
      }
      style={{
        marginLeft: "10px",
      }}
    >
      Cancelar
    </button>
  </div>
)}
      <br />

{!mostrarConfirmacao && (
  <button
    onClick={abrirConfirmacao}
  >
    Confirmar Agendamento
  </button>
)}
   </div>
  );
}