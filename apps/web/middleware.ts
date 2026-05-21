import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  const adminPattern = /^\/[a-z]{2}\/admin(\/|$)/;
  const adminLoginPattern = /^\/[a-z]{2}\/admin\/login(\/|$)/;

  if (adminPattern.test(pathname) && !adminLoginPattern.test(pathname)) {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) {
      const loginUrl = new URL("/vi/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = intlMiddleware(request) as NextResponse;
  // Pass pathname to layouts via header
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)" ],
};
