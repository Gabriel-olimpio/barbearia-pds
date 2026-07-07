"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Grid2X2,
  Mail,
  Scissors,
  Trophy,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type RankingItem = {
  id: string;
  name: string;
  appointments: number;
};

type StatusItem = {
  label: string;
  value: number;
};

type WeekDayItem = {
  id: string;
  name: string;
  appointments: number;
};

type DashboardData = {
  totalAppointments: number;
  futureAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;
  estimatedRevenue: number;
  topServices: RankingItem[];
  topBarbers: RankingItem[];
  appointmentStatus: StatusItem[];
  busiestWeekDays: WeekDayItem[];
  busiestHours: WeekDayItem[];
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName: string;
  sparkClassName: string;
};

type RankingCardProps = {
  title: string;
  icon: React.ReactNode;
  items: RankingItem[];
};

type BarItem = {
  id: string;
  name: string;
  appointments: number;
};

type BarChartCardProps = {
  title: string;
  icon: React.ReactNode;
  items: BarItem[];
  barClassName: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function HeaderNavigation() {
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Grid2X2,
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
  ];

  return (
    <nav className="flex flex-wrap items-center gap-3">
      {links.map((link) => {
        const Icon = link.icon;
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold transition ${
              active
                ? "border-[#b4ff39] bg-[#b4ff39] text-black"
                : "border-zinc-800 bg-[#151815] text-zinc-200 hover:border-[#b4ff39]/60 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  sparkClassName,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-[#171a17] to-[#101210] p-6 shadow-lg shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>

          <strong className="mt-3 block text-3xl font-black text-white">
            {value}
          </strong>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={28} className="text-white" />
        </div>
      </div>

      <div className="mt-5 h-6 w-full">
        <svg viewBox="0 0 180 28" className="h-full w-full opacity-80">
          <path
            d="M2 18 C10 18, 12 20, 18 18 S28 14, 34 16 S43 23, 50 17 S59 11, 66 16 S73 23, 80 17 S89 13, 96 16 S104 22, 112 17 S121 11, 128 16 S136 21, 144 17 S153 13, 160 17 S170 22, 178 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={sparkClassName}
          />
        </svg>
      </div>
    </div>
  );
}

function RankingCard({ title, icon, items }: RankingCardProps) {
  const maxValue = Math.max(...items.map((item) => item.appointments), 1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-[#171a17] to-[#101210] p-6 shadow-lg shadow-black/30">
      <div className="mb-6 flex items-center gap-3">
        {icon}

        <h2 className="text-2xl font-black text-white">{title}</h2>
      </div>

      <div className="space-y-5">
        {items.length === 0 ? (
          <p className="text-zinc-400">Nenhum dado encontrado.</p>
        ) : (
          items.slice(0, 5).map((item, index) => {
            const percentage = (item.appointments / maxValue) * 100;

            return (
              <div
                key={item.id}
                className="grid grid-cols-[32px_1fr_44px] items-center gap-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-600 text-sm font-bold text-zinc-300">
                  {index + 1}
                </span>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-zinc-200">
                      {item.name}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-[#b4ff39] shadow-[0_0_12px_rgba(180,255,57,0.45)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <strong className="text-right text-sm text-white">
                  {item.appointments}
                </strong>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BarChartCard({ title, icon, items, barClassName }: BarChartCardProps) {
  const maxValue = Math.max(...items.map((item) => item.appointments), 1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-[#171a17] to-[#101210] p-6 shadow-lg shadow-black/30">
      <div className="mb-6 flex items-center gap-3">
        {icon}

        <h2 className="text-2xl font-black text-white">{title}</h2>
      </div>

      <div className="space-y-5">
        {items.length === 0 ? (
          <p className="text-zinc-400">Nenhum dado encontrado.</p>
        ) : (
          items.map((item) => {
            const percentage = (item.appointments / maxValue) * 100;

            return (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-sm text-zinc-300">{item.name}</span>

                  <strong className="text-sm text-white">
                    {item.appointments}
                  </strong>
                </div>

                <div className="h-2 rounded-full bg-zinc-800">
                  <div
                    className={`h-2 rounded-full ${barClassName}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Erro ao carregar dashboard.");
        return;
      }

      setError("");
      setData(json);
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar dashboard.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    const interval = window.setInterval(() => {
      void loadDashboard();
    }, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  if (!data) {
    return (
      <section className="min-h-screen bg-[#101010] px-8 py-8 text-white">
        <p className="text-zinc-300">Carregando dashboard...</p>
      </section>
    );
  }

  const statusItems = data.appointmentStatus.map((item, index) => ({
    id: String(index),
    name: item.label,
    appointments: item.value,
  }));

  return (
    <section className="min-h-screen bg-[#101010] px-8 py-8 text-white">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#b4ff39]">
              Área Administrativa
            </p>

            <h1 className="mt-2 text-4xl font-black text-white">
              Dashboard da Administração
            </h1>

            <p className="mt-2 text-zinc-400">
              Visão geral das principais métricas da barbearia.
            </p>
          </div>

          <HeaderNavigation />
        </header>

        {error && (
          <div className="mb-8 rounded-lg border border-red-500/50 bg-red-950/40 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Agendamentos"
            value={data.totalAppointments}
            icon={CalendarDays}
            iconClassName="bg-blue-500"
            sparkClassName="text-blue-500"
          />

          <StatCard
            title="Receita Estimada"
            value={formatCurrency(data.estimatedRevenue)}
            icon={CircleDollarSign}
            iconClassName="bg-emerald-600"
            sparkClassName="text-emerald-600"
          />

          <StatCard
            title="Clientes"
            value={data.totalClients}
            icon={Users}
            iconClassName="bg-purple-500"
            sparkClassName="text-purple-500"
          />

          <StatCard
            title="Barbeiros"
            value={data.totalBarbers}
            icon={Scissors}
            iconClassName="bg-orange-500"
            sparkClassName="text-orange-500"
          />

          <StatCard
            title="Serviços"
            value={data.totalServices}
            icon={Briefcase}
            iconClassName="bg-cyan-500"
            sparkClassName="text-cyan-500"
          />

          <StatCard
            title="Agendamentos Futuros"
            value={data.futureAppointments}
            icon={Clock3}
            iconClassName="bg-yellow-500"
            sparkClassName="text-yellow-500"
          />

          <StatCard
            title="Concluídos"
            value={data.completedAppointments}
            icon={CheckCircle2}
            iconClassName="bg-green-500"
            sparkClassName="text-green-500"
          />

          <StatCard
            title="Cancelados"
            value={data.canceledAppointments}
            icon={XCircle}
            iconClassName="bg-red-500"
            sparkClassName="text-red-500"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <RankingCard
            title="Serviços mais agendados"
            icon={<Trophy size={24} className="text-[#b4ff39]" />}
            items={data.topServices}
          />

          <RankingCard
            title="Barbeiros com mais atendimentos"
            icon={<Scissors size={24} className="text-[#b4ff39]" />}
            items={data.topBarbers}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <BarChartCard
            title="Agendamentos por Status"
            icon={<BarChart3 size={24} className="text-[#b4ff39]" />}
            items={statusItems}
            barClassName="bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.45)]"
          />

          <BarChartCard
            title="Dias da Semana"
            icon={<CalendarDays size={24} className="text-[#b4ff39]" />}
            items={data.busiestWeekDays}
            barClassName="bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.45)]"
          />

          <BarChartCard
            title="Horários mais movimentados"
            icon={<Clock3 size={24} className="text-[#b4ff39]" />}
            items={data.busiestHours}
            barClassName="bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.45)]"
          />
        </div>
      </div>
    </section>
  );
}