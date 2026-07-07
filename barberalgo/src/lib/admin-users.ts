import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
  appointmentsCount: number;
  linkedRecordsCount: number;
  barberProfileActive: boolean | null;
};

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  active: true,
  createdAt: true,
  barberProfile: {
    select: {
      id: true,
      active: true,
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
} satisfies Prisma.UserSelect;

type AdminUserRecord = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

export function serializeAdminUser(user: AdminUserRecord): AdminUserListItem {
  const barberAppointmentsCount = user.barberProfile?._count.appointments ?? 0;
  const appointmentsCount = user._count.appointments + barberAppointmentsCount;
  const linkedRecordsCount =
    appointmentsCount +
    user._count.canceledAppointments +
    user._count.createdInvites;
  const barberProfileActive = user.barberProfile?.active ?? null;
  const active =
    user.active && !(user.role === "BARBER" && barberProfileActive === false);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    active,
    createdAt: user.createdAt.toISOString(),
    appointmentsCount,
    linkedRecordsCount,
    barberProfileActive,
  };
}

export async function getAdminUsers() {
  const users = await prisma.user.findMany({
    select: adminUserSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(serializeAdminUser);
}
