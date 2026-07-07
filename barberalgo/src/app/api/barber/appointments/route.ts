import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { getBarberAppointments } from "@/lib/barber-appointments";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  if (user.role !== "BARBER") {
    return NextResponse.json(
      { error: "Acesso permitido apenas para barbeiros." },
      { status: 403 },
    );
  }

  const appointments = await getBarberAppointments(user.id);

  return NextResponse.json({ appointments });
}
