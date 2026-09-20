import api from './api';

export const reportService = {
  // Resident report creation
  createReport: async (reportData) => {
    // reportData: { target_type, target_id, reason, description }
    const response = await api.post('/reports/', reportData);
    return response.data;
  },

  // Get current user's submitted reports
  getMyReports: async (page = 1) => {
    const response = await api.get(`/reports/my/?page=${page}`);
    return response.data;
  },
};

export default reportService;
