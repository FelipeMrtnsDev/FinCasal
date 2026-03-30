import { AuthResponse, User } from "@/lib/types";

const FINAL_TOKEN_STORAGE_KEY = "token";
const ONBOARDING_TOKEN_STORAGE_KEY = "onboarding_token";
const ONBOARDING_DASHBOARD_STORAGE_KEY = "onboarding_dashboard_id";
const AUTH_COOKIE = "auth_token";
const ONBOARDING_COOKIE = "onboarding_token";
const COOKIE_MAX_AGE = 2592000;

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
  if (!found) return null;
  return decodeURIComponent(found);
};

const writeCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
};

const toBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === 1 || value === "1";

const getUserFromAuthResponse = (response: AuthResponse): User | null => {
  const record = toRecord(response);
  const user = record.user;
  return user && typeof user === "object" ? (user as User) : null;
};

export type ResolvedAuthFlow =
  | {
      kind: "final";
      token: string;
      dashboardId: string | null;
      user: User | null;
    }
  | {
      kind: "onboarding";
      onboardingToken: string;
      dashboardId: string | null;
      user: User | null;
    }
  | { kind: "invalid" };

export const authSession = {
  resolveAuthFlow(response: AuthResponse): ResolvedAuthFlow {
    const record = toRecord(response);
    const user = getUserFromAuthResponse(response);
    const token = toNonEmptyString(record.token);
    const paymentRequired =
      toBoolean(record.paymentRequired) || toBoolean(record.requiresPayment);
    const onboardingToken =
      toNonEmptyString(record.onboardingToken) ||
      toNonEmptyString(record.onboarding_token) ||
      toNonEmptyString(record.tempToken);
    const dashboardId =
      toNonEmptyString(record.dashboardId) ||
      toNonEmptyString(record.dashboard_id) ||
      toNonEmptyString(user?.dashboardId);

    if (token && !paymentRequired) {
      return { kind: "final", token, dashboardId, user };
    }

    if ((paymentRequired && onboardingToken) || onboardingToken) {
      return {
        kind: "onboarding",
        onboardingToken,
        dashboardId,
        user,
      };
    }

    if (token) {
      return { kind: "final", token, dashboardId, user };
    }

    return { kind: "invalid" };
  },

  persistFinalToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(FINAL_TOKEN_STORAGE_KEY, token);
    writeCookie(AUTH_COOKIE, token, COOKIE_MAX_AGE);
    this.clearOnboardingSession();
  },

  clearFinalToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(FINAL_TOKEN_STORAGE_KEY);
    clearCookie(AUTH_COOKIE);
  },

  persistOnboardingSession(params: {
    onboardingToken: string;
    dashboardId?: string | null;
    user?: User | null;
  }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ONBOARDING_TOKEN_STORAGE_KEY, params.onboardingToken);
    writeCookie(ONBOARDING_COOKIE, params.onboardingToken, COOKIE_MAX_AGE);

    if (params.dashboardId) {
      localStorage.setItem(
        ONBOARDING_DASHBOARD_STORAGE_KEY,
        params.dashboardId,
      );
    }

    if (params.user?.name) {
      localStorage.setItem("onboarding_name", params.user.name);
    }
    if (params.user?.email) {
      localStorage.setItem("onboarding_email", params.user.email);
    }

    this.clearFinalToken();
  },

  clearOnboardingSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ONBOARDING_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_DASHBOARD_STORAGE_KEY);
    localStorage.removeItem("onboarding_name");
    localStorage.removeItem("onboarding_email");
    localStorage.removeItem("onboarding_checkout_id");
    clearCookie(ONBOARDING_COOKIE);
  },

  getFinalToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem(FINAL_TOKEN_STORAGE_KEY) || readCookie(AUTH_COOKIE)
    );
  },

  getOnboardingToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem(ONBOARDING_TOKEN_STORAGE_KEY) ||
      readCookie(ONBOARDING_COOKIE)
    );
  },

  getOnboardingDashboardId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ONBOARDING_DASHBOARD_STORAGE_KEY);
  },
};

export const authSessionKeys = {
  AUTH_COOKIE,
  ONBOARDING_COOKIE,
};
