"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import AuthCardShell from "./auth-card-shell";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [developmentResetUrl, setDevelopmentResetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevelopmentResetUrl("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as {
        error?: string;
        message?: string;
        developmentResetUrl?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Não foi possível continuar.");
      setMessage(data.message ?? "Verifique seu e-mail.");
      setDevelopmentResetUrl(data.developmentResetUrl ?? "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível continuar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCardShell
      eyebrow="Recuperação segura"
      title="Esqueceu a senha?"
      description="Informe o e-mail cadastrado. O link enviado será válido por 30 minutos e poderá ser usado apenas uma vez."
    >
      {message ? (
        <div className="grid gap-4">
          <div role="status" className="rounded-lg border border-[#b9ff62]/25 bg-[#b9ff62]/5 p-4 text-sm leading-6 text-white/70">
            {message}
          </div>
          {developmentResetUrl && (
            <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">Ambiente de desenvolvimento</p>
              <p className="mt-1 text-xs leading-5 text-white/50">O envio de e-mail não está configurado. Use o link abaixo para testar o fluxo:</p>
              <Link href={developmentResetUrl} className="mt-3 inline-block text-xs font-black text-[#b9ff62] hover:underline">Redefinir minha senha</Link>
            </div>
          )}
          <button type="button" onClick={() => setMessage("")} className="h-11 rounded-lg border border-white/10 text-xs font-black uppercase text-white/65 hover:border-white/20">Tentar outro e-mail</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && <div role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 px-4 py-3 text-xs text-red-100">{error}</div>}
          <div className="grid gap-2">
            <label htmlFor="recovery-email" className="text-[11px] font-black uppercase tracking-[0.11em] text-white/70">E-mail</label>
            <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="h-12 rounded-lg border border-white/10 bg-[#111110] px-4 text-sm outline-none placeholder:text-white/25 focus:border-[#b9ff62]" />
          </div>
          <button disabled={submitting} className="h-12 rounded-lg bg-[#b9ff62] text-sm font-black uppercase tracking-wider text-black disabled:opacity-60">{submitting ? "Enviando..." : "Enviar link de recuperação"}</button>
        </form>
      )}
      <Link href="/login" className="mt-6 block text-center text-xs font-black text-[#b9ff62] hover:underline">Voltar para o login</Link>
    </AuthCardShell>
  );
}
