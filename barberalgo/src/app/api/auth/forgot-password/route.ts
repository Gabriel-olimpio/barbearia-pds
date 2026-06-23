import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth-validations";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, hashToken } from "@/lib/security-tokens";

const RESET_TOKEN_DURATION_MINUTES = 30;
const GENERIC_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const email = normalizeEmail(payload.email);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const token = createPasswordResetToken();
  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_DURATION_MINUTES * 60 * 1000,
  );

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { tokenHash: hashToken(token), userId: user.id, expiresAt },
    }),
  ]);

  const configuredAppUrl = process.env.APP_URL?.replace(/\/$/, "");
  const appUrl = configuredAppUrl || request.nextUrl.origin;
  const resetUrl = `${appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;

  try {
    const delivery = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return NextResponse.json({
      message: GENERIC_MESSAGE,
      developmentResetUrl:
        delivery.sent || process.env.NODE_ENV === "production" ? undefined : resetUrl,
    });
  } catch (error) {
    console.error("Erro ao enviar recuperação de senha:", error);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
