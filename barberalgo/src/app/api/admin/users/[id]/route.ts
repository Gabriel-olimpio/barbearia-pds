import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { adminUserSelect, serializeAdminUser } from "@/lib/admin-users";
import { normalizeEmail } from "@/lib/auth-validations";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ROLES = ["CLIENT", "BARBER", "ADMIN"] as const;

function parseUserPayload(body: unknown):
  | {
      data: {
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
        active: boolean;
      };
    }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Dados inválidos." };
  }

  const payload = body as Record<string, unknown>;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = normalizeEmail(payload.email);
  const phone =
    typeof payload.phone === "string" && payload.phone.trim()
      ? payload.phone.trim()
      : null;
  const role = typeof payload.role === "string" ? payload.role : "";
  const active = payload.active;

  if (!name || name.length < 3) {
    return { error: "Informe o nome do usuário." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Informe um e-mail válido." };
  }

  if (!USER_ROLES.includes(role as UserRole)) {
    return { error: "Selecione um tipo de usuário válido." };
  }

  if (typeof active !== "boolean") {
    return { error: "Selecione um status válido." };
  }

  return {
    data: {
      name,
      email,
      phone,
      role: role as UserRole,
      active,
    },
  };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedUser(request);

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const payload = parseUserPayload(body);

  if ("error" in payload) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  if (
    admin.id === id &&
    (!payload.data.active || payload.data.role !== "ADMIN")
  ) {
    return NextResponse.json(
      { error: "Você não pode remover seu próprio acesso administrativo." },
      { status: 400 },
    );
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        role: true,
        active: true,
        barberProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const emailInUse = await prisma.user.findFirst({
      where: {
        email: payload.data.email,
        id: {
          not: id,
        },
      },
      select: {
        id: true,
      },
    });

    if (emailInUse) {
      return NextResponse.json(
        { error: "Já existe outro usuário com este e-mail." },
        { status: 409 },
      );
    }

    const shouldRefreshSession =
      currentUser.role !== payload.data.role ||
      currentUser.active !== payload.data.active;

    const updatedUser = await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: {
          id,
        },
        data: {
          name: payload.data.name,
          email: payload.data.email,
          phone: payload.data.phone,
          role: payload.data.role,
          active: payload.data.active,
          sessionVersion: shouldRefreshSession ? { increment: 1 } : undefined,
        },
      });

      if (payload.data.role === "BARBER") {
        await transaction.barberProfile.upsert({
          where: {
            userId: id,
          },
          create: {
            userId: id,
            phone: payload.data.phone,
            active: payload.data.active,
          },
          update: {
            phone: payload.data.phone,
            active: payload.data.active,
          },
        });
      } else if (currentUser.barberProfile) {
        await transaction.barberProfile.update({
          where: {
            id: currentUser.barberProfile.id,
          },
          data: {
            active: false,
          },
        });
      }

      return transaction.user.findUniqueOrThrow({
        where: {
          id,
        },
        select: adminUserSelect,
      });
    });

    return NextResponse.json({ user: serializeAdminUser(updatedUser) });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAuthenticatedUser(request);

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  if (admin.id === id) {
    return NextResponse.json(
      { error: "Você não pode excluir ou desativar a si mesmo por esta tela." },
      { status: 400 },
    );
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        barberProfile: {
          select: {
            id: true,
            _count: {
              select: {
                appointments: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            canceledAppointments: true,
            createdInvites: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const linkedRecordsCount =
      targetUser._count.appointments +
      targetUser._count.canceledAppointments +
      targetUser._count.createdInvites +
      (targetUser.barberProfile?._count.appointments ?? 0);

    if (linkedRecordsCount > 0) {
      const user = await prisma.$transaction(async (transaction) => {
        await transaction.user.update({
          where: {
            id,
          },
          data: {
            active: false,
            sessionVersion: {
              increment: 1,
            },
          },
        });

        if (targetUser.barberProfile) {
          await transaction.barberProfile.update({
            where: {
              id: targetUser.barberProfile.id,
            },
            data: {
              active: false,
            },
          });
        }

        return transaction.user.findUniqueOrThrow({
          where: {
            id,
          },
          select: adminUserSelect,
        });
      });

      return NextResponse.json({
        action: "deactivated",
        user: serializeAdminUser(user),
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ action: "deleted" });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir ou desativar usuário." },
      { status: 500 },
    );
  }
}
