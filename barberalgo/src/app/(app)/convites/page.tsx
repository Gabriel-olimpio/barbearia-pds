import type { Metadata } from "next";
import InviteManager from "@/components/admin/invite-manager";
import { requireAdmin } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Convites | BarberAlgo",
};

export default async function ConvitesPage() {
  await requireAdmin();

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
