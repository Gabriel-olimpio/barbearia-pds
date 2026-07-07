import MeusAgendamentosClient from "./MeusAgendamentosClient";
import { requireAuth } from "@/lib/dashboard-auth";

export default async function MeusAgendamentosPage() {
  await requireAuth();

  return <MeusAgendamentosClient />;
}
