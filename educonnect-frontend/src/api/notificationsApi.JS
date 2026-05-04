import apiClient from './apiClient';

const BASE = '/notifications';

const notificationsApi = {
  list: async ({ page = 0, size = 20 } = {}) => {
    return apiClient.get(BASE, { params: { page, size } });
  },
  unreadCount: async () => {
    return apiClient.get(`${BASE}/unread-count`);
  },
  markAllSeen: async () => {
    return apiClient.post(`${BASE}/mark-all-seen`);
  },
  markSeen: async (nid) => {
    return apiClient.post(`${BASE}/mark-seen`, {nid});
  }
};

export default notificationsApi;