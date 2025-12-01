import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect only home "/" → "/login"
  if (path === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow login & signup pages
  if (path === "/login" || path === "/signup") {
    return NextResponse.next();
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup"],
};
