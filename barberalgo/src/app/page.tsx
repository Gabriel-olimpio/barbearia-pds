/** @format */

"use client";

import { useRef, useState } from "react";

export default function HomeEmConstrucao() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Controla o estado do som (tocando ou pausado)
  const [isPlaying, setIsPlaying] = useState(false);

  const alternarSom = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Se já estiver tocando, pausa o áudio
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Se estiver pausado, toca o áudio
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log("O navegador bloqueou o áudio inicial:", error);
        });
    }
  };

  return (
    <div className="relative flex h-screen w-screen select-none items-center justify-center overflow-hidden bg-gray-900 text-white">
      {/* Arquivo de áudio na pasta public/ */}
      <audio ref={audioRef} src="/som-construcao.mp3" loop />

      {/* Container Principal */}
      <div className="z-10 max-w-md px-4 text-center">
        {/* Ícone Animado (pula apenas se o som estiver tocando) */}
        <div
          className={`mb-6 text-6xl transition-transform ${isPlaying ? "animate-bounce" : ""}`}>
          🚧
        </div>

        {/* Título */}
        <h1 className="mb-4 text-4xl font-black tracking-tight  text-[#b9ff62] uppercase md:text-5xl">
          Em Construção
        </h1>

        {/* Texto descritivo */}
        <p className="mb-8 text-base text-gray-400">
          Estamos construindo algo incrível.
        </p>

        {/* Botão de Alternância (Play/Pause) */}
        <button
          onClick={alternarSom}
          className={`w-full rounded-full py-3 px-6 text-sm font-bold uppercase tracking-wider shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
            ${
              isPlaying
                ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/20"
                : "bg-[#b9ff62] text-gray-900 hover:bg-green-400 hover:shadow-yellow-500/20"
            }`}>
          {isPlaying ? "Sair da Obra 😔🚶" : "Entrar na Obra 🔨"}
        </button>
      </div>

      {/* Faixa decorativa no rodapé */}
      <div
        className="absolute bottom-0 left-0 h-4 w-full bg-[#b9ff62]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
