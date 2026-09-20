import api from './api';

export const adminService = {
  // Dashboard Metrics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  // User Management
  getUsers: async ({ page = 1, search = '', role = 'ALL', is_active = 'ALL', apartment_id = 'ALL' } = {}) => {
    let url = `/admin/users/?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role && role !== 'ALL') url += `&role=${role}`;
    if (is_active && is_active !== 'ALL') url += `&is_active=${is_active}`;
    if (apartment_id && apartment_id !== 'ALL') url += `&apartment_id=${apartment_id}`;
    const response = await api.get(url);
    return response.data;
  },

  getUserDetail: async (id) => {
    const response = await api.get(`/admin/users/${id}/`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await api.post(`/admin/users/${id}/activate/`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.post(`/admin/users/${id}/deactivate/`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.post(`/admin/users/${id}/role/`, { role });
    return response.data;
  },

  // Apartment Management
  getApartments: async () => {
    const response = await api.get('/admin/apartments/');
    return response.data;
  },

  createApartment: async (data) => {
    const response = await api.post('/admin/apartments/', data);
    return response.data;
  },

  updateApartment: async (id, data) => {
    const response = await api.patch(`/admin/apartments/${id}/`, data);
    return response.data;
  },

  // Shares Management & Moderation
  getShares: async ({ page = 1, status = 'ALL', apartment_id = 'ALL', search = '' } = {}) => {
    let url = `/admin/shares/?page=${page}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    if (apartment_id && apartment_id !== 'ALL') url += `&apartment_id=${apartment_id}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  },

  moderateShare: async (id, reason) => {
    const response = await api.post(`/admin/shares/${id}/moderate/`, { reason });
    return response.data;
  },

  // Moderation & Reports Management
  getReports: async ({ page = 1, status = 'ALL', target_type = 'ALL', reason = 'ALL' } = {}) => {
    let url = `/reports/admin/list/?page=${page}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    if (target_type && target_type !== 'ALL') url += `&target_type=${target_type}`;
    if (reason && reason !== 'ALL') url += `&reason=${reason}`;
    const response = await api.get(url);
    return response.data;
  },

  reviewReport: async (id) => {
    const response = await api.post(`/reports/admin/${id}/review/`);
    return response.data;
  },

  resolveReport: async (id, { action = 'NONE', resolution_note = '' } = {}) => {
    const response = await api.post(`/reports/admin/${id}/resolve/`, { action, resolution_note });
    return response.data;
  },

  dismissReport: async (id, resolution_note = '') => {
    const response = await api.post(`/reports/admin/${id}/dismiss/`, { resolution_note });
    return response.data;
  },

  // Audit Log
  getAuditActivity: async ({ page = 1, action = '', entity_type = '', search = '' } = {}) => {
    let url = `/admin/activity/?page=${page}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (entity_type) url += `&entity_type=${encodeURIComponent(entity_type)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  },
};

export default adminService;
