import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: user.id,
      },
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
      { error: "Erro ao buscar seus agendamentos." },
      { status: 500 }
    );
  }
}