import { apiClient } from './client'

export const notificationsAPI = {
  getNotifications: (params) => apiClient.get('/api/v1/notifications/', { params }),
  getUnreadCount: () => apiClient.get('/api/v1/notifications/unread-count/'),
  markAsRead: (id) => apiClient.post(`/api/v1/notifications/${id}/read/`),
  markAllAsRead: () => apiClient.post('/api/v1/notifications/read-all/'),
  clearRead: () => apiClient.delete('/api/v1/notifications/clear-read/'),
}
