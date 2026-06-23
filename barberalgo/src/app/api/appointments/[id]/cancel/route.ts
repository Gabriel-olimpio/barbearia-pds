import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        clientId: user.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    if (appointment.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Este agendamento não pode ser cancelado." },
        { status: 400 }
      );
    }

    if (appointment.startsAt < new Date()) {
      return NextResponse.json(
        { error: "Não é possível cancelar agendamentos passados." },
        { status: 400 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status: "CANCELED",
      },
    });

    return NextResponse.json({
      message: "Agendamento cancelado com sucesso.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);

    return NextResponse.json(
      { error: "Erro ao cancelar agendamento." },
      { status: 500 }
    );
  }
}