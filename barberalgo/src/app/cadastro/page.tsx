import type { Metadata } from "next";
import AuthScreen from "@/components/auth/auth-screen";

export const metadata: Metadata = {
  title: "Criar conta | BarberAlgo",
  description: "Crie sua conta de cliente, profissional ou administrador.",
};

export default function CadastroPage() {
  return <AuthScreen initialMode="register" />;
}
