"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
};

type ConfiguracoesClientProps = {
  initialUser: UserProfile;
};

export default function ConfiguracoesClient({
  initialUser,
}: ConfiguracoesClientProps) {
  const router = useRouter();

  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileError(data.error || "Erro ao atualizar perfil.");
        return;
      }

      setUser((currentUser) => ({
        ...currentUser,
        name: data.user.name,
      }));

      setProfileMessage("Perfil atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setProfileError("Erro ao atualizar perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleResetPassword() {
    router.push("/recuperar-senha");
  }

  return (
    <section className="min-h-screen bg-[#101010] px-8 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b4ff39]">
            Configurações
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Minha conta
          </h1>

          <p className="mt-2 text-zinc-400">
            Visualize seus dados, altere seu nome de usuário e acesse a
            redefinição de senha.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <aside className="rounded-xl border border-zinc-800 bg-[#151815] p-6 shadow-lg shadow-black/30">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b4ff39] text-black">
                <UserRound size={30} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-white">
                  {user.name}
                </h2>

                <p className="truncate text-sm text-zinc-400">{user.email}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-[#111311] p-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[#b4ff39]" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-zinc-500">
                      E-mail usado
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-[#111311] p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#b4ff39]" />

                  <div>
                    <p className="text-xs font-bold uppercase text-zinc-500">
                      Perfil
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {user.roleLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-[#111311] p-4">
                <p className="text-xs font-bold uppercase text-zinc-500">
                  ID da conta
                </p>

                <p className="mt-1 break-all text-xs text-zinc-400">
                  {user.id}
                </p>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            <form
              onSubmit={handleUpdateProfile}
              className="rounded-xl border border-zinc-800 bg-[#151815] p-6 shadow-lg shadow-black/30"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  Dados do perfil
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Atualize o nome exibido na sua conta.
                </p>
              </div>

              {profileMessage && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#b4ff39]/40 bg-[#b4ff39]/10 px-4 py-3 text-sm text-[#d8ff9d]">
                  <CheckCircle2 size={18} />
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="mb-5 rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {profileError}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-zinc-300"
                >
                  Nome de usuário
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-[#111311] px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#b4ff39]"
                  placeholder="Digite seu nome"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex h-11 items-center gap-2 rounded-lg bg-[#b4ff39] px-5 text-sm font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {savingProfile ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>

            <section className="rounded-xl border border-zinc-800 bg-[#151815] p-6 shadow-lg shadow-black/30">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white">
                  Segurança da conta
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Para trocar sua senha, use o fluxo de recuperação já
                  existente no sistema.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-[#111311] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b4ff39] text-black">
                      <KeyRound size={20} />
                    </div>

                    <div>
                      <h3 className="font-black text-white">
                        Redefinir senha
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        Você será direcionado para a tela de recuperação de
                        senha.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#b4ff39]/60 px-5 text-sm font-black text-[#d8ff9d] transition hover:bg-[#b4ff39] hover:text-black"
                  >
                    <KeyRound size={17} />
                    Redefinir senha
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}