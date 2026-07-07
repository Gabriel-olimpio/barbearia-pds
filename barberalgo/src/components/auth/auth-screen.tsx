/** @format */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

type AuthMode = "login" | "register";
type Role = "CLIENT" | "BARBER" | "ADMIN";

type AuthScreenProps = {
  initialMode: AuthMode;
};

const roles: {
  value: Role;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: "CLIENT",
    title: "Cliente",
    description: "Agende e acompanhe seus horários",
    icon: <UserIcon />,
  },
  {
    value: "BARBER",
    title: "Profissional",
    description: "Organize sua agenda de atendimento",
    icon: <ScissorsIcon />,
  },
  {
    value: "ADMIN",
    title: "Administrador",
    description: "Gerencie toda a barbearia",
    icon: <ShieldIcon />,
  },
];

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20c.8-3.5 3.3-5.2 7.5-5.2s6.7 1.7 7.5 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <circle cx="6" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.6 8.5 10.9 7M8.6 15.5 19.5 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path
        d="M12 3 5 6v5.2c0 4.5 2.8 7.9 7 9.8 4.2-1.9 7-5.3 7-9.8V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path
        d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      {closed && (
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3" aria-label="BarberAlgo">
      <span className="grid size-10 place-items-center rounded-lg bg-[#b9ff62] text-black shadow-[0_0_32px_rgba(185,255,98,0.16)]">
        <ScissorsIcon />
      </span>
      <span className="text-lg font-black uppercase tracking-[-0.04em]">
        Barber<span className="text-[#b9ff62]">Algo</span>
      </span>
    </div>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AuthScreen({ initialMode }: AuthScreenProps) {
  const router = useRouter();
  const isRegister = initialMode === "register";
  const [role, setRole] = useState<Role>("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    if (isRegister && !acceptedTerms) {
      setError("Você precisa aceitar os termos de uso para continuar.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        isRegister ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister
              ? { name, email, phone, password, role, specialty, accessCode }
              : { email, password, rememberMe },
          ),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível continuar.");
      }

      router.push(data.redirectTo ?? "/agendamentos");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível continuar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClassName =
    "h-12 w-full rounded-lg border border-white/10 bg-[#111110] px-4 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-[#b9ff62] focus:ring-2 focus:ring-[#b9ff62]/10";
  const labelClassName =
    "text-[11px] font-black uppercase tracking-[0.11em] text-white/70";

  return (
    <main className="min-h-screen bg-[#222220] text-white selection:bg-[#b9ff62] selection:text-black">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden overflow-hidden border-r border-white/5 bg-[#111110] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -left-32 top-1/3 size-96 rounded-full bg-[#b9ff62]/[0.035] blur-3xl" />
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#b9ff62]/20 to-transparent" />
          <Brand />

          <div className="relative max-w-md">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9ff62]/20 bg-[#b9ff62]/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#b9ff62]">
              <span className="size-1.5 rounded-full bg-[#b9ff62]" />
              Gestão simples, atendimento melhor
            </span>
            <h1 className="text-5xl font-black uppercase leading-[0.96] tracking-[-0.055em] xl:text-6xl">
              Seu estilo.
              <br />
              Seu horário.
              <br />
              <span className="text-[#b9ff62]">Seu controle.</span>
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-6 text-white/48">
              Uma experiência direta para quem agenda, para quem atende e para
              quem faz a barbearia acontecer.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "Agendamentos em poucos passos",
                "Agenda profissional organizada",
                "Gestão completa em um só lugar",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-xs font-bold text-white/65">
                  <span className="grid size-5 place-items-center rounded-full bg-[#b9ff62] text-[10px] font-black text-black">
                    ✓
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
            © 2026 BarberAlgo · Todos os direitos reservados
          </p>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-2xl">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Brand />
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/45">
                Acesso seguro
              </span>
            </div>

            <div className="mb-7">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b9ff62]">
                {isRegister ? "Comece agora" : "Bem-vindo de volta"}
              </span>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] sm:text-4xl">
                {isRegister ? "Crie sua conta" : "Acesse sua conta"}
              </h2>
              <p className="mt-2 text-sm text-white/45">
                {isRegister
                  ? "Escolha seu perfil e preencha os dados para continuar."
                  : "Entre com seu e-mail e senha."}
              </p>
            </div>

            <div
              className="mb-7 grid grid-cols-2 rounded-lg bg-[#171716] p-1"
              role="tablist"
              aria-label="Acesso à conta">
              <Link
                href="/login"
                role="tab"
                aria-selected={!isRegister}
                className={`rounded-md px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider transition ${!isRegister ? "bg-[#b9ff62] text-black shadow-sm" : "text-white/40 hover:text-white"}`}>
                Entrar
              </Link>
              <Link
                href="/cadastro"
                role="tab"
                aria-selected={isRegister}
                className={`rounded-md px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider transition ${isRegister ? "bg-[#b9ff62] text-black shadow-sm" : "text-white/40 hover:text-white"}`}>
                Cadastrar
              </Link>
            </div>

            {isRegister && (
              <fieldset className="mb-6">
                <legend className={`${labelClassName} mb-3`}>
                  Como você vai usar o BarberAlgo?
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {roles.map((option) => {
                    const selected = role === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setRole(option.value);
                          setAccessCode("");
                          setError("");
                        }}
                        className={`rounded-lg border p-4 text-left transition ${selected ? "border-[#b9ff62] bg-[#b9ff62]/[0.07] shadow-[inset_0_0_0_1px_rgba(185,255,98,0.08)]" : "border-white/10 bg-[#171716] hover:border-white/20"}`}>
                        <span
                          className={`mb-3 grid size-9 place-items-center rounded-md ${selected ? "bg-[#b9ff62] text-black" : "bg-white/5 text-white/45"}`}>
                          {option.icon}
                        </span>
                        <span className="block text-xs font-black uppercase">
                          {option.title}
                        </span>
                        <span className="mt-1 block text-[10px] leading-4 text-white/38">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-950/30 px-4 py-3 text-xs leading-5 text-red-100">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-red-300/50 text-[9px] font-black">
                  !
                </span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              {isRegister && (
                <div className="grid gap-2">
                  <label htmlFor="name" className={labelClassName}>
                    Nome completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={3}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Como podemos chamar você?"
                    className={inputClassName}
                  />
                </div>
              )}

              <div
                className={`grid gap-4 ${isRegister ? "sm:grid-cols-2" : ""}`}>
                <div className="grid gap-2">
                  <label htmlFor="email" className={labelClassName}>
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@exemplo.com"
                    className={inputClassName}
                  />
                </div>
                {isRegister && (
                  <div className="grid gap-2">
                    <label htmlFor="phone" className={labelClassName}>
                      Telefone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) =>
                        setPhone(formatPhone(event.target.value))
                      }
                      placeholder="(00) 00000-0000"
                      className={inputClassName}
                    />
                  </div>
                )}
              </div>

              {isRegister && role === "BARBER" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="specialty" className={labelClassName}>
                      Especialidade
                    </label>
                    <input
                      id="specialty"
                      name="specialty"
                      required
                      value={specialty}
                      onChange={(event) => setSpecialty(event.target.value)}
                      placeholder="Ex.: Barba e degradê"
                      className={inputClassName}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="professional-code"
                      className={labelClassName}>
                      Código de convite
                    </label>
                    <input
                      id="professional-code"
                      name="accessCode"
                      required
                      value={accessCode}
                      onChange={(event) =>
                        setAccessCode(event.target.value.toUpperCase())
                      }
                      placeholder="BA-PRO-XXXX-XXXX"
                      className={inputClassName}
                    />
                  </div>
                </div>
              )}

              {isRegister && role === "ADMIN" && (
                <div className="grid gap-2">
                  <label htmlFor="admin-code" className={labelClassName}>
                    Código de convite{" "}
                    <span className="font-normal normal-case tracking-normal text-white/25">
                      (dispensado para o primeiro administrador)
                    </span>
                  </label>
                  <input
                    id="admin-code"
                    name="accessCode"
                    value={accessCode}
                    onChange={(event) =>
                      setAccessCode(event.target.value.toUpperCase())
                    }
                    placeholder="BA-ADM-XXXX-XXXX"
                    className={inputClassName}
                  />
                </div>
              )}

              <div
                className={`grid gap-4 ${isRegister ? "sm:grid-cols-2" : ""}`}>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className={labelClassName}>
                      Senha
                    </label>
                    {!isRegister && (
                      <Link
                        href="/recuperar-senha"
                        className="text-[10px] font-bold text-[#b9ff62] hover:underline">
                        Esqueci minha senha
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      required
                      minLength={isRegister ? 8 : undefined}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className={`${inputClassName} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/35 transition hover:text-[#b9ff62]">
                      <EyeIcon closed={showPassword} />
                    </button>
                  </div>
                </div>
                {isRegister && (
                  <div className="grid gap-2">
                    <label
                      htmlFor="confirm-password"
                      className={labelClassName}>
                      Confirmar senha
                    </label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Repita sua senha"
                      className={inputClassName}
                    />
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/45">
                <input
                  type="checkbox"
                  checked={isRegister ? acceptedTerms : rememberMe}
                  onChange={(event) =>
                    isRegister
                      ? setAcceptedTerms(event.target.checked)
                      : setRememberMe(event.target.checked)
                  }
                  className="mt-0.5 size-4 accent-[#b9ff62]"
                />
                <span>
                  {isRegister ? (
                    <>
                      Li e aceito os{" "}
                      <span className="font-bold text-white/70">
                        Termos de Uso
                      </span>{" "}
                      e a{" "}
                      <span className="font-bold text-white/70">
                        Política de Privacidade
                      </span>
                      .
                    </>
                  ) : (
                    "Manter minha sessão ativa neste dispositivo"
                  )}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#b9ff62] text-sm font-black uppercase tracking-wider text-black transition hover:bg-[#c6ff7e] hover:shadow-[0_10px_35px_rgba(185,255,98,0.12)] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting
                  ? "Processando..."
                  : isRegister
                    ? "Criar minha conta"
                    : "Entrar na plataforma"}
                {!submitting && (
                  <span className="transition-transform group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/35">
              {isRegister
                ? "Já possui uma conta?"
                : "Ainda não possui uma conta?"}{" "}
              <Link
                href={isRegister ? "/login" : "/cadastro"}
                className="font-black text-[#b9ff62] hover:underline">
                {isRegister ? "Entrar agora" : "Cadastre-se gratuitamente"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
