"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

type Invite = {
  id: string;
  codeHint: string;
  role: "BARBER" | "ADMIN";
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  usedBy: { name: string; email: string } | null;
  createdBy: { name: string };
};

function inviteStatus(invite: Invite) {
  if (invite.usedAt) return { label: "Utilizado", className: "bg-blue-400/10 text-blue-200" };
  if (invite.revokedAt) return { label: "Revogado", className: "bg-red-400/10 text-red-200" };
  if (new Date(invite.expiresAt) <= new Date()) return { label: "Expirado", className: "bg-amber-400/10 text-amber-200" };
  return { label: "Disponível", className: "bg-[#b9ff62]/10 text-[#b9ff62]" };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function InviteManager({ initialInvites }: { initialInvites: Invite[] }) {
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [role, setRole] = useState<"BARBER" | "ADMIN">("BARBER");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [generatedCode, setGeneratedCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadInvites() {
    try {
      const response = await fetch("/api/admin/invites");
      const data = await response.json() as { invites?: Invite[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Erro ao carregar convites.");
      setInvites(data.invites ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao carregar convites.");
    }
  }

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGeneratedCode("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, expiresInDays: Number(expiresInDays) }),
      });
      const data = await response.json() as { code?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Erro ao gerar convite.");
      setGeneratedCode(data.code ?? "");
      setCopied(false);
      await loadInvites();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao gerar convite.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
  }

  async function revokeInvite(id: string) {
    if (!window.confirm("Revogar este convite? Ele não poderá mais ser utilizado.")) return;
    setError("");
    const response = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Erro ao revogar convite.");
      return;
    }
    await loadInvites();
  }

  return (
    <main className="min-h-screen bg-[#222220] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wide text-[#b9ff62]">Área administrativa</span>
            <h1 className="mt-2 text-2xl font-black uppercase">Convites de acesso</h1>
            <p className="mt-1 text-sm text-white/55">Gere códigos individuais e acompanhe sua utilização.</p>
          </div>
          <nav className="flex gap-2 text-xs font-black uppercase">
            <Link href="/servicos" className="rounded-md border border-white/10 px-4 py-2.5 text-white/60 hover:border-white/20 hover:text-white">Serviços</Link>
            <Link href="/barbeiros" className="rounded-md border border-white/10 px-4 py-2.5 text-white/60 hover:border-white/20 hover:text-white">Barbeiros</Link>
          </nav>
        </header>

        {error && <div role="alert" className="rounded-md border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</div>}

        <section className="rounded-md border border-white/10 bg-[#171717] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-black uppercase">Gerar novo convite</h2>
            <p className="mt-1 text-xs text-white/45">O código completo aparece uma única vez. Envie-o apenas para a pessoa convidada.</p>
          </div>
          <form onSubmit={createInvite} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <label htmlFor="invite-role" className="text-xs font-bold uppercase">Perfil</label>
              <select id="invite-role" value={role} onChange={(event) => setRole(event.target.value as "BARBER" | "ADMIN")} className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]">
                <option value="BARBER">Profissional</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="invite-validity" className="text-xs font-bold uppercase">Validade</label>
              <select id="invite-validity" value={expiresInDays} onChange={(event) => setExpiresInDays(event.target.value)} className="h-11 rounded-md border border-white/10 bg-[#101010] px-3 text-sm outline-none focus:border-[#b9ff62]">
                <option value="1">1 dia</option><option value="3">3 dias</option><option value="7">7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option>
              </select>
            </div>
            <button disabled={submitting} className="h-11 rounded-md bg-[#b9ff62] px-5 text-sm font-black text-black disabled:opacity-60">{submitting ? "Gerando..." : "Gerar convite"}</button>
          </form>

          {generatedCode && (
            <div className="mt-5 rounded-lg border border-[#b9ff62]/30 bg-[#b9ff62]/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#b9ff62]">Código gerado — copie agora</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="flex-1 rounded-md bg-black/30 px-4 py-3 text-center text-lg font-black tracking-[0.12em] text-white">{generatedCode}</code>
                <button type="button" onClick={copyCode} className="h-11 rounded-md border border-[#b9ff62]/30 px-5 text-xs font-black text-[#b9ff62]">{copied ? "Copiado!" : "Copiar código"}</button>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-md border border-white/10 bg-[#171717]">
          <div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-black uppercase">Histórico de convites</h2></div>
          {invites.length === 0 ? (
            <div className="p-5 text-sm text-white/45">Nenhum convite gerado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left text-xs">
                <thead className="bg-[#101010] text-[10px] uppercase tracking-wider text-white/40"><tr><th className="px-5 py-3">Código</th><th className="px-5 py-3">Perfil</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Validade</th><th className="px-5 py-3">Utilizado por</th><th className="px-5 py-3 text-right">Ação</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {invites.map((invite) => {
                    const status = inviteStatus(invite);
                    const canRevoke = status.label === "Disponível";
                    return <tr key={invite.id} className="text-white/65"><td className="px-5 py-4 font-mono font-bold text-white">{invite.codeHint}</td><td className="px-5 py-4">{invite.role === "BARBER" ? "Profissional" : "Administrador"}</td><td className="px-5 py-4"><span className={`rounded px-2 py-1 text-[10px] font-black uppercase ${status.className}`}>{status.label}</span></td><td className="px-5 py-4">{formatDate(invite.expiresAt)}</td><td className="px-5 py-4">{invite.usedBy ? <><span className="block text-white">{invite.usedBy.name}</span><span className="text-[10px] text-white/35">{invite.usedBy.email}</span></> : "—"}</td><td className="px-5 py-4 text-right">{canRevoke && <button type="button" onClick={() => revokeInvite(invite.id)} className="font-black text-red-200 hover:underline">Revogar</button>}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
