import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";
const PUBLIC_PATHS = [
  "/login",
  "/registro",
  "/auth/callback",
  "/convite",
  "/invite",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
