import api from '@/lib/api';
import { AuthResponse, User } from '@/lib/types';

export const authService = {
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  googleLogin: async (googleIdToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/google', { googleIdToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>('/me');
    return response.data;
  },
};
