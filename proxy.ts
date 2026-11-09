import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_ROLE_COOKIE = "scam_shield_demo_role";

// Refreshes the Supabase session cookie and sends logged-out users to /login.
// Homepage (/) and /login are public so visitors see the full web platform first.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isPublic = path === "/" || path.startsWith("/login") || path.startsWith("/api");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const demoRole = request.cookies.get(DEMO_ROLE_COOKIE)?.value;
    if (!demoRole && (path.startsWith("/parent") || path.startsWith("/guardian") || path.startsWith("/checks"))) {
      const inferredRole = path.startsWith("/guardian") ? "guardian" : "parent";
      response.cookies.set(DEMO_ROLE_COOKIE, inferredRole, { path: "/", sameSite: "lax" });
      return response;
    }
    if (!demoRole && !isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  // Skip static assets and the PWA manifest so the app stays installable when logged out.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|ico|webmanifest)$).*)"],
};
