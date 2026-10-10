import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Protects /product/* and /profile/*.
 * This is a fast cookie check; the pages also verify the session on the server.
 */
export function middleware(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const url = new URL("/signin", request.url);
  url.searchParams.set("notice", "login_required");
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/product/:path*", "/profile/:path*"],
};
