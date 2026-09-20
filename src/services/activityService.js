import api from './api';

export const activityService = {
  getUserActivity: async ({ page = 1, action = '', entity_type = '' } = {}) => {
    let url = `/activity/?page=${page}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (entity_type) url += `&entity_type=${encodeURIComponent(entity_type)}`;
    const response = await api.get(url);
    return response.data;
  },

  getProfileSummary: async () => {
    const response = await api.get('/auth/profile-summary/');
    return response.data;
  },
};

export default activityService;
