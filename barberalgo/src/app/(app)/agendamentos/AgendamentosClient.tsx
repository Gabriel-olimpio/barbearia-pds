/** @format */

"use client";

import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  Clock3,
  ListChecks,
  Scissors,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

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

const inputClassName =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-[#bdff31] focus:ring-2 focus:ring-[#bdff31]/20";

function StepLabel({
  number,
  title,
  active,
  done,
}: {
  number: number;
  title: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        active || done
          ? "border-lime-400/30 bg-lime-400/10 text-lime-200"
          : "border-zinc-800 bg-zinc-950/70 text-zinc-500"
      }`}>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-[#bdff31] text-black" : "border border-current"
        }`}>
        {done ? <Check size={15} /> : number}
      </span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const isEmpty = value.startsWith("Selecione");

  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800 py-3 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={`text-right text-sm font-medium ${
          isEmpty ? "text-zinc-500" : "text-zinc-100"
        }`}>
        {value}
      </span>
    </div>
  );
}

export default function AgendamentosClient() {
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
    setDataSelecionada(null);

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

  const hasBaseSelection = Boolean(servico && barbeiro && data);

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-lime-300">
              Área do Cliente
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50">
              Novo agendamento
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Escolha serviço, barbeiro, data e horário para reservar seu
              atendimento.
            </p>
          </div>

          <Link
            href="/meus-agendamentos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800">
            <ListChecks size={18} />
            Meus agendamentos
          </Link>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <StepLabel number={1} title="Serviço" active={!servico} done={!!servico} />
          <StepLabel
            number={2}
            title="Barbeiro"
            active={!!servico && !barbeiro}
            done={!!barbeiro}
          />
          <StepLabel
            number={3}
            title="Data"
            active={!!barbeiro && !data}
            done={!!data}
          />
          <StepLabel
            number={4}
            title="Horário"
            active={hasBaseSelection && !horario}
            done={!!horario}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
                  <Scissors size={17} className="text-lime-300" />
                  Serviço
                </span>
                <select
                  value={servico}
                  onChange={(e) => {
                    setServico(e.target.value);
                    setHorario("");
                    setMostrarConfirmacao(false);
                  }}
                  className={inputClassName}>
                  <option value="">Selecione um serviço</option>

                  {servicos.map((servico) => (
                    <option key={servico.id} value={servico.name}>
                      {servico.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
                  <UserRound size={17} className="text-lime-300" />
                  Barbeiro
                </span>
                <select
                  value={barbeiro}
                  onChange={(e) => {
                    setBarbeiro(e.target.value);
                    setHorario("");
                    setMostrarConfirmacao(false);
                  }}
                  className={inputClassName}>
                  <option value="">Selecione um barbeiro</option>

                  {barbeiros.map((barbeiro) => (
                    <option key={barbeiro.id} value={barbeiro.name}>
                      {barbeiro.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-100">
                  <CalendarDays size={17} className="text-lime-300" />
                  Data
                </span>
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
                  className={inputClassName}
                  wrapperClassName="w-full"
                />
              </label>

              {data && (
                <p className="mt-3 text-sm font-medium text-lime-300">
                  {dataFormatada}
                </p>
              )}
            </div>

            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-lime-300" />
                <h2 className="text-lg font-semibold text-zinc-50">
                  Horários disponíveis
                </h2>
              </div>

              {!hasBaseSelection ? (
                <div className="mt-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
                  Selecione serviço, barbeiro e data para consultar os horários.
                </div>
              ) : horariosDisponiveisReais.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6">
                  <h3 className="font-semibold text-zinc-100">
                    Nenhum horário disponível
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Tente escolher outra data ou outro barbeiro.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {horariosDisponiveisReais.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => {
                        setHorario(hora);
                        setMostrarConfirmacao(false);
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        horario === hora
                          ? "border-[#bdff31] bg-[#bdff31] text-black"
                          : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-[#bdff31]"
                      }`}>
                      {hora}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
                <ListChecks size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-50">
                  Resumo do agendamento
                </h2>
                <p className="text-sm text-zinc-500">Confira antes de reservar.</p>
              </div>
            </div>

            <div className="mt-5">
              <SummaryRow
                label="Serviço"
                value={servico || "Selecione um serviço"}
              />
              <SummaryRow
                label="Barbeiro"
                value={barbeiro || "Selecione um barbeiro"}
              />
              <SummaryRow
                label="Data"
                value={dataFormatada || "Selecione uma data"}
              />
              <SummaryRow
                label="Horário"
                value={horario || "Selecione um horário"}
              />
            </div>

            {mostrarConfirmacao ? (
              <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-4">
                <h3 className="font-semibold text-lime-100">
                  Confirmar agendamento
                </h3>
                <p className="mt-1 text-sm text-lime-200/80">
                  Tudo certo para reservar este horário?
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    type="button"
                    onClick={confirmarAgendamento}
                    className="inline-flex items-center justify-center rounded-xl bg-[#bdff31] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95">
                    Confirmar
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostrarConfirmacao(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={abrirConfirmacao}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#bdff31] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-95">
                Confirmar agendamento
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
