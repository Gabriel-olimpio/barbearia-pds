import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/security-tokens";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const token = typeof payload.token === "string" ? payload.token : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!token) {
    return NextResponse.json(
      { error: "Link de recuperação inválido." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    return NextResponse.json(
      { error: "Este link é inválido ou expirou. Solicite uma nova recuperação." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();

  try {
    await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });

      if (consumed.count !== 1) throw new Error("TOKEN_ALREADY_USED");

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
      });

      await transaction.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, usedAt: null },
        data: { usedAt: now },
      });
    });
  } catch {
    return NextResponse.json(
      { error: "Este link já foi utilizado. Solicite uma nova recuperação." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Senha redefinida com sucesso. Você já pode entrar novamente.",
  });
}
