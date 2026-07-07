import { NextRequest, NextResponse } from "next/server";
import { getAdminUsers } from "@/lib/admin-users";
import { getAuthenticatedUser } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedUser(request);

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 },
    );
  }

  const users = await getAdminUsers();

  return NextResponse.json({ users });
}
