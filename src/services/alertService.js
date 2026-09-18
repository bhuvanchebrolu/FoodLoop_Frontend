import api from './api';

export const alertService = {
  async getAlerts(params = {}) {
    const response = await api.get('/alerts/', { params });
    return response.data;
  },

  async getAlertSummary() {
    const response = await api.get('/alerts/summary/');
    return response.data;
  }
};

export default alertService;
