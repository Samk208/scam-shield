import { redirect } from "next/navigation";
import { getMe } from "@/lib/server/auth";

export const instant = false;

// Routes each user to their role's screen.
export default async function Home() {
  const auth = await getMe();
  if (!auth) redirect("/login");
  redirect(auth.me.role === "parent" ? "/parent" : "/guardian");
}
