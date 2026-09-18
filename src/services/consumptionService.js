import api from './api';

export const consumptionService = {
  async consumeFood(id, data) {
    const response = await api.post(`/foods/${id}/consume/`, data);
    return response.data;
  },

  async getConsumptionHistory(id = null) {
    const url = id ? `/foods/${id}/consumption/` : '/consumption/';
    const response = await api.get(url);
    return response.data;
  }
};

export default consumptionService;
