import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  team_manager: "/dashboard/team",
  race_manager: "/dashboard/race-manager",
  content: "/dashboard/content",
  superadmin: "/dashboard/admin",
};

// Routes that require auth (prefix match)
const PROTECTED_PREFIXES = ["/dashboard"];

// Routes only for guests
const GUEST_ONLY = ["/login", "/register", "/verify-email"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read PocketBase auth token from cookie (PB sets pb_auth cookie)
  const pbAuth = request.cookies.get("pb_auth")?.value;
  let isAuthenticated = false;
  let isVerified = false;
  let role = "";

  if (pbAuth) {
    try {
      const parsed = JSON.parse(pbAuth);
      if (parsed?.token && parsed?.record) {
        isAuthenticated = true;
        isVerified = parsed.record.verified === true;
        role = parsed.record.role ?? "team_manager";
      }
    } catch {}
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated verified check — must verify email first
  if (isProtected && isAuthenticated && !isVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/verify-email";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from guest-only pages
  if (isGuestOnly && isAuthenticated && isVerified) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? "/dashboard";
    return NextResponse.redirect(url);
  }

  // Enforce role-based route access for dashboard sub-routes
  if (isAuthenticated && isVerified) {
    if (pathname.startsWith("/dashboard/admin") && role !== "superadmin") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
    }
    if (
      pathname.startsWith("/dashboard/race-manager") &&
      role !== "race_manager" &&
      role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
    }
    if (
      pathname.startsWith("/dashboard/content") &&
      role !== "content" &&
      role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all routes except static files and API routes
    "/((?!_next|api|favicon.ico|images|fonts|.*\\..*).)*",
  ],
};
