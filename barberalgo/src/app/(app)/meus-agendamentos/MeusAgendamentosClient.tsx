/** @format */

"use client";

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

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR");
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

  function formatStatus(status: string) {
    const statusMap: Record<string, string> = {
      SCHEDULED: "Agendado",
      CANCELED: "Cancelado",
      COMPLETED: "Concluído",
    };

    return statusMap[status] || status;
  }

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
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#101010] px-6 py-10 text-white">
        <section className="mx-auto max-w-5xl">
          <p>Carregando agendamentos...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101010] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="font-bold uppercase tracking-widest text-[#b4ff39]">
          Área do Cliente
        </p>

        <h1 className="mt-2 text-4xl font-black uppercase">
          Meus Agendamentos
        </h1>

        <p className="mt-2 text-zinc-400">
          Visualize seus horários marcados, concluídos ou cancelados.
        </p>

        {error && (
          <div className="mt-8 rounded-lg border border-red-500 bg-red-950/40 p-5 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">Agendamentos futuros</h2>

          {futureAppointments.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-[#151515] p-6 text-zinc-300">
              Nenhum agendamento futuro encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {futureAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-zinc-800 bg-[#151515] p-6">
                  <p>
                    <strong>Serviço:</strong> {appointment.service.name}
                  </p>

                  <p>
                    <strong>Barbeiro:</strong> {appointment.barber.user.name}
                  </p>

                  <p>
                    <strong>Data:</strong> {formatDate(appointment.startsAt)}
                  </p>

                  <p>
                    <strong>Horário:</strong> {formatTime(appointment.startsAt)}
                  </p>

                  <p>
                    <strong>Valor:</strong>{" "}
                    {formatPrice(appointment.service.price)}
                  </p>

                  <p>
                    <strong>Status:</strong> {formatStatus(appointment.status)}
                  </p>

                  <button
                    type="button"
                    onClick={() => cancelAppointment(appointment.id)}
                    className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700">
                    Cancelar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Histórico</h2>

          {oldAppointments.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-[#151515] p-6 text-zinc-300">
              Nenhum agendamento antigo encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {oldAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-zinc-800 bg-[#151515] p-6">
                  <p>
                    <strong>Serviço:</strong> {appointment.service.name}
                  </p>

                  <p>
                    <strong>Barbeiro:</strong> {appointment.barber.user.name}
                  </p>

                  <p>
                    <strong>Data:</strong> {formatDate(appointment.startsAt)}
                  </p>

                  <p>
                    <strong>Horário:</strong> {formatTime(appointment.startsAt)}
                  </p>

                  <p>
                    <strong>Valor:</strong>{" "}
                    {formatPrice(appointment.service.price)}
                  </p>

                  <p>
                    <strong>Status:</strong> {formatStatus(appointment.status)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
