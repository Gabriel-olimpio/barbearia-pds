import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const payload = await parseServicePayload(request);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  try {
    const existingService = await prisma.service.findFirst({
      where: {
        active: true,
        id: {
          not: id,
        },
        name: {
          equals: payload.data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Já existe um serviço com esse nome." },
        { status: 409 }
      );
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: payload.data,
    });

    return NextResponse.json({
      service: serviceToResponse(service),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar serviço." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    await prisma.service.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir serviço." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
        { status: 404 },
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        active: !service.active,
      },
    });

    return NextResponse.json({
      service: serviceToResponse(updatedService),
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao alterar status do serviço." },
      { status: 500 }
    );
  }
}
