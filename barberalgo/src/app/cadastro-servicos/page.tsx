/** @format */

"use client";

import { useState } from "react";

type Servico = {
  nome: string;
  preco: string;
  duracao: string;
  descricao: string;
};

export default function ServicosPage() {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");

  const [servicos, setServicos] = useState<Servico[]>([]);

  const [editando, setEditando] = useState(false);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  function cadastrarServico() {
    if (!nome || !preco || !duracao) {
      alert("Nome, preço e duração são obrigatórios!");
      return;
    }

    if (Number(preco) <= 0) {
      alert("Preço deve ser maior que zero!");
      return;
    }

    if (Number(duracao) <= 0) {
      alert("Duração deve ser maior que zero!");
      return;
    }

    const servicoExiste = servicos.some(
      (servico) =>
        servico.nome.toLowerCase().trim() === nome.toLowerCase().trim(),
    );

    if (servicoExiste) {
      alert("Já existe um serviço com esse nome!");
      return;
    }

    const novoServico = {
      nome,
      preco,
      duracao,
      descricao,
    };

    setServicos([...servicos, novoServico]);

    setNome("");
    setPreco("");
    setDuracao("");
    setDescricao("");
  }

  function excluirServico(index: number) {
    const novaLista = servicos.filter((_, i) => i !== index);

    setServicos(novaLista);
  }

  function editarServico(index: number) {
    const servico = servicos[index];

    setNome(servico.nome);
    setPreco(servico.preco);
    setDuracao(servico.duracao);
    setDescricao(servico.descricao);

    setEditando(true);
    setIndiceEditando(index);
  }

  function salvarEdicao() {
    if (!nome.trim() || !preco || !duracao) {
      alert("Nome, preço e duração são obrigatórios!");
      return;
    }

    if (Number(preco) <= 0) {
      alert("Preço deve ser maior que zero!");
      return;
    }

    if (Number(duracao) <= 0) {
      alert("Duração deve ser maior que zero!");
      return;
    }

    if (indiceEditando === null) return;

    const servicoDuplicado = servicos.some(
      (servico, index) =>
        index !== indiceEditando &&
        servico.nome.toLowerCase().trim() === nome.toLowerCase().trim(),
    );

    if (servicoDuplicado) {
      alert("Já existe um serviço com esse nome!");
      return;
    }

    const novaLista = [...servicos];

    novaLista[indiceEditando] = {
      nome,
      preco,
      duracao,
      descricao,
    };

    setServicos(novaLista);

    setNome("");
    setPreco("");
    setDuracao("");
    setDescricao("");

    setEditando(false);
    setIndiceEditando(null);
  }

  function cancelarEdicao() {
    setNome("");
    setPreco("");
    setDuracao("");
    setDescricao("");

    setEditando(false);
    setIndiceEditando(null);
  }

  return (
    <div>
      <h1>Cadastro de Serviços</h1>

      <div>
        <label>Nome</label>
        <br />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Preço</label>
        <br />
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Duração (minutos)</label>
        <br />
        <input
          type="number"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Descrição</label>
        <br />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <br />

      <button onClick={editando ? salvarEdicao : cadastrarServico}>
        {editando ? "Salvar Alteração/" : "Cadastrar"}
      </button>

      {editando && <button onClick={cancelarEdicao}>Cancelar</button>}

      <hr />

      <h2>Pré-visualização</h2>

      <p>Nome: {nome}</p>
      <p>Preço: {preco}</p>
      <p>Duração: {duracao}</p>
      <p>Descrição: {descricao}</p>

      <hr />

      <h2>Serviços cadastrados</h2>

      {servicos.map((servico, index) => (
        <div key={index}>
          <p>
            {servico.nome} - R$ {servico.preco}
          </p>

          <button onClick={() => editarServico(index)}>Editar</button>

          <br />

          <button onClick={() => excluirServico(index)}>Excluir</button>

          <br />
          <br />
        </div>
      ))}
    </div>
  );
}
