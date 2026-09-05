import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "pos_jwt_super_secret_key_change_in_prod";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

interface UserJwtPayload {
  sub: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "cashier" | "waitstaff";
  storeId: string | null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // Legacy route redirects
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (pathname === "/pos-login") {
    return NextResponse.redirect(new URL("/pos/login", request.url));
  }

  let user: UserJwtPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      user = payload as unknown as UserJwtPayload;
    } catch {
      // Invalid/expired token
      user = null;
    }
  }

  // 1. Auth Entry Pages (/admin/login, /pos/login, /register)
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/pos/login" ||
    pathname.startsWith("/register");

  if (isAuthPage && user) {
    if (user.role === "cashier" || user.role === "waitstaff") {
      return NextResponse.redirect(new URL("/pos", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Gating Backoffice Dashboard (/dashboard, /stores, /inventory, /admin, etc.)
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/stores") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings") ||
    (pathname.startsWith("/admin") && pathname !== "/admin/login");

  if (isDashboardRoute) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role === "cashier" || user.role === "waitstaff") {
      // Cashier/waitstaff cannot access backoffice dashboard, redirect to POS terminal
      return NextResponse.redirect(new URL("/pos", request.url));
    }
  }

  // 3. Gating POS Terminal (/pos/* except /pos/login)
  const isPosRoute = pathname.startsWith("/pos") && pathname !== "/pos/login";

  if (isPosRoute) {
    if (!user) {
      const posLoginUrl = new URL("/pos/login", request.url);
      return NextResponse.redirect(posLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stores/:path*",
    "/inventory/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/pos/:path*",
    "/login",
    "/pos-login",
    "/register",
  ],
};
