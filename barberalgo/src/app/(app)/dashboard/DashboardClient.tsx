/** @format */

"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Scissors,
  Trophy,
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
  description: string;
  icon: LucideIcon;
  tone: string;
};

type RankingCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  items: RankingItem[];
};

type BarItem = {
  id: string;
  name: string;
  appointments: number;
};

type BarChartCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  items: BarItem[];
  barClassName: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function LoadingState() {
  return (
    <section className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <p className="text-sm font-medium text-zinc-400">
            Carregando dashboard...
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-32 rounded-xl bg-zinc-900" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyData({ label = "Nenhum dado encontrado." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center text-sm text-zinc-400">
      {label}
    </div>
  );
}

function CardHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <strong className="mt-3 block text-3xl font-bold tracking-tight text-zinc-50">
            {value}
          </strong>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function RankingCard({ title, description, icon, items }: RankingCardProps) {
  const maxValue = Math.max(...items.map((item) => item.appointments), 1);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
      <CardHeader title={title} description={description} icon={icon} />

      {items.length === 0 ? (
        <EmptyData />
      ) : (
        <div className="space-y-5">
          {items.slice(0, 5).map((item, index) => {
            const percentage = (item.appointments / maxValue) * 100;

            return (
              <div
                key={item.id}
                className="grid grid-cols-[32px_1fr_48px] items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-300">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="truncate text-sm font-medium text-zinc-200">
                      {item.name}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-[#bdff31]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <strong className="text-right text-sm text-zinc-50">
                  {item.appointments}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BarChartCard({
  title,
  description,
  icon,
  items,
  barClassName,
}: BarChartCardProps) {
  const maxValue = Math.max(...items.map((item) => item.appointments), 1);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
      <CardHeader title={title} description={description} icon={icon} />

      {items.length === 0 ? (
        <EmptyData />
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const percentage = (item.appointments / maxValue) * 100;

            return (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="truncate text-sm text-zinc-300">
                    {item.name}
                  </span>

                  <strong className="text-sm text-zinc-50">
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
          })}
        </div>
      )}
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
    return <LoadingState />;
  }

  const statusItems = data.appointmentStatus.map((item, index) => ({
    id: String(index),
    name: item.label,
    appointments: item.value,
  }));

  return (
    <section className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-lime-300">
              Área Administrativa
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50">
              Dashboard da Administração
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Visão geral das principais métricas da barbearia.
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total de agendamentos"
            value={data.totalAppointments}
            description="Volume geral registrado."
            icon={CalendarDays}
            tone="border-blue-400/20 bg-blue-400/10 text-blue-300"
          />

          <StatCard
            title="Agendamentos futuros"
            value={data.futureAppointments}
            description="Reservas ainda programadas."
            icon={Clock3}
            tone="border-amber-400/20 bg-amber-400/10 text-amber-300"
          />

          <StatCard
            title="Concluídos"
            value={data.completedAppointments}
            description="Atendimentos finalizados."
            icon={CheckCircle2}
            tone="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          />

          <StatCard
            title="Cancelados"
            value={data.canceledAppointments}
            description="Agendamentos cancelados."
            icon={XCircle}
            tone="border-red-400/20 bg-red-400/10 text-red-300"
          />

          <StatCard
            title="Receita estimada"
            value={formatCurrency(data.estimatedRevenue)}
            description="Projeção baseada nos agendamentos."
            icon={CircleDollarSign}
            tone="border-lime-400/20 bg-lime-400/10 text-lime-300"
          />

          <StatCard
            title="Clientes cadastrados"
            value={data.totalClients}
            description="Base atual de clientes."
            icon={Users}
            tone="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
          />

          <StatCard
            title="Barbeiros ativos"
            value={data.totalBarbers}
            description="Profissionais disponíveis."
            icon={Scissors}
            tone="border-violet-400/20 bg-violet-400/10 text-violet-300"
          />

          <StatCard
            title="Serviços ativos"
            value={data.totalServices}
            description="Catálogo disponível."
            icon={Briefcase}
            tone="border-orange-400/20 bg-orange-400/10 text-orange-300"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RankingCard
            title="Serviços mais agendados"
            description="Os serviços com maior procura."
            icon={<Trophy size={21} />}
            items={data.topServices}
          />

          <RankingCard
            title="Barbeiros com mais atendimentos"
            description="Ranking por quantidade de agendamentos."
            icon={<Scissors size={21} />}
            items={data.topBarbers}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <BarChartCard
            title="Agendamentos por status"
            description="Distribuição dos estados dos agendamentos."
            icon={<BarChart3 size={21} />}
            items={statusItems}
            barClassName="bg-blue-400"
          />

          <BarChartCard
            title="Dias da semana"
            description="Dias com maior movimento."
            icon={<CalendarDays size={21} />}
            items={data.busiestWeekDays}
            barClassName="bg-violet-400"
          />

          <BarChartCard
            title="Horários mais movimentados"
            description="Faixas de horário mais buscadas."
            icon={<Clock3 size={21} />}
            items={data.busiestHours}
            barClassName="bg-teal-400"
          />
        </div>
      </div>
    </section>
  );
}
