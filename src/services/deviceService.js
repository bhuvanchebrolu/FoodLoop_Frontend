import api from './api';

export const deviceService = {
  // Register or update FCM token on Django backend
  registerDevice: async (token, deviceName = 'Browser') => {
    const response = await api.post('/devices/register/', {
      token,
      device_name: deviceName,
    });
    return response.data;
  },

  // Unregister / deactivate device token on Django backend
  unregisterDevice: async (deviceId) => {
    const response = await api.delete(`/devices/${deviceId}/`);
    return response.data;
  },

  // List active devices registered for current authenticated user
  getDevices: async () => {
    const response = await api.get('/devices/');
    return response.data;
  },

  // Trigger a development test push notification (DEBUG mode only)
  sendDevTestPush: async (title, body) => {
    const response = await api.post('/dev/test-push/', { title, body });
    return response.data;
  },
};

export default deviceService;
