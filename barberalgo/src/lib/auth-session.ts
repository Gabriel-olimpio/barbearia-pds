import type { NextRequest } from "next/server";
import { parseSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getAuthenticatedUserFromToken(token);
}

export async function getAuthenticatedUserFromToken(token?: string) {
  const session = token ? parseSessionToken(token) : null;

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sessionVersion: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.sessionVersion !== session.sessionVersion) {
    return null;
  }

  return user;
}