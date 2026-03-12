import api from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";

const AUTH_COOKIE = "auth_token";

function persistToken(token: string) {
  localStorage.setItem("token", token);
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=2592000; samesite=lax`;
}

function clearToken() {
  localStorage.removeItem("token");
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response.data.token) {
      persistToken(response.data.token);
    }
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    if (response.data.token) {
      persistToken(response.data.token);
    }
    return response.data;
  },

  googleLogin: async (googleIdToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", {
      googleIdToken,
    });
    if (response.data.token) {
      persistToken(response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearToken();
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
