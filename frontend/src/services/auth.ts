import { api } from './api';
import { tokenStorage } from './tokenStorage';
import type { LandingScreen } from './preferences';

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  landingScreen?: LandingScreen;
  onboardingCompleted?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api<AuthResponse>('/api/auth/register', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify(data),
    });

    await tokenStorage.set(response.accessToken);
    return response;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api<AuthResponse>('/api/auth/login', {
      method: 'POST',
      authenticated: false,
      body: JSON.stringify(data),
    });

    await tokenStorage.set(response.accessToken);
    return response;
  },

  async me(): Promise<User> {
    return api<User>('/api/me');
  },

  async updateProfile(data: { name: string }): Promise<User> {
    return api<User>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updatePreferences(data: { landingScreen: LandingScreen }): Promise<User> {
    return api<User>('/api/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(): Promise<User> {
    return api<User>('/api/me/onboarding/complete', { method: 'POST' });
  },

  async logout(): Promise<void> {
    await tokenStorage.remove();
  },
};
