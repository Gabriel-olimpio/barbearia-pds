import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        barber: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Apenas clientes podem fazer agendamentos." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { servico, barbeiro, data, horario } = body;

    if (!servico || !barbeiro || !data || !horario) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

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

    const client = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!service || !barber || !client) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const startsAt = new Date(`${data}T${horario}:00`);

    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60000
    );

    const appointment = await prisma.appointment.create({
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