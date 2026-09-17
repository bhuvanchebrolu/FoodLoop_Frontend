import api from './api';

export const foodService = {
  async getFoods(params = {}) {
    const response = await api.get('/foods/', { params });
    return response.data;
  },

  async getFoodDashboard() {
    const response = await api.get('/foods/dashboard/');
    return response.data;
  },

  async getFoodById(id) {
    const response = await api.get(`/foods/${id}/`);
    return response.data;
  },

  async createFood(formData) {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/foods/', formData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  async updateFood(id, formData) {
    const isFormData = formData instanceof FormData;
    const response = await api.patch(`/foods/${id}/`, formData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  async deleteFood(id) {
    const response = await api.delete(`/foods/${id}/`);
    return response.data;
  }
};

export default foodService;
