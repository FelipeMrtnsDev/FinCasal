import api from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";
import { authSession } from "@/lib/authSession";

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  googleLogin: async (googleIdToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/google", {
      googleIdToken,
    });
    return response.data;
  },

  exchangeOnboardingToken: async (
    onboardingToken: string,
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/auth/onboarding/exchange-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${onboardingToken}`,
        },
      },
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      authSession.clearFinalToken();
      authSession.clearOnboardingSession();
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
  updateName: async (name: string): Promise<User> => {
    try {
      const response = await api.patch<User>("/auth/me", { name });
      return response.data;
    } catch {
      try {
        const response = await api.patch<User>("/users/me", { name });
        return response.data;
      } catch {
        const response = await api.patch<User>("/users/profile", { name });
        return response.data;
      }
    }
  },
};
