/** @format */

"use client";

import { type SyntheticEvent, useEffect, useMemo, useState } from "react";

type AvailabilitySlot = {
  dayOfWeek: number;
  startTimeMinutes: number;
  endTimeMinutes: number;
};

type Barbeiro = {
  id: string;
  nome: string;
  telefone: string;
  horariosDisponiveis: AvailabilitySlot[];
};

type BarberResponse = {
  id: string;
  name: string;
  phone: string;
  availabilities: AvailabilitySlot[];
};

const diasDaSemana = [
  { dayOfWeek: 1, label: "Segunda", shortLabel: "Seg" },
  { dayOfWeek: 2, label: "Terça", shortLabel: "Ter" },
  { dayOfWeek: 3, label: "Quarta", shortLabel: "Qua" },
  { dayOfWeek: 4, label: "Quinta", shortLabel: "Qui" },
  { dayOfWeek: 5, label: "Sexta", shortLabel: "Sex" },
  { dayOfWeek: 6, label: "Sábado", shortLabel: "Sáb" },
];

const primeiroHorarioEmMinutos = 9 * 60;
const ultimoHorarioEmMinutos = 19 * 60 + 15;
const intervaloEmMinutos = 15;

function mapBarber(barber: BarberResponse): Barbeiro {
  return {
    id: barber.id,
    nome: barber.name,
    telefone: barber.phone,
    horariosDisponiveis: barber.availabilities,
  };
}

function formatarHorario(totalMinutos: number) {
  const fontHora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;

  return `${fontHora.toString().padStart(2, "0")}:${minuto
    .toString()
    .padStart(2, "0")}`;
}

function criarChaveHorario(dayOfWeek: number, startTimeMinutes: number) {
  return `${dayOfWeek}-${startTimeMinutes}`;
}

function lerChaveHorario(chave: string) {
  const [dayOfWeek, startTimeMinutes] = chave.split("-").map(Number);

  return {
    dayOfWeek,
    startTimeMinutes,
  };
}

const horarios = Array.from(
  {
    length:
      (ultimoHorarioEmMinutos - primeiroHorarioEmMinutos) / intervaloEmMinutos +
      1,
  },
  (_, index) => primeiroHorarioEmMinutos + index * intervaloEmMinutos,
);

export default function BarbeirosClient() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [horariosSelecionados, setHorariosSelecionados] = useState<string[]>(
    [],
  );
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const horariosSelecionadosSet = useMemo(
    () => new Set(horariosSelecionados),
    [horariosSelecionados],
  );

  useEffect(() => {
    async function carregarBarbeiros() {
      try {
        const response = await fetch("/api/barbers");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Erro ao carregar barbeiros.");
        }

        setBarbeiros(data.barbers.map(mapBarber));
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar barbeiros.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarBarbeiros();
  }, []);

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setHorariosSelecionados([]);
    setEditandoId(null);
  }

  function validarFormulario() {
    if (!nome.trim() || !telefone.trim()) {
      return "Nome e telefone são obrigatórios.";
    }

    return "";
  }

  function alternarHorario(dayOfWeek: number, startTimeMinutes: number) {
    const chave = criarChaveHorario(dayOfWeek, startTimeMinutes);

    setHorariosSelecionados((listaAtual) =>
      listaAtual.includes(chave)
        ? listaAtual.filter((horario) => horario !== chave)
        : [...listaAtual, chave],
    );
  }

  function montarHorariosPayload() {
    return horariosSelecionados
      .map(lerChaveHorario)
      .sort(
        (primeiroHorario, segundoHorario) =>
          primeiroHorario.dayOfWeek - segundoHorario.dayOfWeek ||
          primeiroHorario.startTimeMinutes - segundoHorario.startTimeMinutes,
      );
  }

  async function salvarBarbeiro(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const mensagemErro = validarFormulario();

    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setErro("");
    setSalvando(true);

    const payload = {
      name: nome.trim(),
      phone: telefone.trim(),
      availabilities: montarHorariosPayload(),
    };

    try {
      const url = editandoId ? `/api/barbers/${editandoId}` : "/api/barbers";
      const method = editandoId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao salvar barbeiro.");
      }

      const barbeiroSalvo = mapBarber(data.barber);

      setBarbeiros((listaAtual) =>
        editandoId
          ? listaAtual.map((barbeiro) =>
              barbeiro.id === editandoId ? barbeiroSalvo : barbeiro,
            )
          : [barbeiroSalvo, ...listaAtual],
      );

      limparFormulario();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar barbeiro.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarBarbeiro(barbeiro: Barbeiro) {
    setNome(barbeiro.nome);
    setTelefone(barbeiro.telefone);
    setHorariosSelecionados(
      barbeiro.horariosDisponiveis.map((horario) =>
        criarChaveHorario(horario.dayOfWeek, horario.startTimeMinutes),
      ),
    );
    setEditandoId(barbeiro.id);
    setErro("");
  }

  async function excluirBarbeiro(id: string) {
    const deveExcluir = window.confirm("Deseja excluir este barbeiro?");

    if (!deveExcluir) {
      return;
    }

    setErro("");

    try {
      const response = await fetch(`/api/barbers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao excluir barbeiro.");
      }

      setBarbeiros((listaAtual) =>
        listaAtual.filter((barbeiro) => barbeiro.id !== id),
      );

      if (editandoId === id) {
        limparFormulario();
      }
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao excluir barbeiro.",
      );
    }
  }

  function resumirHorarios(barbeiro: Barbeiro) {
    if (barbeiro.horariosDisponiveis.length === 0) {
      return "Nenhum horário selecionado";
    }

    return diasDaSemana
      .map((dia) => {
        const horariosDoDia = barbeiro.horariosDisponiveis
          .filter((horario) => horario.dayOfWeek === dia.dayOfWeek)
          .map((horario) => formatarHorario(horario.startTimeMinutes));

        if (horariosDoDia.length === 0) {
          return "";
        }

        return `${dia.shortLabel}: ${horariosDoDia.join(", ")}`;
      })
      .filter(Boolean)
      .join(" | ");
  }

  return (
    <main className="min-h-screen bg-[#222220] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section>
          <span className="text-xs font-black uppercase tracking-wide text-[#b9ff62]">
            Área administrativa
          </span>
          <h1 className="mt-2 text-2xl font-black uppercase">
            Barbeiros da barbearia
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Cadastre, edite e desative barbeiros e seus horários disponíveis.
          </p>
        </section>

        {erro && (
          <div className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {erro}
          </div>
        )}

        {carregando && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-md bg-[#111111]"
              />
            ))}
          </div>
        )}

        {!carregando && barbeiros.length === 0 && (
          <section className="rounded-md border border-white/10 bg-[#171717] p-6 text-sm text-white/70">
            Nenhum barbeiro cadastrado. Use o formulário abaixo para criar o
            primeiro.
          </section>
        )}

        {!carregando && barbeiros.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {barbeiros.map((barbeiro) => (
              <article
                key={barbeiro.id}
                className={`flex min-h-44 flex-col justify-between rounded-md p-5 shadow-sm transition hover:-translate-y-0.5 ${
                  editandoId === barbeiro.id
                    ? "bg-[#b9ff62] text-black"
                    : "bg-[#111111] text-white hover:bg-[#171717]"
                }`}>
                <div>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        editandoId === barbeiro.id
                          ? "border-black"
                          : "border-[#59677f]"
                      }`}>
                      {editandoId === barbeiro.id && (
                        <span className="text-xs font-black">v</span>
                      )}
                    </span>

                    <span
                      className={`rounded px-2 py-1 text-[10px] font-black ${
                        editandoId === barbeiro.id
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}>
                      {barbeiro.horariosDisponiveis.length} horários
                    </span>
                  </div>

                  <h2 className="text-xs font-black uppercase leading-snug">
                    {barbeiro.nome}
                  </h2>
                  <p
                    className={`mt-2 text-xs ${
                      editandoId === barbeiro.id
                        ? "text-black/70"
                        : "text-white/55"
                    }`}>
                    {barbeiro.telefone}
                  </p>
                  <p
                    className={`mt-5 line-clamp-3 text-xs ${
                      editandoId === barbeiro.id
                        ? "text-black/70"
                        : "text-white/55"
                    }`}>
                    {resumirHorarios(barbeiro)}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => editarBarbeiro(barbeiro)}
                    className={`rounded px-3 py-2 text-xs font-black ${
                      editandoId === barbeiro.id
                        ? "bg-black text-white"
                        : "bg-[#b9ff62] text-black"
                    }`}>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirBarbeiro(barbeiro.id)}
                    className={`rounded border px-3 py-2 text-xs font-black ${
                      editandoId === barbeiro.id
                        ? "border-black text-black"
                        : "border-red-400/60 text-red-200"
                    }`}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="rounded-md border border-white/10 bg-[#171717] p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase">
                Gerenciar barbeiros
              </h2>
              <p className="text-xs text-white/55">
                Use este formulário para manter os barbeiros e horários da
                barbearia.
              </p>
            </div>
          </div>

          <form onSubmit={salvarBarbeiro} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="nome" className="text-xs font-bold uppercase">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm outline-none focus:border-[#b9ff62]"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="telefone"
                  className="text-xs font-bold uppercase">
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  className="rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm outline-none focus:border-[#b9ff62]"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase">
                  Horários disponíveis
                </h3>
                <p className="text-xs text-white/55">
                  Selecione os horários de segunda a sábado, entre 09:00 e
                  19:45.
                </p>
              </div>

              <div className="overflow-x-auto rounded-md border border-white/10">
                <div className="min-w-220">
                  <div className="grid grid-cols-[92px_repeat(6,minmax(0,1fr))] border-b border-white/10 bg-[#101010]">
                    <div className="px-3 py-3 text-xs font-black uppercase text-white/60">
                      Horário
                    </div>
                    {diasDaSemana.map((dia) => (
                      <div
                        key={dia.dayOfWeek}
                        className="px-3 py-3 text-center text-xs font-black uppercase text-white">
                        {dia.label}
                      </div>
                    ))}
                  </div>

                  {horarios.map((horario) => (
                    <div
                      key={horario}
                      className="grid grid-cols-[92px_repeat(6,minmax(0,1fr))] border-b border-white/10 last:border-b-0">
                      <div className="px-3 py-2 text-xs font-black text-white/70">
                        {formatarHorario(horario)}
                      </div>
                      {diasDaSemana.map((dia) => {
                        const chave = criarChaveHorario(dia.dayOfWeek, horario);
                        const selecionado = horariosSelecionadosSet.has(chave);

                        return (
                          <button
                            key={chave}
                            type="button"
                            aria-pressed={selecionado}
                            onClick={() =>
                              alternarHorario(dia.dayOfWeek, horario)
                            }
                            className={`m-1 rounded px-2 py-2 text-xs font-black transition ${
                              selecionado
                                ? "bg-[#b9ff62] text-black"
                                : "bg-[#101010] text-white/45 hover:bg-white/10 hover:text-white"
                            }`}>
                            {selecionado ? "Disponível" : "Livre"}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-md bg-[#b9ff62] px-5 py-3 text-sm font-black text-black disabled:opacity-60">
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alteração"
                    : "Cadastrar"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
