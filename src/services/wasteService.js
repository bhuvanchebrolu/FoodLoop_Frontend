import api from './api';

export const wasteService = {
  async wasteFood(id, data) {
    const response = await api.post(`/foods/${id}/waste/`, data);
    return response.data;
  },

  async getWasteHistory(id = null) {
    const url = id ? `/foods/${id}/waste-history/` : '/waste/';
    const response = await api.get(url);
    return response.data;
  }
};

export default wasteService;
