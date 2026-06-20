import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import {
  createInviteCode,
  getInviteHint,
  hashToken,
} from "@/lib/security-tokens";

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  return user?.role === "ADMIN" ? user : null;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const invites = await prisma.registrationInvite.findMany({
    select: {
      id: true,
      codeHint: true,
      role: true,
      expiresAt: true,
      usedAt: true,
      revokedAt: true,
      createdAt: true,
      usedBy: { select: { name: true, email: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ invites });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const role = payload.role === "ADMIN" ? "ADMIN" : payload.role === "BARBER" ? "BARBER" : null;
  const expiresInDays = Number(payload.expiresInDays);

  if (!role) {
    return NextResponse.json(
      { error: "Selecione Profissional ou Administrador." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 90) {
    return NextResponse.json(
      { error: "A validade deve ser de 1 a 90 dias." },
      { status: 400 },
    );
  }

  const code = createInviteCode(role);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  const invite = await prisma.registrationInvite.create({
    data: {
      codeHash: hashToken(code),
      codeHint: getInviteHint(code),
      role,
      expiresAt,
      createdById: admin.id,
    },
    select: {
      id: true,
      codeHint: true,
      role: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ invite, code }, { status: 201 });
}
