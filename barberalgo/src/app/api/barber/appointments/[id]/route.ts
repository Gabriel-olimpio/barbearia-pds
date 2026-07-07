import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import {
  getActiveBarberProfile,
  serializeBarberAppointment,
} from "@/lib/barber-appointments";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseStatusPayload(body: unknown):
  | {
      data: {
        status: "CANCELED" | "COMPLETED" | "NO_SHOW";
      };
    }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Dados inválidos." };
  }

  const payload = body as Record<string, unknown>;
  const status = payload.status;

  if (
    status !== AppointmentStatus.CANCELED &&
    status !== AppointmentStatus.COMPLETED &&
    status !== AppointmentStatus.NO_SHOW
  ) {
    return { error: "Selecione uma ação válida para o agendamento." };
  }

  return {
    data: {
      status,
    },
  };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  if (user.role !== "BARBER") {
    return NextResponse.json(
      { error: "Acesso permitido apenas para barbeiros." },
      { status: 403 },
    );
  }

  const barberProfile = await getActiveBarberProfile(user.id);

  if (!barberProfile) {
    return NextResponse.json(
      { error: "Perfil de barbeiro inativo ou não encontrado." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const payload = parseStatusPayload(body);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const { id } = await context.params;
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      barberId: barberProfile.id,
    },
    select: {
      id: true,
      status: true,
      startsAt: true,
    },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Agendamento não encontrado." },
      { status: 404 },
    );
  }

  if (appointment.status !== AppointmentStatus.SCHEDULED) {
    return NextResponse.json(
      { error: "Este agendamento está disponível apenas para consulta." },
      { status: 400 },
    );
  }

  const now = new Date();

  if (
    payload.data.status === AppointmentStatus.CANCELED &&
    appointment.startsAt < now
  ) {
    return NextResponse.json(
      { error: "Não é possível cancelar agendamentos passados." },
      { status: 400 },
    );
  }

  if (
    payload.data.status !== AppointmentStatus.CANCELED &&
    appointment.startsAt > now
  ) {
    return NextResponse.json(
      { error: "A conclusão só pode ser registrada após o início do horário." },
      { status: 400 },
    );
  }

  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: appointment.id,
    },
    data: {
      status: payload.data.status,
      canceledAt:
        payload.data.status === AppointmentStatus.CANCELED ? now : undefined,
      canceledById:
        payload.data.status === AppointmentStatus.CANCELED ? user.id : undefined,
      cancellationReason:
        payload.data.status === AppointmentStatus.CANCELED
          ? "Cancelado pelo barbeiro."
          : undefined,
    },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      notes: true,
      cancellationReason: true,
      canceledAt: true,
      client: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          name: true,
          durationMinutes: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json({
    appointment: serializeBarberAppointment(updatedAppointment),
  });
}
