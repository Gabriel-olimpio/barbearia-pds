import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getRouteForRole,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { parseRegistrationBody } from "@/lib/auth-validations";
import { prisma } from "@/lib/prisma";
import { hashToken, normalizeInviteCode } from "@/lib/security-tokens";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dados de cadastro inválidos." },
      { status: 400 },
    );
  }

  const parsed = parseRegistrationBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este e-mail." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.$transaction(async (transaction) => {
      const isFirstAdmin =
        data.role === "ADMIN" &&
        (await transaction.user.count({ where: { role: "ADMIN" } })) === 0;
      const needsInvite = data.role === "BARBER" || (data.role === "ADMIN" && !isFirstAdmin);
      let inviteId: string | null = null;

      if (needsInvite) {
        if (!data.accessCode) {
          throw new Error("INVITE_REQUIRED");
        }

        const invite = await transaction.registrationInvite.findUnique({
          where: {
            codeHash: hashToken(normalizeInviteCode(data.accessCode)),
          },
          select: {
            id: true,
            role: true,
            expiresAt: true,
            usedAt: true,
            revokedAt: true,
          },
        });

        if (
          !invite ||
          invite.role !== data.role ||
          invite.usedAt ||
          invite.revokedAt ||
          invite.expiresAt <= new Date()
        ) {
          throw new Error("INVITE_INVALID");
        }

        inviteId = invite.id;
      }

      const createdUser = await transaction.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: data.role,
          barberProfile:
            data.role === "BARBER"
              ? {
                  create: {
                    phone: data.phone,
                    specialty: data.specialty,
                  },
                }
              : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          sessionVersion: true,
        },
      });

      if (inviteId) {
        const acceptedInvite = await transaction.registrationInvite.updateMany({
          where: {
            id: inviteId,
            usedAt: null,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date(), usedById: createdUser.id },
        });

        if (acceptedInvite.count !== 1) {
          throw new Error("INVITE_INVALID");
        }
      }

      return createdUser;
    });

    const response = NextResponse.json(
      { user, redirectTo: getRouteForRole(user.role) },
      { status: 201 },
    );
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken(user.id, user.role, user.sessionVersion),
      sessionCookieOptions,
    );

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "INVITE_REQUIRED") {
      return NextResponse.json(
        { error: "Informe o código de convite fornecido pelo administrador." },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "INVITE_INVALID") {
      return NextResponse.json(
        { error: "Código de convite inválido, expirado ou já utilizado." },
        { status: 403 },
      );
    }

    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro. Tente novamente." },
      { status: 500 },
    );
  }
}
