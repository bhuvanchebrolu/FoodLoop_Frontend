import api from './api';

export const shareService = {
  // Get community shares feed
  getShares: async (params = {}) => {
    const response = await api.get('/shares/', { params });
    return response.data;
  },

  // Create new food share
  createShare: async (shareData) => {
    const response = await api.post('/shares/create/', shareData);
    return response.data;
  },

  // Get share detail
  getShareDetail: async (id) => {
    const response = await api.get(`/shares/${id}/`);
    return response.data;
  },

  // Cancel food share
  cancelShare: async (id) => {
    const response = await api.post(`/shares/${id}/cancel/`);
    return response.data;
  },

  // Submit request for food share
  requestShare: async (id, requestData) => {
    const response = await api.post(`/shares/${id}/request/`, requestData);
    return response.data;
  },

  // Save / Unsave share to favorites
  toggleSaveShare: async (id) => {
    const response = await api.post(`/shares/${id}/save/`);
    return response.data;
  },

  // Get current user's owned shares
  getMyShares: async () => {
    const response = await api.get('/shares/my-shares/');
    return response.data;
  },

  // Get current user's outgoing requests
  getMyRequests: async () => {
    const response = await api.get('/shares/my-requests/');
    return response.data;
  },

  // Approve a share request
  approveRequest: async (requestId) => {
    const response = await api.post(`/shares/requests/${requestId}/approve/`);
    return response.data;
  },

  // Reject a share request
  rejectRequest: async (requestId) => {
    const response = await api.post(`/shares/requests/${requestId}/reject/`);
    return response.data;
  },

  // Cancel an outgoing request
  cancelRequest: async (requestId) => {
    const response = await api.post(`/shares/requests/${requestId}/cancel/`);
    return response.data;
  },

  // Complete handover for an approved request
  completeRequest: async (requestId) => {
    const response = await api.post(`/shares/requests/${requestId}/complete/`);
    return response.data;
  },
};

export default shareService;
