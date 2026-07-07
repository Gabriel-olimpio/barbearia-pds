import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConfiguracoesClient from "./ConfiguracoesClient";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Configurações | BarberAlgo",
};

function getRoleLabel(role: string) {
  if (role === "ADMIN") {
    return "Administrador";
  }

  if (role === "BARBER" || role === "PROFESSIONAL" || role === "PROFISSIONAL") {
    return "Profissional";
  }

  return "Cliente";
}

export default async function ConfiguracoesPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await getAuthenticatedUserFromToken(token);

  if (!sessionUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ConfiguracoesClient
      initialUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: getRoleLabel(user.role),
      }}
    />
  );
}