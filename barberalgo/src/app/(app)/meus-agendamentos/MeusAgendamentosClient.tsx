/** @format */

"use client";

import Link from "next/link";
import { CalendarDays, Clock3, History, Plus, Scissors } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  service: {
    name: string;
    price: number | string;
  };
  barber: {
    user: {
      id: string;
      name: string;
    };
  };
};

function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    SCHEDULED: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    CANCELED: "border-red-400/30 bg-red-400/10 text-red-300",
    COMPLETED: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    NO_SHOW: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  };

  return classes[status] ?? "border-zinc-700 bg-zinc-800 text-zinc-300";
}

function formatStatus(status: string) {
  const statusMap: Record<string, string> = {
    SCHEDULED: "Agendado",
    CANCELED: "Cancelado",
    COMPLETED: "Concluído",
    NO_SHOW: "Não compareceu",
  };

  return statusMap[status] || status;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price: number | string) {
  return Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">
            Carregando seus agendamentos...
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="h-28 rounded-xl bg-zinc-900" />
            <div className="h-28 rounded-xl bg-zinc-900" />
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
      <CalendarDays className="mx-auto h-10 w-10 text-zinc-500" />
      <h3 className="mt-4 text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <strong className="mt-2 block text-3xl font-bold text-zinc-50">
            {value}
          </strong>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/10 text-lime-300">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  isFuture,
  onCancel,
}: {
  appointment: Appointment;
  isFuture: boolean;
  onCancel: (appointmentId: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-sm transition hover:border-zinc-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
              <Scissors size={14} />
              {formatShortDate(appointment.startsAt)}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                appointment.status,
              )}`}>
              {formatStatus(appointment.status)}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-zinc-50">
            {appointment.service.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Atendimento com {appointment.barber.user.name}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-left md:text-right">
          <p className="text-sm text-zinc-400">{formatDate(appointment.startsAt)}</p>
          <p className="mt-1 text-lg font-bold text-zinc-50">
            {formatTime(appointment.startsAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-zinc-800 pt-5 text-sm sm:grid-cols-3">
        <div>
          <p className="text-zinc-500">Barbeiro</p>
          <p className="mt-1 font-medium text-zinc-200">
            {appointment.barber.user.name}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Valor</p>
          <p className="mt-1 font-medium text-zinc-200">
            {formatPrice(appointment.service.price)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Status</p>
          <p className="mt-1 font-medium text-zinc-200">
            {formatStatus(appointment.status)}
          </p>
        </div>
      </div>

      {isFuture && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => onCancel(appointment.id)}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
            Cancelar
          </button>
        </div>
      )}
    </article>
  );
}

export default function MeusAgendamentosClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      const response = await fetch("/api/appointments/me", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao buscar agendamentos.");
        return;
      }

      setError("");
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar agendamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function cancelAppointment(appointmentId: string) {
    const confirmCancel = confirm(
      "Tem certeza que deseja cancelar este agendamento?",
    );

    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const text = await response.text();

      let data: { error?: string; message?: string };

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Resposta da API não veio em JSON:", text);
        alert("Erro inesperado ao cancelar. Veja o console ou terminal.");
        return;
      }

      if (!response.ok) {
        alert(data.error || "Erro ao cancelar agendamento.");
        return;
      }

      alert("Agendamento cancelado com sucesso.");
      await loadAppointments();
    } catch (error) {
      console.error(error);
      alert("Erro ao cancelar agendamento.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAppointments]);

  function isFutureAppointment(appointment: Appointment) {
    const now = new Date();
    const appointmentDate = new Date(appointment.startsAt);

    return appointment.status === "SCHEDULED" && appointmentDate >= now;
  }

  const futureAppointments = appointments.filter(isFutureAppointment);

  const oldAppointments = appointments.filter(
    (appointment) => !isFutureAppointment(appointment),
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-lime-300">
              Área do Cliente
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50">
              Meus agendamentos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Visualize seus horários futuros, cancelados e concluídos.
            </p>
          </div>

          <Link
            href="/agendamentos"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#bdff31] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95">
            <Plus size={18} />
            Novo agendamento
          </Link>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <SummaryCard
            label="Agendamentos futuros"
            value={futureAppointments.length}
            icon={Clock3}
          />
          <SummaryCard
            label="Itens no histórico"
            value={oldAppointments.length}
            icon={History}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-50">
              Próximos agendamentos
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Horários que ainda podem ser acompanhados ou cancelados.
            </p>
          </div>

          {futureAppointments.length === 0 ? (
            <EmptyState
              title="Nenhum agendamento futuro"
              description="Quando você marcar um novo horário, ele aparecerá nesta área."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {futureAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isFuture
                  onCancel={cancelAppointment}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-50">Histórico</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Agendamentos concluídos, cancelados ou que já passaram.
            </p>
          </div>

          {oldAppointments.length === 0 ? (
            <EmptyState
              title="Nenhum histórico encontrado"
              description="Seus agendamentos antigos ficarão organizados aqui."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {oldAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isFuture={false}
                  onCancel={cancelAppointment}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
