import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        barber: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    return NextResponse.json({
      appointments,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao buscar agendamentos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { servico, barbeiro, data, horario } = body;

    const service = await prisma.service.findFirst({
      where: {
        name: servico,
      },
    });

    const barber = await prisma.barberProfile.findFirst({
      where: {
        user: {
          name: barbeiro,
        },
      },
    });

    const client = await prisma.user.findFirst({
      where: {
        role: "CLIENT",
      },
    });

    if (!service || !barber || !client) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const startsAt = new Date(
      `${data}T${horario}:00`
    );

    const endsAt = new Date(
      startsAt.getTime() +
        service.durationMinutes * 60000
    );

    const appointment =
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          barberId: barber.id,
          serviceId: service.id,
          startsAt,
          endsAt,
          status: "SCHEDULED",
        },
      });

    return NextResponse.json({
      appointment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao criar agendamento." },
      { status: 500 }
    );
  }
}