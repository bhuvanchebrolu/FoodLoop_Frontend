import api from './api';

export const analyticsService = {
  getOverview: async (period = '30d') => {
    const response = await api.get(`/analytics/overview/?period=${period}`);
    return response.data;
  },

  getConsumptionData: async (period = '30d') => {
    const response = await api.get(`/analytics/consumption/?period=${period}`);
    return response.data;
  },

  getWasteData: async (period = '30d') => {
    const response = await api.get(`/analytics/waste/?period=${period}`);
    return response.data;
  },

  getSharingData: async (period = '30d') => {
    const response = await api.get(`/analytics/sharing/?period=${period}`);
    return response.data;
  },

  getImpactData: async (period = '30d') => {
    const response = await api.get(`/analytics/impact/?period=${period}`);
    return response.data;
  }
};

export default analyticsService;
