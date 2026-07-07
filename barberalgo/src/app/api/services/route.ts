/** @format */

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-session";

function serviceToResponse(service: {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: Prisma.Decimal;
  active: boolean;
}) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price.toString(),
    active: service.active,
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
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const whereClause: Prisma.ServiceWhereInput = {};

    if (!user || user.role !== "ADMIN") {
      whereClause.active = true;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
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
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 403 },
    );
  }

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
