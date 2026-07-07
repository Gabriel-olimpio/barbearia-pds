import BarbeirosClient from "./BarbeirosClient";
import { requireAdmin } from "@/lib/dashboard-auth";

export default async function BarbeirosPage() {
  await requireAdmin();

  return <BarbeirosClient />;
}
