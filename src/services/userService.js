import api from './api';

export const userService = {
  async updateProfile(data) {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  async getSettings() {
    const response = await api.get('/users/settings/');
    return response.data;
  },

  async updateSettings(data) {
    const response = await api.patch('/users/settings/', data);
    return response.data;
  }
};

export default userService;
