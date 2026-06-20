import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAuthenticatedUser(request);

  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const result = await prisma.registrationInvite.updateMany({
    where: { id, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Convite não encontrado ou já utilizado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
