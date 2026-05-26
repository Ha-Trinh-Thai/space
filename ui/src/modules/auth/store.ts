import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/shared/lib/api';
import router from '@/router';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));

  const isAuthenticated = computed(() => !!token.value);

  function setTokens(accessToken: string, refresh: string) {
    token.value = accessToken;
    refreshToken.value = refresh;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refresh);
  }

  function clearTokens() {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setTokens(res.data.access_token, res.data.refresh_token);
    user.value = res.data.user;
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/signup', { name, email, password });
    setTokens(res.data.access_token, res.data.refresh_token);
    user.value = res.data.user;
  }

  async function refresh() {
    if (!refreshToken.value) {
      clearTokens();
      return false;
    }
    try {
      const res = await api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', {
        refresh_token: refreshToken.value,
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      return true;
    } catch {
      clearTokens();
      return false;
    }
  }

  async function logout() {
    if (refreshToken.value) {
      await api.post('/auth/logout', { refresh_token: refreshToken.value }).catch(() => {});
    }
    clearTokens();
    router.push({ name: 'login' });
  }

  async function forgotPassword(email: string) {
    await api.post('/auth/forgot-password', { email });
  }

  async function resetPassword(resetToken: string, password: string) {
    await api.post('/auth/reset-password', { token: resetToken, password });
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const res = await api.get<User>('/auth/me');
      user.value = res.data;
    } catch {
      clearTokens();
    }
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    signup,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
    fetchUser,
    clearTokens,
  };
});
