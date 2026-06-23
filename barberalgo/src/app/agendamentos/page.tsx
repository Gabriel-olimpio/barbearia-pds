/** @format */

"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

type Agendamento = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "SCHEDULED" | "CANCELED" | "COMPLETED" | "NO_SHOW";
  barber: {
    user: {
      name: string;
    };
  };
};

export default function AgendamentosPage() {
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [barbeiro, setBarbeiro] = useState("");
  const horarios = [];
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  for (let hora = 9; hora < 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 15) {
      horarios.push(
        `${hora.toString().padStart(2, "0")}:${minuto
          .toString()
          .padStart(2, "0")}`,
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

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

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
        const data: { appointments: Agendamento[] } = await response.json();

        setAgendamentos(data.appointments ?? []);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    }
    carregarServicos();
    carregarBarbeiros();
    carregarAgendamentos();
  }, []);

  function minutosParaHorario(minutos: number) {
    const hora = Math.floor(minutos / 60);
    const minuto = minutos % 60;

    return `${hora.toString().padStart(2, "0")}:${minuto
      .toString()
      .padStart(2, "0")}`;
  }

  const servicoSelecionado = servicos.find((s) => s.name === servico);

  const barbeiroSelecionado = barbeiros.find((b) => b.name === barbeiro);

  const diaSemanaSelecionado = data
    ? new Date(`${data}T12:00:00`).getDay()
    : null;

  const dataFormatada = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const horariosDoBarbeiro =
    barbeiroSelecionado && diaSemanaSelecionado !== null
      ? barbeiroSelecionado.availabilities
          .filter(
            (availability) => availability.dayOfWeek === diaSemanaSelecionado,
          )
          .map((availability) =>
            minutosParaHorario(availability.startTimeMinutes),
          )
      : [];

  const duracaoServico = servicoSelecionado?.durationMinutes || 0;

  const agendamentosDoDia = agendamentos.filter((agendamento) => {
    const dataAgendamento = agendamento.startsAt.split("T")[0];

    return (
      agendamento.barber.user.name === barbeiro &&
      dataAgendamento === data &&
      agendamento.status === "SCHEDULED"
    );
  });

  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);

  const horariosOcupados = agendamentosDoDia.flatMap((agendamento) => {
    const inicio = new Date(agendamento.startsAt);

    const fim = new Date(agendamento.endsAt);

    const inicioEmMinutos = inicio.getHours() * 60 + inicio.getMinutes();

    const fimEmMinutos = fim.getHours() * 60 + fim.getMinutes();

    const quantidadeBlocos = (fimEmMinutos - inicioEmMinutos) / 15;

    return Array.from({ length: quantidadeBlocos }, (_, i) => {
      const totalMinutos = inicioEmMinutos + i * 15;

      const hora = Math.floor(totalMinutos / 60);

      const minuto = totalMinutos % 60;

      return `${hora.toString().padStart(2, "0")}:${minuto
        .toString()
        .padStart(2, "0")}`;
    });
  });

  const horarioConflita = (horarioInicio: string) => {
    const [h, m] = horarioInicio.split(":").map(Number);

    const inicioEmMinutos = h * 60 + m;

    const quantidadeBlocos = duracaoServico / 15;

    for (let i = 0; i < quantidadeBlocos; i++) {
      const totalMinutos = inicioEmMinutos + i * 15;

      const hora = Math.floor(totalMinutos / 60);

      const minuto = totalMinutos % 60;

      const horario = `${hora.toString().padStart(2, "0")}:${minuto
        .toString()
        .padStart(2, "0")}`;

      if (horariosOcupados.includes(horario)) {
        return true;
      }
    }

    return false;
  };

  const horariosDisponiveisReais = horariosDoBarbeiro.filter(
    (hora) => !horarioConflita(hora),
  );

  const confirmarAgendamento = async () => {
    if (!servicoSelecionado || !barbeiro || !data || !horario) {
      alert("Preencha todos os campos.");
      return;
    }

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        servico,
        barbeiro,
        data,
        horario,
      }),
    });

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

    const responseAgendamentos = await fetch("/api/appointments");

    const dataAgendamentos: { appointments: Agendamento[] } =
      await responseAgendamentos.json();

    setAgendamentos(dataAgendamentos.appointments ?? []);

    alert("Agendamento realizado!");
  };

  const abrirConfirmacao = () => {
    if (!servicoSelecionado || !barbeiro || !data || !horario) {
      alert("Preencha todos os campos.");
      return;
    }

    setMostrarConfirmacao(true);
  };

  return (
    <main className="min-h-screen bg-[#121214] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Agendamento de Serviços
          </h1>

          <p className="text-zinc-400">Agende seus serviços</p>
        </div>

        <div className="bg-[#1a1a1e] border border-zinc-800 rounded-xl p-6">
          <label className="block text-white font-medium mb-2">Serviço</label>

          <select
            value={servico}
            onChange={(e) => {
              setServico(e.target.value);
              setHorario("");
              setMostrarConfirmacao(false);
            }}
            className="w-full bg-[#121214] border border-zinc-700 rounded-lg px-4 py-3 text-white mb-6">
            <option value="">Selecione um serviço</option>

            {servicos.map((servico) => (
              <option key={servico.id} value={servico.name}>
                {servico.name}
              </option>
            ))}
          </select>

          <label className="block text-white font-medium mb-2">Barbeiro</label>

          <select
            value={barbeiro}
            onChange={(e) => {
              setBarbeiro(e.target.value);
              setHorario("");
              setMostrarConfirmacao(false);
            }}
            className="w-full bg-[#121214] border border-zinc-700 rounded-lg px-4 py-3 text-white mb-6">
            <option value="">Selecione um barbeiro</option>

            {barbeiros.map((barbeiro) => (
              <option key={barbeiro.id} value={barbeiro.name}>
                {barbeiro.name}
              </option>
            ))}
          </select>

          <label className="block text-white font-medium mb-2">Data</label>

          <DatePicker
            selected={dataSelecionada}
            onChange={(date: Date | null) => {
              setDataSelecionada(date);
              setHorario("");
              setMostrarConfirmacao(false);

              if (date) {
                setData(date.toISOString().split("T")[0]);
              } else {
                setData("");
              }
            }}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione uma data"
            locale={ptBR}
            className="
    w-full
    bg-[#121214]
    border border-zinc-700
    rounded-lg
    px-4 py-3
    text-white
  "
          />

          {data && (
            <p className="mt-3 text-[#bdff31] text-sm">{dataFormatada}</p>
          )}

          {servico && barbeiro && data && (
            <>
              <div className="mt-8">
                <label className="block text-white font-medium mb-4">
                  Horários disponíveis
                </label>

                <div className="flex flex-wrap gap-2">
                  {horariosDisponiveisReais.map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setHorario(hora)}
                      className={`
                      px-4 py-2 rounded-lg border transition-all

                      ${
                        horario === hora
                          ? "bg-[#bdff31] text-black border-[#bdff31]"
                          : "bg-[#121214] text-white border-zinc-700 hover:border-[#bdff31]"
                      }
                    `}>
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mostrarConfirmacao && (
            <div className="mt-8 bg-[#121214] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Confirmar Agendamento
              </h2>

              <div className="space-y-2 text-zinc-300">
                <p>
                  <span className="text-white font-semibold">Serviço:</span>{" "}
                  {servico}
                </p>

                <p>
                  <span className="text-white font-semibold">Barbeiro:</span>{" "}
                  {barbeiro}
                </p>

                <p>
                  <span className="text-white font-semibold">Data:</span>{" "}
                  {dataFormatada}
                </p>

                <p>
                  <span className="text-white font-semibold">Horário:</span>{" "}
                  {horario}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmarAgendamento}
                  className="px-6 py-2 rounded-lg bg-[#bdff31] text-black font-bold hover:bg-[#a5e028]">
                  Confirmar
                </button>

                <button
                  onClick={() => setMostrarConfirmacao(false)}
                  className="px-6 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!mostrarConfirmacao && (
            <button
              onClick={abrirConfirmacao}
              className="mt-8 px-6 py-3 rounded-lg bg-[#bdff31] text-black font-bold hover:bg-[#a5e028]">
              Confirmar Agendamento
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
