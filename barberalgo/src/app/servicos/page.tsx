/** @format */

"use client";

import { type SyntheticEvent, useEffect, useState } from "react";

type Servico = {
  id: string;
  nome: string;
  preco: string;
  duracao: string;
  descricao: string;
};

type ServiceResponse = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  description: string | null;
};

const duracoes = ["15", "30", "45", "60"];

function mapService(service: ServiceResponse): Servico {
  return {
    id: service.id,
    nome: service.name,
    preco: service.price,
    duracao: String(service.durationMinutes),
    descricao: service.description ?? "",
  };
}

export default function Servicos() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarServicos() {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Erro ao carregar serviços.");
        }

        setServicos(data.services.map(mapService));
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar serviços.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarServicos();
  }, []);

  function limparFormulario() {
    setNome("");
    setPreco("");
    setDuracao("");
    setDescricao("");
    setEditandoId(null);
  }

  function validarFormulario() {
    if (!nome.trim() || !preco || !duracao) {
      return "Nome, preço e duração são obrigatórios.";
    }

    if (Number(preco) <= 0) {
      return "Preço deve ser maior que zero.";
    }

    if (Number(duracao) <= 0) {
      return "Duração deve ser maior que zero.";
    }

    const servicoDuplicado = servicos.some(
      (servico) =>
        servico.id !== editandoId &&
        servico.nome.toLowerCase().trim() === nome.toLowerCase().trim(),
    );

    if (servicoDuplicado) {
      return "Já existe um serviço com esse nome.";
    }

    return "";
  }

  async function salvarServico(event: SyntheticEvent<HTMLFormElement>) {
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
      price: preco,
      durationMinutes: Number(duracao),
      description: descricao.trim() || null,
    };

    try {
      const url = editandoId ? `/api/services/${editandoId}` : "/api/services";
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
        throw new Error(data.error ?? "Erro ao salvar serviço.");
      }

      const servicoSalvo = mapService(data.service);

      setServicos((listaAtual) =>
        editandoId
          ? listaAtual.map((servico) =>
              servico.id === editandoId ? servicoSalvo : servico,
            )
          : [servicoSalvo, ...listaAtual],
      );

      limparFormulario();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar serviço.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarServico(servico: Servico) {
    setNome(servico.nome);
    setPreco(servico.preco);
    setDuracao(servico.duracao);
    setDescricao(servico.descricao);
    setEditandoId(servico.id);
    setErro("");
  }

  async function excluirServico(id: string) {
    const deveExcluir = window.confirm("Deseja excluir este serviço?");

    if (!deveExcluir) {
      return;
    }

    setErro("");

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao excluir serviço.");
      }

      setServicos((listaAtual) =>
        listaAtual.filter((servico) => servico.id !== id),
      );

      if (editandoId === id) {
        limparFormulario();
      }
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao excluir serviço.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#222220] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section>
          <span className="text-xs font-black uppercase tracking-wide text-[#b9ff62]">
            Área administrativa
          </span>
          <h1 className="mt-2 text-2xl font-black uppercase">
            Serviços da barbearia
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Cadastre, edite e remova os serviços que aparecem para os clientes.
          </p>
        </section>

        {erro && (
          <div className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {erro}
          </div>
        )}

        {carregando && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-md bg-[#111111]"
              />
            ))}
          </div>
        )}

        {!carregando && servicos.length === 0 && (
          <section className="rounded-md border border-white/10 bg-[#171717] p-6 text-sm text-white/70">
            Nenhum serviço cadastrado. Use o formulário abaixo para criar o
            primeiro.
          </section>
        )}

        {!carregando && servicos.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicos.map((servico) => (
              <article
                key={servico.id}
                className={`flex min-h-44 flex-col justify-between rounded-md p-5 shadow-sm transition hover:-translate-y-0.5 ${
                  editandoId === servico.id
                    ? "bg-[#b9ff62] text-black"
                    : "bg-[#111111] text-white hover:bg-[#171717]"
                }`}>
                <div>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        editandoId === servico.id
                          ? "border-black"
                          : "border-[#59677f]"
                      }`}>
                      {editandoId === servico.id && (
                        <span className="text-xs font-black">v</span>
                      )}
                    </span>

                    <span
                      className={`rounded px-2 py-1 text-[10px] font-black ${
                        editandoId === servico.id
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}>
                      {servico.duracao} min
                    </span>
                  </div>

                  <h2 className="text-xs font-black uppercase leading-snug">
                    {servico.nome}
                  </h2>

                  {servico.descricao && (
                    <p
                      className={`mt-5 line-clamp-2 text-xs ${
                        editandoId === servico.id
                          ? "text-black/70"
                          : "text-white/55"
                      }`}>
                      {servico.descricao}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mt-5 text-xl font-black">
                    R$ {Number(servico.preco).toFixed(2).replace(".", ",")}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => editarServico(servico)}
                      className={`rounded px-3 py-2 text-xs font-black ${
                        editandoId === servico.id
                          ? "bg-black text-white"
                          : "bg-[#b9ff62] text-black"
                      }`}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirServico(servico.id)}
                      className={`rounded border px-3 py-2 text-xs font-black ${
                        editandoId === servico.id
                          ? "border-black text-black"
                          : "border-red-400/60 text-red-200"
                      }`}>
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="rounded-md border border-white/10 bg-[#171717] p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase">
                Gerenciar serviços
              </h2>
              <p className="text-xs text-white/55">
                Use este formulário para manter o catálogo da barbearia.
              </p>
            </div>
          </div>

          <form onSubmit={salvarServico} className="grid gap-4 lg:grid-cols-4">
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
              <label htmlFor="preco" className="text-xs font-bold uppercase">
                Preço
              </label>
              <input
                id="preco"
                type="number"
                min="0.01"
                step="0.01"
                value={preco}
                onChange={(event) => setPreco(event.target.value)}
                className="rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm outline-none focus:border-[#b9ff62]"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="duracao" className="text-xs font-bold uppercase">
                Duração
              </label>
              <select
                id="duracao"
                value={duracao}
                onChange={(event) => setDuracao(event.target.value)}
                className="rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm outline-none focus:border-[#b9ff62]">
                <option value="">Selecione</option>
                {duracoes.map((duracaoOpcao) => (
                  <option key={duracaoOpcao} value={duracaoOpcao}>
                    {duracaoOpcao} minutos
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="descricao"
                className="text-xs font-bold uppercase">
                Descrição
              </label>
              <input
                id="descricao"
                type="text"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                className="rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm outline-none focus:border-[#b9ff62]"
              />
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-4">
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
