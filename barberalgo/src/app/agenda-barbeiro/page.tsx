import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarberSchedule from "@/components/barber/barber-schedule";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";
import { getBarberAppointments } from "@/lib/barber-appointments";

export const metadata: Metadata = {
  title: "Agenda do Barbeiro | BarberAlgo",
};

export default async function AgendaBarbeiroPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserFromToken(token);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "BARBER") {
    redirect("/");
  }

  const appointments = await getBarberAppointments(user.id);

  return (
    <BarberSchedule initialAppointments={appointments} barberName={user.name} />
  );
}
