import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";

export async function requireAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const user = await getAuthenticatedUserFromToken(token);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/agendamentos");
  }

  return user;
}

export async function requireAuth() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const user = await getAuthenticatedUserFromToken(token);

  if (!user) {
    redirect("/login");
  }

  return user;
}