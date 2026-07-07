import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar senha | BarberAlgo",
};

export default function RecuperarSenhaPage() {
  return <ForgotPasswordForm />;
}
