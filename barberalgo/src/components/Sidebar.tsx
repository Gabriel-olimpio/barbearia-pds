/** @format */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Scissors,
  Settings,
  UserCog,
  UserRound,
} from "lucide-react";

type UserRole = "ADMIN" | "CLIENT" | "BARBER" | "PROFESSIONAL" | "PROFISSIONAL";

type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
};

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const adminMenuItems: MenuItem[] = [
  {
    label: "Serviços",
    href: "/servicos",
    icon: Scissors,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Barbeiros",
    href: "/barbeiros",
    icon: UserRound,
  },
  {
    label: "Convites",
    href: "/convites",
    icon: Mail,
  },
  {
    label: "Usuários",
    href: "/gerenciamento-usuarios",
    icon: UserCog,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

const clientMenuItems: MenuItem[] = [
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
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

const professionalMenuItems: MenuItem[] = [
  {
    label: "Agenda",
    href: "/agenda-barbeiro",
    icon: Calendar,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

function getMenuItemsByRole(role?: UserRole | string | null) {
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === "ADMIN") {
    return adminMenuItems;
  }

  if (
    normalizedRole === "BARBER" ||
    normalizedRole === "PROFESSIONAL" ||
    normalizedRole === "PROFISSIONAL"
  ) {
    return professionalMenuItems;
  }

  return clientMenuItems;
}

function getRoleLabel(role?: UserRole | string | null) {
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "Administrador";
  }

  if (
    normalizedRole === "BARBER" ||
    normalizedRole === "PROFESSIONAL" ||
    normalizedRole === "PROFISSIONAL"
  ) {
    return "Profissional";
  }

  return "Cliente";
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedCollapsed = localStorage.getItem("sidebar-collapsed");

      if (savedCollapsed === "true") {
        setCollapsed(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadSession();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  function toggleCollapsed() {
    setCollapsed((currentValue) => {
      const nextValue = !currentValue;

      localStorage.setItem("sidebar-collapsed", String(nextValue));

      return nextValue;
    });
  }

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

  const menuItems = getMenuItemsByRole(user?.role);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-[#111311] px-4 py-6 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}>
      <div
        className={`mb-8 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}>
        {!collapsed && (
          <h1 className="text-lg font-black uppercase tracking-[-0.04em]">
            Barber<span className="text-[#b9ff62]">Algo</span>
          </h1>
        )}

        {collapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b4ff39] text-lg font-black text-black">
            BA
          </div>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            title="Recolher menu"
            aria-label="Recolher menu">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          className="mb-6 flex h-9 w-full items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          title="Expandir menu"
          aria-label="Expandir menu">
          <ChevronRight size={18} />
        </button>
      )}

      {!collapsed && user && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-[#171a17] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b4ff39]">
            Perfil
          </p>

          <p className="mt-2 truncate text-sm font-bold text-white">
            {user.name}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {getRoleLabel(user.role)}
          </p>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-2">
        {loadingUser ? (
          <div className="space-y-2">
            <div className="h-11 animate-pulse rounded-lg bg-zinc-900" />
            <div className="h-11 animate-pulse rounded-lg bg-zinc-900" />
            <div className="h-11 animate-pulse rounded-lg bg-zinc-900" />
          </div>
        ) : (
          menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-lg px-4 py-3 text-sm font-bold transition ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  active
                    ? "bg-[#b4ff39] text-black"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}>
                <Icon size={18} />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Sair" : undefined}
        aria-label="Sair"
        className={`mt-8 flex items-center rounded-lg border border-red-500/60 bg-red-950/40 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-900/60 ${
          collapsed ? "justify-center" : "gap-3"
        }`}>
        <LogOut size={18} />

        {!collapsed && <span>Sair</span>}
      </button>
    </aside>
  );
}
