"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  Mail,
  Scissors,
  Settings,
  UserCog,
  UserRound,
} from "lucide-react";

type UserRole =
  | "ADMIN"
  | "CLIENT"
  | "BARBER"
  | "PROFESSIONAL"
  | "PROFISSIONAL";

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
    label: "Convites",
    href: "/convites",
    icon: Mail,
  },
  {
    label: "Usuários",
    href: "/gerenciamento-usuarios",
    icon: UserCog,
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
];

const professionalMenuItems: MenuItem[] = [
  {
    label: "Agenda",
    href: "/agenda-barbeiro",
    icon: Calendar,
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
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleCollapsed() {
    setCollapsed((currentValue) => {
      const nextValue = !currentValue;

      localStorage.setItem("sidebar-collapsed", String(nextValue));

      if (nextValue) {
        setProfileMenuOpen(false);
      }

      return nextValue;
    });
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setProfileMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  function handleOpenSettings() {
    setProfileMenuOpen(false);
    router.push("/configuracoes");
  }

  const menuItems = getMenuItemsByRole(user?.role);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-[#111311] px-4 py-6 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <h1 className="text-2xl font-black text-white">
            Barber<span className="text-[#b4ff39]">Algo</span>
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
            aria-label="Recolher menu"
          >
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
          aria-label="Expandir menu"
        >
          <ChevronRight size={18} />
        </button>
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
                }`}
              >
                <Icon size={18} />

                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })
        )}
      </nav>

      <div className="relative mt-8" ref={profileMenuRef}>
        {profileMenuOpen && (
          <div
            className={`absolute bottom-full z-50 mb-3 rounded-xl border border-zinc-800 bg-[#171717] shadow-2xl shadow-black/40 ${
              collapsed ? "left-0 w-56" : "left-0 w-full"
            }`}
          >
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b4ff39] text-black">
                  <UserRound size={20} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.name ?? "Usuário"}
                  </p>

                  <p className="truncate text-xs text-zinc-400">
                    {user?.email ?? getRoleLabel(user?.role)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleOpenSettings}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                <Settings size={17} />
                Configurações
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-200 transition hover:bg-red-950/50"
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileMenuOpen((current) => !current)}
          className={`flex w-full items-center rounded-xl border border-zinc-800 bg-[#171717] transition hover:bg-zinc-900 ${
            collapsed
              ? "justify-center px-2 py-3"
              : "justify-between px-3 py-3"
          }`}
          title={collapsed ? user?.name ?? "Usuário" : undefined}
          aria-label="Abrir menu do usuário"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b4ff39] text-black">
              <UserRound size={18} />
            </div>

            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-bold text-white">
                  {loadingUser ? "Carregando..." : user?.name ?? "Usuário"}
                </p>

                <p className="truncate text-xs text-zinc-400">
                  {loadingUser
                    ? "..."
                    : user?.email ?? getRoleLabel(user?.role)}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <ChevronUp
              size={18}
              className={`shrink-0 text-zinc-400 transition-transform ${
                profileMenuOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          )}
        </button>
      </div>
    </aside>
  );
}