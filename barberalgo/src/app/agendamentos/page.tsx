"use client";

import { useEffect, useState } from "react";

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

const [barbeiros, setBarbeiros] = useState<
  {
    id: string;
    name: string;
    phone: string;
    availabilities: {
      dayOfWeek: number;
      startTimeMinutes: number;
      endTimeMinutes: number;
    }[];
  }[]
>([]);

const [servicos, setServicos] = useState<
  {
    id: string;
    name: string;
    durationMinutes: number;
  }[]
>([]);

const [agendamentos, setAgendamentos] = useState<any[]>([]);

useEffect(() => {
  async function carregarServicos() {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();

      setServicos(data.services);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  }

  async function carregarBarbeiros() {
    try {
      const response = await fetch("/api/barbers");
      const data = await response.json();

      
      setBarbeiros(data.barbers);
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
    }
  }

  async function carregarAgendamentos() {
  try {
    const response = await fetch("/api/appointments");
    const data = await response.json();

    setAgendamentos(data.appointments);
  } catch (error) {
    console.error(
      "Erro ao carregar agendamentos:",
      error
    );
  }
}
carregarServicos();
carregarBarbeiros();
carregarAgendamentos();
}, []);

useEffect(() => {
  setHorario("");
}, [barbeiro, data, servico]);

function minutosParaHorario(minutos: number) {
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;

  return `${hora
    .toString()
    .padStart(2, "0")}:${minuto
    .toString()
    .padStart(2, "0")}`;
}


const servicoSelecionado = servicos.find(
  (s) => s.name === servico
);

const barbeiroSelecionado = barbeiros.find(
  (b) => b.name === barbeiro
);

const diaSemanaSelecionado = data
  ? new Date(`${data}T12:00:00`).getDay()
  : null;

const dataFormatada = data
  ? new Date(`${data}T12:00:00`).toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    )
  : "";

const horariosDoBarbeiro =
  barbeiroSelecionado && diaSemanaSelecionado !== null
    ? barbeiroSelecionado.availabilities
        .filter(
          (availability) =>
            availability.dayOfWeek === diaSemanaSelecionado
        )
        .map((availability) =>
          minutosParaHorario(
            availability.startTimeMinutes
          )
        )
    : [];

const duracaoServico =
  servicoSelecionado?.durationMinutes || 0;

const agendamentosDoDia = agendamentos.filter(
  (agendamento) => {
const dataAgendamento =
  agendamento.startsAt.split("T")[0];

       
    return (
      agendamento.barber.user.name === barbeiro &&
      dataAgendamento === data &&
      agendamento.status === "SCHEDULED"
    );
  }
);

const horariosOcupados = agendamentosDoDia.flatMap(
  (agendamento) => {
    const inicio = new Date(
      agendamento.startsAt
    );

    const fim = new Date(
      agendamento.endsAt
    );

    const inicioEmMinutos =
      inicio.getHours() * 60 +
      inicio.getMinutes();

    const fimEmMinutos =
      fim.getHours() * 60 +
      fim.getMinutes();

    const quantidadeBlocos =
      (fimEmMinutos - inicioEmMinutos) / 15;

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


const horariosDisponiveisReais =
  horariosDoBarbeiro.filter(
    (hora) => !horarioConflita(hora)
  );

const confirmarAgendamento = async () => {
  if (
    !servicoSelecionado ||
    !barbeiro ||
    !data ||
    !horario
  ) {
    alert("Preencha todos os campos.");
    return;
  }

const response = await fetch(

  "/api/appointments",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      servico,
      barbeiro,
      data,
      horario,
    }),
  }
);

const resultado = await response.json();

if (!response.ok) {
  alert(resultado.error);
  return;
}

  setMostrarConfirmacao(false);

  setServico("");
  setBarbeiro("");
  setData("");
  setHorario("");

const responseAgendamentos =
  await fetch("/api/appointments");

const dataAgendamentos =
  await responseAgendamentos.json();

setAgendamentos(
  dataAgendamentos.appointments
);

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
  value={servico.name}
>
  {servico.name}
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

{barbeiros.map((barbeiro) => (
  <option
    key={barbeiro.id}
    value={barbeiro.name}
  >
    {barbeiro.name}
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

{data && (
  <p>
    {dataFormatada}
  </p>
)}

<br />
<br />


{servico && barbeiro && data && (
  <>
    <label>Horários disponíveis:</label>

    <br />
    <br />

{horariosDisponiveisReais.map((hora) => (
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
  Data: {dataFormatada}
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