import ServicosClient from "./ServicosClient";
import { requireAdmin } from "@/lib/dashboard-auth";

export default async function ServicosPage() {
  await requireAdmin();

  return <ServicosClient />;
}
