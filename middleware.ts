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
  const plan = request.nextUrl.searchParams.get("plan");
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (
    pathname === "/" &&
    (plan === "individual" || plan === "casal" || plan === "couple")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/assinatura";
    return NextResponse.redirect(url);
  }

  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
