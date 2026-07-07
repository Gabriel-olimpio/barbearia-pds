"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  LogOut,
  Scissors,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";
import type { BarberAppointmentItem } from "@/lib/barber-appointments";

type AppointmentStatus = BarberAppointmentItem["status"];
type ScheduleTab = "TODAY" | "UPCOMING" | "HISTORY" | "CANCELED" | "COMPLETED";

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-[#b9ff62]/10 text-[#b9ff62]",
  COMPLETED: "bg-blue-400/10 text-blue-200",
  CANCELED: "bg-red-400/10 text-red-200",
  NO_SHOW: "bg-amber-400/10 text-amber-200",
};

const tabs: Array<{ id: ScheduleTab; label: string }> = [
  { id: "TODAY", label: "Hoje" },
  { id: "UPCOMING", label: "Próximos" },
  { id: "HISTORY", label: "Histórico" },
  { id: "CANCELED", label: "Cancelados" },
  { id: "COMPLETED", label: "Concluídos" },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return startOfDay(firstDate).getTime() === startOfDay(secondDate).getTime();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getDurationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function canCancelAppointment(appointment: BarberAppointmentItem, now: Date) {
  return (
    appointment.status === "SCHEDULED" &&
    new Date(appointment.startsAt).getTime() >= now.getTime()
  );
}

function canCloseAppointment(appointment: BarberAppointmentItem, now: Date) {
  return (
    appointment.status === "SCHEDULED" &&
    new Date(appointment.startsAt).getTime() <= now.getTime()
  );
}

export default function BarberSchedule({
  initialAppointments,
  barberName,
}: {
  initialAppointments: BarberAppointmentItem[];
  barberName: string;
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    initialAppointments[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] = useState<ScheduleTab>("TODAY");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [now, setNow] = useState(() => new Date());

  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ??
    null;

  const tabCounts = useMemo(() => {
    const todayStart = startOfDay(now).getTime();

    return {
      TODAY: appointments.filter((appointment) =>
        isSameDay(new Date(appointment.startsAt), now),
      ).length,
      UPCOMING: appointments.filter(
        (appointment) =>
          appointment.status === "SCHEDULED" &&
          new Date(appointment.startsAt).getTime() >= todayStart,
      ).length,
      HISTORY: appointments.filter(
        (appointment) =>
          new Date(appointment.startsAt).getTime() < todayStart ||
          appointment.status !== "SCHEDULED",
      ).length,
      CANCELED: appointments.filter(
        (appointment) => appointment.status === "CANCELED",
      ).length,
      COMPLETED: appointments.filter(
        (appointment) => appointment.status === "COMPLETED",
      ).length,
    } satisfies Record<ScheduleTab, number>;
  }, [appointments, now]);

  const visibleAppointments = useMemo(() => {
    const todayStart = startOfDay(now).getTime();

    return appointments.filter((appointment) => {
      const startsAt = new Date(appointment.startsAt);

      if (activeTab === "TODAY") {
        return isSameDay(startsAt, now);
      }

      if (activeTab === "UPCOMING") {
        return (
          appointment.status === "SCHEDULED" &&
          startsAt.getTime() >= todayStart
        );
      }

      if (activeTab === "CANCELED") {
        return appointment.status === "CANCELED";
      }

      if (activeTab === "COMPLETED") {
        return appointment.status === "COMPLETED";
      }

      return (
        startsAt.getTime() < todayStart || appointment.status !== "SCHEDULED"
      );
    });
  }, [activeTab, appointments, now]);

  const groupedAppointments = useMemo(() => {
    return visibleAppointments.reduce<
      Array<{ dateKey: string; label: string; appointments: BarberAppointmentItem[] }>
    >((groups, appointment) => {
      const date = new Date(appointment.startsAt);
      const dateKey = startOfDay(date).toISOString();
      const currentGroup = groups.find((group) => group.dateKey === dateKey);

      if (currentGroup) {
        currentGroup.appointments.push(appointment);
        return groups;
      }

      groups.push({
        dateKey,
        label: formatDate(appointment.startsAt),
        appointments: [appointment],
      });

      return groups;
    }, []);
  }, [visibleAppointments]);

  async function updateAppointmentStatus(
    appointment: BarberAppointmentItem,
    status: "CANCELED" | "COMPLETED" | "NO_SHOW",
  ) {
    const actionLabels = {
      CANCELED: "cancelar",
      COMPLETED: "marcar como concluído",
      NO_SHOW: "marcar como não compareceu",
    };
    const confirmed = window.confirm(
      `Deseja ${actionLabels[status]} o atendimento de ${appointment.clientName}?`,
    );

    if (!confirmed) return;

    setUpdatingId(appointment.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/barber/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as {
        appointment?: BarberAppointmentItem;
        error?: string;
      };

      if (!response.ok || !data.appointment) {
        throw new Error(data.error ?? "Erro ao atualizar agendamento.");
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment.id === data.appointment?.id
            ? data.appointment
            : currentAppointment,
        ),
      );
      setSelectedAppointmentId(data.appointment.id);
      setMessage("Agendamento atualizado com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao atualizar agendamento.",
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const scheduledToday = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED" &&
      isSameDay(new Date(appointment.startsAt), now),
  ).length;
  const nextScheduled = appointments.find(
    (appointment) =>
      appointment.status === "SCHEDULED" &&
      new Date(appointment.startsAt).getTime() >= now.getTime(),
  );

  return (
    <main className="min-h-screen bg-[#222220] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wide text-[#b9ff62]">
              Área do barbeiro
            </span>
            <h1 className="mt-2 text-2xl font-black uppercase">
              Agenda de atendimentos
            </h1>
            <p className="mt-1 text-sm text-white/55">{barberName}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-red-400/30 px-4 text-xs font-black uppercase text-red-100 hover:border-red-300/60">
            <LogOut size={16} />
            Sair
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-[#b9ff62]/20 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-[#b9ff62]">
              Hoje
            </p>
            <p className="mt-2 text-2xl font-black">{scheduledToday}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-white/40">
              Próximo horário
            </p>
            <p className="mt-2 text-lg font-black">
              {nextScheduled ? formatTime(nextScheduled.startsAt) : "--:--"}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-[#171717] p-4">
            <p className="text-[10px] font-black uppercase text-white/40">
              Total na agenda
            </p>
            <p className="mt-2 text-2xl font-black">{appointments.length}</p>
          </div>
        </section>

        {message && (
          <div className="rounded-md border border-[#b9ff62]/30 bg-[#b9ff62]/10 px-4 py-3 text-sm text-[#d8ff9d]">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <section className="overflow-x-auto rounded-md border border-white/10 bg-[#171717] p-2">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-10 items-center gap-2 rounded px-4 text-xs font-black uppercase transition ${
                    active
                      ? "bg-[#b9ff62] text-black"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}>
                  {tab.label}
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] ${
                      active ? "bg-black text-white" : "bg-white/10 text-white/55"
                    }`}>
                    {tabCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="grid gap-4">
            {groupedAppointments.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#171717] p-6 text-sm text-white/45">
                Nenhum agendamento nesta aba.
              </div>
            ) : (
              groupedAppointments.map((group) => (
                <div
                  key={group.dateKey}
                  className="overflow-hidden rounded-md border border-white/10 bg-[#171717]">
                  <div className="border-b border-white/10 bg-[#101010] px-5 py-3">
                    <h2 className="text-xs font-black uppercase text-white/60">
                      {group.label}
                    </h2>
                  </div>

                  <div className="divide-y divide-white/5">
                    {group.appointments.map((appointment) => {
                      const isSelected = appointment.id === selectedAppointmentId;
                      const isUpdating = updatingId === appointment.id;

                      return (
                        <article
                          key={appointment.id}
                          className={`grid gap-4 px-5 py-4 transition lg:grid-cols-[86px_1fr_auto] lg:items-center ${
                            isSelected ? "bg-[#b9ff62]/5" : ""
                          }`}>
                          <div className="flex items-center gap-3 lg:block">
                            <p className="text-xl font-black text-white">
                              {formatTime(appointment.startsAt)}
                            </p>
                            <p className="text-xs font-bold text-white/40">
                              {getDurationLabel(
                                appointment.serviceDurationMinutes,
                              )}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black uppercase leading-tight text-white">
                                {appointment.clientName}
                              </h3>
                              <span
                                className={`rounded px-2 py-1 text-[10px] font-black uppercase ${statusStyles[appointment.status]}`}>
                                {statusLabels[appointment.status]}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-white/55">
                              {appointment.serviceName} ·{" "}
                              {formatPrice(appointment.servicePrice)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedAppointmentId(appointment.id)
                              }
                              title="Ver detalhes"
                              className="grid size-9 place-items-center rounded-md border border-white/10 text-white/70 hover:border-white/20 hover:text-white">
                              <Eye size={16} />
                            </button>

                            {canCancelAppointment(appointment, now) && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment,
                                    "CANCELED",
                                  )
                                }
                                className="flex h-9 items-center gap-2 rounded-md border border-red-400/40 px-3 text-xs font-black text-red-200 disabled:opacity-55">
                                <XCircle size={15} />
                                Cancelar
                              </button>
                            )}

                            {canCloseAppointment(appointment, now) && (
                              <>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment,
                                      "COMPLETED",
                                    )
                                  }
                                  className="flex h-9 items-center gap-2 rounded-md bg-[#b9ff62] px-3 text-xs font-black text-black disabled:opacity-55">
                                  <CheckCircle2 size={15} />
                                  Concluir
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment,
                                      "NO_SHOW",
                                    )
                                  }
                                  className="flex h-9 items-center gap-2 rounded-md border border-amber-300/35 px-3 text-xs font-black text-amber-100 disabled:opacity-55">
                                  <UserX size={15} />
                                  Ausente
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="rounded-md border border-white/10 bg-[#171717] p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="mb-5">
              <h2 className="text-sm font-black uppercase">Detalhes</h2>
              <p className="mt-1 text-xs text-white/45">
                Atendimento selecionado
              </p>
            </div>

            {selectedAppointment ? (
              <div className="grid gap-5">
                <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#b9ff62] text-black">
                      <UserRound size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-white/35">
                        Cliente
                      </p>
                      <p className="mt-1 font-black text-white">
                        {selectedAppointment.clientName}
                      </p>
                      <p className="text-xs text-white/50">
                        {selectedAppointment.clientPhone || "Sem telefone"}
                      </p>
                    </div>
                  </div>
                </div>

                <dl className="grid gap-4 text-sm">
                  <div className="grid grid-cols-[22px_1fr] gap-3">
                    <Scissors size={17} className="mt-0.5 text-[#b9ff62]" />
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Serviço
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {selectedAppointment.serviceName}
                      </dd>
                    </div>
                  </div>

                  <div className="grid grid-cols-[22px_1fr] gap-3">
                    <CalendarDays
                      size={17}
                      className="mt-0.5 text-[#b9ff62]"
                    />
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Data
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {formatDate(selectedAppointment.startsAt)}
                      </dd>
                    </div>
                  </div>

                  <div className="grid grid-cols-[22px_1fr] gap-3">
                    <Clock3 size={17} className="mt-0.5 text-[#b9ff62]" />
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Horário
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {formatTime(selectedAppointment.startsAt)} às{" "}
                        {formatTime(selectedAppointment.endsAt)}
                      </dd>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Duração
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {getDurationLabel(
                          selectedAppointment.serviceDurationMinutes,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase text-white/35">
                        Valor
                      </dt>
                      <dd className="mt-1 text-white/75">
                        {formatPrice(selectedAppointment.servicePrice)}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-[10px] font-black uppercase text-white/35">
                      Status
                    </dt>
                    <dd className="mt-2">
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-black uppercase ${statusStyles[selectedAppointment.status]}`}>
                        {statusLabels[selectedAppointment.status]}
                      </span>
                    </dd>
                  </div>
                </dl>

                {(canCancelAppointment(selectedAppointment, now) ||
                  canCloseAppointment(selectedAppointment, now)) && (
                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {canCancelAppointment(selectedAppointment, now) && (
                      <button
                        type="button"
                        disabled={updatingId === selectedAppointment.id}
                        onClick={() =>
                          updateAppointmentStatus(
                            selectedAppointment,
                            "CANCELED",
                          )
                        }
                        className="flex h-10 items-center gap-2 rounded-md border border-red-400/40 px-4 text-xs font-black text-red-200 disabled:opacity-55">
                        <XCircle size={15} />
                        Cancelar
                      </button>
                    )}

                    {canCloseAppointment(selectedAppointment, now) && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === selectedAppointment.id}
                          onClick={() =>
                            updateAppointmentStatus(
                              selectedAppointment,
                              "COMPLETED",
                            )
                          }
                          className="flex h-10 items-center gap-2 rounded-md bg-[#b9ff62] px-4 text-xs font-black text-black disabled:opacity-55">
                          <CheckCircle2 size={15} />
                          Concluir
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === selectedAppointment.id}
                          onClick={() =>
                            updateAppointmentStatus(
                              selectedAppointment,
                              "NO_SHOW",
                            )
                          }
                          className="flex h-10 items-center gap-2 rounded-md border border-amber-300/35 px-4 text-xs font-black text-amber-100 disabled:opacity-55">
                          <UserX size={15} />
                          Ausente
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/45">
                Selecione um atendimento na lista.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
