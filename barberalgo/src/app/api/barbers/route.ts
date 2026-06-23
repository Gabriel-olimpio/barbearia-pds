import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  barberInclude,
  barberToResponse,
  parseBarberPayload,
} from "./helpers";

export async function GET() {
  try {
    const barbers = await prisma.barberProfile.findMany({
      where: {
        active: true,
      },
      include: barberInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      barbers: barbers.map(barberToResponse),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar barbeiros." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const payload = await parseBarberPayload(request);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const barber = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: payload.data.name,
          email: `barbeiro-${randomUUID()}@barberalgo.local`,
          passwordHash: "barbeiro-sem-login",
          role: "BARBER",
          barberProfile: {
            create: {
              phone: payload.data.phone,
            },
          },
        },
        include: {
          barberProfile: true,
        },
      });

      const barberId = user.barberProfile?.id;

      if (!barberId) {
        throw new Error("Barbeiro não foi criado.");
      }

      if (payload.data.availabilities.length > 0) {
        await transaction.availability.createMany({
          data: payload.data.availabilities.map((availability) => ({
            barberId,
            dayOfWeek: availability.dayOfWeek,
            startTimeMinutes: availability.startTimeMinutes,
            endTimeMinutes: availability.endTimeMinutes,
          })),
        });
      }

      return transaction.barberProfile.findUniqueOrThrow({
        where: {
          id: barberId,
        },
        include: barberInclude,
      });
    });

    return NextResponse.json(
      {
        barber: barberToResponse(barber),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao cadastrar barbeiro." },
      { status: 500 },
    );
  }
}
