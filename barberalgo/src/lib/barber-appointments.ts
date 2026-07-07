import type { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BarberAppointmentItem = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  serviceName: string;
  serviceDurationMinutes: number;
  servicePrice: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
  canceledAt: string | null;
};

const barberAppointmentSelect = {
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
} satisfies Prisma.AppointmentSelect;

type BarberAppointmentRecord = Prisma.AppointmentGetPayload<{
  select: typeof barberAppointmentSelect;
}>;

export function serializeBarberAppointment(
  appointment: BarberAppointmentRecord,
): BarberAppointmentItem {
  return {
    id: appointment.id,
    clientName: appointment.client.name,
    clientEmail: appointment.client.email,
    clientPhone: appointment.client.phone,
    serviceName: appointment.service.name,
    serviceDurationMinutes: appointment.service.durationMinutes,
    servicePrice: appointment.service.price.toString(),
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    notes: appointment.notes,
    cancellationReason: appointment.cancellationReason,
    canceledAt: appointment.canceledAt?.toISOString() ?? null,
  };
}

export async function getActiveBarberProfile(userId: string) {
  return prisma.barberProfile.findFirst({
    where: {
      userId,
      active: true,
      user: {
        active: true,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function getBarberAppointments(userId: string) {
  const barberProfile = await getActiveBarberProfile(userId);

  if (!barberProfile) {
    return [];
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: barberProfile.id,
    },
    select: barberAppointmentSelect,
    orderBy: {
      startsAt: "asc",
    },
  });

  return appointments.map(serializeBarberAppointment);
}
