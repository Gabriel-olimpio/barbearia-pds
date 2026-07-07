import AgendamentosClient from "./AgendamentosClient";
import { requireAuth } from "@/lib/dashboard-auth";

export default async function AgendamentosPage() {
  await requireAuth();

  return <AgendamentosClient />;
}
