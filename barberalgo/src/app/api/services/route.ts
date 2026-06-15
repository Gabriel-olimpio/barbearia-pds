/** @format */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function serviceToResponse(service: {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: Prisma.Decimal;
}) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price.toString(),
  };
}

async function parseServicePayload(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price =
    typeof body.price === "string" ? body.price : String(body.price ?? "");
  const durationMinutes = Number(body.durationMinutes);
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (!name || !price || !durationMinutes) {
    return {
      error: "Nome, preço e duração são obrigatórios.",
    };
  }

  const priceNumber = Number(price);

  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    return {
      error: "Preço deve ser maior que zero.",
    };
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return {
      error: "Duração deve ser maior que zero.",
    };
  }

  return {
    data: {
      name,
      price: new Prisma.Decimal(price),
      durationMinutes,
      description,
    },
  };
}

// GET para carregar serviços do banco de dados
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      services: services.map(serviceToResponse),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar serviços." },
      { status: 500 },
    );
  }
}

// POST para cadastrar serviços no banco de dados
export async function POST(request: NextRequest) {
  const payload = await parseServicePayload(request);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const existingService = await prisma.service.findFirst({
      where: {
        active: true,
        name: {
          equals: payload.data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Já existe um serviço com esse nome." },
        { status: 409 },
      );
    }

    const service = await prisma.service.create({
      data: payload.data,
    });

    return NextResponse.json(
      {
        service: serviceToResponse(service),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao cadastrar serviço." },
      { status: 500 },
    );
  }
}
