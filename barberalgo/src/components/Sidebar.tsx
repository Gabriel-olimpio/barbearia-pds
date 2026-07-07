"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Mail,
  Scissors,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Serviços",
    href: "/servicos",
    icon: Scissors,
  },
  {
    label: "Barbeiros",
    href: "/barbeiros",
    icon: UserRound,
  },
  {
    label: "Agendamentos",
    href: "/agendamentos",
    icon: Calendar,
  },
  {
    label: "Meus Agendamentos",
    href: "/meus-agendamentos",
    icon: Calendar,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    label: "Convites",
    href: "/convites",
    icon: Mail,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-[#111311] px-5 py-6">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-white">
          Barber<span className="text-[#b4ff39]">Algo</span>
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-[#b4ff39] text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 flex items-center gap-3 rounded-lg border border-red-500/60 bg-red-950/40 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-900/60"
      >
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}