/** @format */

import DashboardClient from "./DashboardClient";
// import { requireAdmin } from "@/lib/dashboard-auth";

export default async function DashboardPage() {
  // const user = await requireAdmin();

  return (
    <div>
      <DashboardClient />
    </div>
  );
}
