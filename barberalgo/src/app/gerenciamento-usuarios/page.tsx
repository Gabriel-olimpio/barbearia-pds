import type { Metadata } from "next";
import UserManager from "@/components/admin/user-manager";
import { getAdminUsers } from "@/lib/admin-users";
import { requireAdmin } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Gerenciamento de Usuários | BarberAlgo",
};

export default async function GerenciamentoUsuariosPage() {
  const admin = await requireAdmin();
  const users = await getAdminUsers();

  return <UserManager currentUserId={admin.id} initialUsers={users} />;
}
