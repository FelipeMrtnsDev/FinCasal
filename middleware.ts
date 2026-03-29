import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";
const ONBOARDING_COOKIE = "onboarding_token";
const PUBLIC_PATHS = [
  "/login",
  "/registro",
  "/auth/callback",
  "/convite",
  "/invite",
];
const ONBOARDING_PATHS = ["/plans", "/checkout", "/assinatura"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const plan = request.nextUrl.searchParams.get("plan");
  const reauth = request.nextUrl.searchParams.get("reauth") === "1";
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const onboardingToken = request.cookies.get(ONBOARDING_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isOnboardingRoute = ONBOARDING_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/registro");

  if (
    pathname === "/" &&
    (plan === "individual" || plan === "casal" || plan === "couple")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/plans";
    return NextResponse.redirect(url);
  }

  if (token && !reauth && (isAuthRoute || isOnboardingRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!token && onboardingToken) {
    if (isAuthRoute && !reauth) {
      const url = request.nextUrl.clone();
      url.pathname = "/plans";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (!isPublic && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/plans";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token && !onboardingToken && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
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
