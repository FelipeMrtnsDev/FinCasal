import axios from "axios";
import { authSession } from "@/lib/authSession";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api", // Ajuste conforme necessário
  headers: {
    "Content-Type": "application/json",
  },
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
    }
    return Promise.reject(error);
  },
);

export default api;
