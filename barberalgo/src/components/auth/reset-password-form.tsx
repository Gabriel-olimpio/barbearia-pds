"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import AuthCardShell from "./auth-card-shell";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível redefinir a senha.");
      setSuccess(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível redefinir a senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCardShell eyebrow="Nova credencial" title="Redefinir senha" description="Crie uma senha segura com pelo menos 8 caracteres. Todas as sessões anteriores serão encerradas.">
      {success ? (
        <div className="grid gap-4">
          <div role="status" className="rounded-lg border border-[#b9ff62]/25 bg-[#b9ff62]/5 p-4 text-sm leading-6 text-white/70">Senha redefinida com sucesso.</div>
          <Link href="/login" className="grid h-12 place-items-center rounded-lg bg-[#b9ff62] text-sm font-black uppercase text-black">Entrar com a nova senha</Link>
        </div>
      ) : !token ? (
        <div className="grid gap-4">
          <div role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 p-4 text-sm text-red-100">O link de recuperação está incompleto ou é inválido.</div>
          <Link href="/recuperar-senha" className="text-center text-xs font-black text-[#b9ff62] hover:underline">Solicitar outro link</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && <div role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 px-4 py-3 text-xs text-red-100">{error}</div>}
          <div className="grid gap-2">
            <label htmlFor="new-password" className="text-[11px] font-black uppercase tracking-[0.11em] text-white/70">Nova senha</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" className="h-12 rounded-lg border border-white/10 bg-[#111110] px-4 text-sm outline-none placeholder:text-white/25 focus:border-[#b9ff62]" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="confirm-new-password" className="text-[11px] font-black uppercase tracking-[0.11em] text-white/70">Confirmar nova senha</label>
            <input id="confirm-new-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repita a nova senha" className="h-12 rounded-lg border border-white/10 bg-[#111110] px-4 text-sm outline-none placeholder:text-white/25 focus:border-[#b9ff62]" />
          </div>
          <button disabled={submitting} className="h-12 rounded-lg bg-[#b9ff62] text-sm font-black uppercase tracking-wider text-black disabled:opacity-60">{submitting ? "Salvando..." : "Salvar nova senha"}</button>
        </form>
      )}
    </AuthCardShell>
  );
}
