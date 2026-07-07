import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthScreen from "@/components/auth/auth-screen";
import { SESSION_COOKIE_NAME, getRouteForRole } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Criar conta | BarberAlgo",
  description: "Crie sua conta de cliente, profissional ou administrador.",
};

export default async function CadastroPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserFromToken(token);

  if (user) {
    redirect(getRouteForRole(user.role));
  }

  return <AuthScreen initialMode="register" />;
}
