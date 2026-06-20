import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InviteManager from "@/components/admin/invite-manager";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Convites | BarberAlgo",
};

export default async function ConvitesPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserFromToken(token);

  if (user?.role !== "ADMIN") redirect("/login");

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

  return <InviteManager initialInvites={invites.map((invite) => ({
    ...invite,
    role: invite.role as "BARBER" | "ADMIN",
    expiresAt: invite.expiresAt.toISOString(),
    usedAt: invite.usedAt?.toISOString() ?? null,
    revokedAt: invite.revokedAt?.toISOString() ?? null,
    createdAt: invite.createdAt.toISOString(),
  }))} />;
}
