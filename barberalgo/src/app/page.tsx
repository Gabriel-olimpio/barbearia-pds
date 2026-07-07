import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, getRouteForRole } from "@/lib/auth";
import { getAuthenticatedUserFromToken } from "@/lib/auth-session";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUserFromToken(token);

  if (user) {
    redirect(getRouteForRole(user.role));
  } else {
    redirect("/login");
  }
}
