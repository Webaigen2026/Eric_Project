import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth?.user;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
    }
  }

  if (path === "/admin/login" && role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (path.startsWith("/account") || path === "/checkout") {
    if (role !== "customer") {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  if ((path === "/login" || path === "/register") && isLoggedIn && role === "customer") {
    return NextResponse.redirect(new URL("/account", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout",
    "/login",
    "/register",
    "/verify-email",
  ],
};
