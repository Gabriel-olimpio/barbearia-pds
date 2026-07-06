"use client";

import { useEffect, useState } from "react";
import AdminNavigation from "@/components/dashboard/AdminNavigation";
import StatCard from "@/components/dashboard/StatCard";
import RankingCard from "@/components/dashboard/RankingCard";
import BarChartCard from "@/components/dashboard/BarChartCard";

import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Users,
  Scissors,
  Briefcase,
  CircleDollarSign,
  Trophy,
  BarChart3,
  LogOut,
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

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);

  async function handleLogout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  window.location.href = "/login";
}

useEffect(() => {
  async function loadDashboard() {
    const response = await fetch("/api/dashboard");
    const json = await response.json();
    setData(json);
  }

  loadDashboard();

  const interval = setInterval(loadDashboard, 30000);

  return () => clearInterval(interval);
}, []);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-medium">Carregando dashboard...</p>
      </main>
    );
  }

  const statusItems = data.appointmentStatus.map((item, index) => ({
    id: String(index),
    name: item.label,
    appointments: item.value,
  }));

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">

        <div className="mb-10 flex items-center justify-between">

  <div>
    <h1 className="text-4xl font-bold text-gray-900">
      Dashboard da Administração
    </h1>

    <p className="mt-2 text-gray-500">
      Visão geral das principais métricas da barbearia.
    </p>
  </div>

<AdminNavigation />

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
  >
    <LogOut size={18} />
    Sair
  </button>

</div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Agendamentos"
            value={data.totalAppointments}
            icon={CalendarDays}
            color="bg-blue-500"
          />

          <StatCard
            title="Receita Estimada"
            value={`R$ ${data.estimatedRevenue.toFixed(2)}`}
            icon={CircleDollarSign}
            color="bg-emerald-600"
          />

          <StatCard
            title="Clientes"
            value={data.totalClients}
            icon={Users}
            color="bg-purple-500"
          />

          <StatCard
            title="Barbeiros"
            value={data.totalBarbers}
            icon={Scissors}
            color="bg-orange-500"
          />

          <StatCard
            title="Serviços"
            value={data.totalServices}
            icon={Briefcase}
            color="bg-cyan-500"
          />

          <StatCard
            title="Agendamentos Futuros"
            value={data.futureAppointments}
            icon={Clock3}
            color="bg-yellow-500"
          />

          <StatCard
            title="Concluídos"
            value={data.completedAppointments}
            icon={CheckCircle2}
            color="bg-green-500"
          />

          <StatCard
            title="Cancelados"
            value={data.canceledAppointments}
            icon={XCircle}
            color="bg-red-500"
          />

        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">

          <RankingCard
            title="Serviços mais agendados"
            icon={<Trophy className="text-yellow-500" />}
            firstColumn="Serviço"
            secondColumn="Agendamentos"
            items={data.topServices}
          />

          <RankingCard
            title="Barbeiros com mais atendimentos"
            icon={<Scissors className="text-orange-500" />}
            firstColumn="Barbeiro"
            secondColumn="Atendimentos"
            items={data.topBarbers}
          />

        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">

          <BarChartCard
            title="Agendamentos por Status"
            icon={<BarChart3 className="text-blue-600" />}
            items={statusItems}
            color="bg-blue-500"
          />

          <BarChartCard
            title="Dias da Semana"
            icon={<CalendarDays className="text-indigo-600" />}
            items={data.busiestWeekDays}
            color="bg-indigo-500"
          />

          <BarChartCard
  title="Horários mais movimentados"
  icon={<Clock3 className="text-teal-600" />}
  items={data.busiestHours}
  color="bg-teal-500"
/>

        </div>

      </div>
    </main>
  );
}