import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authSession } from "@/lib/authSession";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isOnboardingRoute =
      pathname.startsWith("/plans") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/assinatura");

    const finalToken = authSession.getFinalToken();
    const onboardingToken = authSession.getOnboardingToken();
    const token = isOnboardingRoute
      ? onboardingToken || finalToken
      : finalToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 402 Payment Required
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 402
    ) {
      localStorage.setItem("payment_required", "1");
      window.dispatchEvent(
        new CustomEvent("payment-required", {
          detail: { required: true },
        }),
      );
      return Promise.reject(error);
    }

    // Handle 401 — try to refresh
    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Don't try to refresh if we're already on auth routes
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/registro");
      if (isAuthRoute) {
        return Promise.reject(error);
      }

      // Don't refresh for the refresh endpoint itself
      if (originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const data = response.data as Record<string, unknown>;
        const newAccessToken =
          typeof data.accessToken === "string"
            ? data.accessToken
            : typeof data.token === "string"
              ? data.token
              : null;

        if (newAccessToken) {
          authSession.persistFinalToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }

        processQueue(error, null);
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear auth and redirect to login
        if (typeof window !== "undefined") {
          authSession.clearFinalToken();
          authSession.clearOnboardingSession();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
