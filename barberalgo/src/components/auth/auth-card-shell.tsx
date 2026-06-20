import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthCardShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#222220] px-5 py-10 text-white">
      <div className="absolute -left-32 top-1/4 size-96 rounded-full bg-[#b9ff62]/5 blur-3xl" />
      <div className="absolute -right-40 bottom-0 size-96 rounded-full bg-[#b9ff62]/[0.035] blur-3xl" />
      <section className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#171716] p-6 shadow-2xl sm:p-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-[#b9ff62] text-sm font-black text-black">BA</span>
          <span className="text-base font-black uppercase tracking-[-0.04em]">
            Barber<span className="text-[#b9ff62]">Algo</span>
          </span>
        </Link>
        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#b9ff62]">{eyebrow}</span>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
