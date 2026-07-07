import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getRouteForRole,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { normalizeEmail } from "@/lib/auth-validations";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        sessionVersion: true,
        passwordHash: true,
        barberProfile: { select: { active: true } },
      },
    });
    const passwordIsValid = user
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || !passwordIsValid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Este usuário está inativo." },
        { status: 403 },
      );
    }

    if (user.role === "BARBER" && user.barberProfile?.active === false) {
      return NextResponse.json(
        { error: "Este perfil profissional está inativo." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: getRouteForRole(user.role),
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken(user.id, user.role, user.sessionVersion),
      sessionCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return NextResponse.json(
      { error: "Não foi possível entrar agora. Tente novamente." },
      { status: 500 },
    );
  }
}
