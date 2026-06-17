"use client";
import { useState } from "react";
import { CardServico } from "@/components/CardServico";
import { useRouter } from "next/navigation";

// Interface para evitar erros do TypeScript/ESLint
export interface ServicoLimpo {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export default function ServicosClient({ servicosBanco }: { servicosBanco: ServicoLimpo[] }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const router = useRouter();

  // Função para adicionar ou remover do carrinho
  const toggleSelecao = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const irParaProximaEtapa = () => {
    router.push(`/servicos/horario?ids=${selecionados.join(",")}`);
  };

  const voltarEtapa = () => {
    router.back();
  };

  // Cálculos do Carrinho
  const servicosEscolhidos = servicosBanco.filter(s => selecionados.includes(s.id));
  const valorTotal = servicosEscolhidos.reduce((acc, s) => acc + s.price, 0);
  const tempoTotal = servicosEscolhidos.reduce((acc, s) => acc + s.durationMinutes, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    // pb-96 garante que os cards do final não fiquem escondidos atrás do carrinho gigante
    <main className="min-h-screen bg-[#121214] py-12 px-6 font-sans pb-96 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Escolha seus serviços</h1>
          <p className="text-zinc-400">Etapa 1 de 5</p>
        </div>

        {!servicosBanco || servicosBanco.length === 0 ? (
          <p className="text-center text-zinc-500 mt-10">
            Nenhum serviço disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {servicosBanco.map((s: ServicoLimpo) => (
              <div key={s.id} className="relative group">
                {/* O card normal que seleciona */}
                <div onClick={() => toggleSelecao(s.id)} className="cursor-pointer">
                  <CardServico 
                    name={s.name} 
                    price={s.price} 
                    durationMinutes={s.durationMinutes} 
                    isSelected={selecionados.includes(s.id)} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- CAIXA DE RESUMO DO SERVIÇO --- */}
        {selecionados.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-[#121214] border-t border-zinc-800 p-6 z-40">
            <div className="max-w-5xl mx-auto flex flex-col gap-4">
              
              {/* 1. CAIXA DO RESUMO */}
              <div className="bg-[#1a1a1e] border border-zinc-800 rounded-xl p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <svg className="w-5 h-5 text-[#bdff31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Resumo do serviço
                  </div>
                  <span className="text-zinc-400 text-sm">{selecionados.length} {selecionados.length === 1 ? 'item' : 'itens'}</span>
                </div>

                <div className="flex flex-col gap-2 mb-6 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {servicosEscolhidos.map(servico => (
                    <div key={servico.id} className="flex justify-between items-center bg-[#121214] border border-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#bdff31]"></div>
                        <span className="text-white text-sm uppercase font-medium">{servico.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white text-sm font-medium">{formatarMoeda(servico.price)}</span>
                        <button onClick={(e) => { e.stopPropagation(); toggleSelecao(servico.id); }} className="text-zinc-500 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-zinc-800 mb-4"></div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-xs mb-1">Tempo Total Estimado</span>
                    <span className="text-white font-semibold">{tempoTotal} min</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-zinc-400 text-xs mb-1">Valor Total</span>
                    <span className="text-[#bdff31] font-bold text-xl">{formatarMoeda(valorTotal)}</span>
                  </div>
                </div>
              </div>

              {/* 2. BOTÕES DE NAVEGAÇÃO */}
              <div className="flex justify-between items-center">
                <button onClick={voltarEtapa} className="px-6 py-2 rounded-lg border border-zinc-700 text-zinc-300 bg-[#1a1a1e] hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm font-medium">
                  ← Anterior
                </button>
                <button onClick={irParaProximaEtapa} className="px-6 py-2 rounded-lg bg-[#bdff31] hover:bg-[#a5e028] text-black transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-[#bdff31]/10">
                  Próximo →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}