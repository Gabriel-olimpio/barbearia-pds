import { NextResponse } from "next/server";
import { AppointmentStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const [
      totalAppointments,
      futureAppointments,
      completedAppointments,
      canceledAppointments,
      noShowAppointments,
      totalClients,
      totalBarbers,
      totalServices,
      revenueAppointments,
      services,
      barbers,
      allAppointments,
      hourAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),

      prisma.appointment.count({
        where: {
          startsAt: {
            gte: now,
          },
        },
      }),

      prisma.appointment.count({
        where: {
          status: AppointmentStatus.COMPLETED,
        },
      }),

      prisma.appointment.count({
        where: {
          status: AppointmentStatus.CANCELED,
        },
      }),

      prisma.appointment.count({
        where: {
          status: AppointmentStatus.NO_SHOW,
        },
      }),

      prisma.user.count({
        where: {
          role: UserRole.CLIENT,
        },
      }),

      prisma.barberProfile.count({
        where: {
          active: true,
        },
      }),

      prisma.service.count({
        where: {
          active: true,
        },
      }),

      prisma.appointment.findMany({
        where: {
          status: {
            in: [
              AppointmentStatus.SCHEDULED,
              AppointmentStatus.COMPLETED,
            ],
          },
        },
        include: {
          service: true,
        },
      }),

      prisma.service.findMany({
        include: {
          appointments: true,
        },
      }),

      prisma.barberProfile.findMany({
        include: {
          user: true,
          appointments: true,
        },
      }),

      prisma.appointment.findMany({
        select: {
          startsAt: true,
        },
      }),

      prisma.appointment.findMany({
        select: {
          startsAt: true,
        },
      }),
    ]);

    const estimatedRevenue = revenueAppointments.reduce(
      (total, appointment) => total + Number(appointment.service.price),
      0,
    );

    const topServices = services
      .map((service) => ({
        id: service.id,
        name: service.name,
        appointments: service.appointments.length,
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    const topBarbers = barbers
      .map((barber) => ({
        id: barber.id,
        name: barber.user.name,
        appointments: barber.appointments.length,
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    const appointmentStatus = [
      {
        label: "Agendados",
        value:
          totalAppointments -
          completedAppointments -
          canceledAppointments -
          noShowAppointments,
      },
      {
        label: "Concluídos",
        value: completedAppointments,
      },
      {
        label: "Cancelados",
        value: canceledAppointments,
      },
      {
        label: "Não compareceu",
        value: noShowAppointments,
      },
    ];

    const weekNames = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    const weekCounter = Array(7).fill(0);

    allAppointments.forEach((appointment) => {
      const day = new Date(appointment.startsAt).getDay();
      weekCounter[day]++;
    });

    const busiestWeekDays = weekNames.map((name, index) => ({
      id: String(index),
      name,
      appointments: weekCounter[index],
    }));

    const hourCounter = new Map<number, number>();

    hourAppointments.forEach((appointment) => {
      const hour = new Date(appointment.startsAt).getHours();

      hourCounter.set(
        hour,
        (hourCounter.get(hour) ?? 0) + 1,
      );
    });

    const busiestHours = Array.from(hourCounter.entries())
      .map(([hour, appointments]) => ({
        id: String(hour),
        name: `${hour.toString().padStart(2, "0")}:00`,
        appointments,
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));

    return NextResponse.json({
      totalAppointments,
      futureAppointments,
      completedAppointments,
      canceledAppointments,
      totalClients,
      totalBarbers,
      totalServices,
      estimatedRevenue,
      topServices,
      topBarbers,
      appointmentStatus,
      busiestWeekDays,
      busiestHours,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao carregar dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}