import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api", // Ajuste conforme necessário
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const tokenFromStorage =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const tokenFromCookie =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((cookie) => cookie.startsWith("auth_token="))
            ?.split("=")[1]
        : null;
    const token =
      tokenFromStorage ||
      (tokenFromCookie ? decodeURIComponent(tokenFromCookie) : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (!tokenFromStorage && typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
