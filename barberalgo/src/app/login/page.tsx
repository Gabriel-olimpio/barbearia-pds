import type { Metadata } from "next";
import AuthScreen from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Entrar | BarberAlgo",
  description: "Acesse sua conta no BarberAlgo.",
};

export default function LoginPage() {
  return <AuthScreen initialMode="login" />;
}
