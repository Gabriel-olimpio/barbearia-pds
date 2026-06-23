import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  barberInclude,
  barberToResponse,
  parseBarberPayload,
} from "../helpers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const payload = await parseBarberPayload(request);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const currentBarber = await prisma.barberProfile.findFirst({
      where: {
        id,
        active: true,
      },
      select: {
        userId: true,
      },
    });

    if (!currentBarber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado." },
        { status: 404 },
      );
    }

    const barber = await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: {
          id: currentBarber.userId,
        },
        data: {
          name: payload.data.name,
        },
      });

      await transaction.barberProfile.update({
        where: {
          id,
        },
        data: {
          phone: payload.data.phone,
        },
      });

      await transaction.availability.deleteMany({
        where: {
          barberId: id,
        },
      });

      if (payload.data.availabilities.length > 0) {
        await transaction.availability.createMany({
          data: payload.data.availabilities.map((availability) => ({
            barberId: id,
            dayOfWeek: availability.dayOfWeek,
            startTimeMinutes: availability.startTimeMinutes,
            endTimeMinutes: availability.endTimeMinutes,
          })),
        });
      }

      return transaction.barberProfile.findUniqueOrThrow({
        where: {
          id,
        },
        include: barberInclude,
      });
    });

    return NextResponse.json({
      barber: barberToResponse(barber),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar barbeiro." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const currentBarber = await prisma.barberProfile.findFirst({
      where: {
        id,
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (!currentBarber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado." },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.availability.updateMany({
        where: {
          barberId: id,
        },
        data: {
          active: false,
        },
      }),
      prisma.barberProfile.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir barbeiro." },
      { status: 500 },
    );
  }
}
