import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register/', data);
    if (response.data.tokens) {
      localStorage.setItem('foodloop_access_token', response.data.tokens.access);
      localStorage.setItem('foodloop_refresh_token', response.data.tokens.refresh);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.tokens) {
      localStorage.setItem('foodloop_access_token', response.data.tokens.access);
      localStorage.setItem('foodloop_refresh_token', response.data.tokens.refresh);
    }
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('foodloop_refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (e) {
      // Ignore errors on logout endpoint
    } finally {
      localStorage.removeItem('foodloop_access_token');
      localStorage.removeItem('foodloop_refresh_token');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async getApartments() {
    const response = await api.get('/apartments/');
    return response.data;
  }
};

export default authService;
