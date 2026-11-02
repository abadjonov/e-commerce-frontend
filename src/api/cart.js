import { apiClient } from './client'

export const cartAPI = {
  getCart: () => apiClient.get('/api/v1/cart/'),
  getCartCount: () => apiClient.get('/api/v1/cart/count/'),
  addItem: (data) => apiClient.post('/api/v1/cart/items/', data), // { variant_id, quantity }
  updateItem: (itemId, data) => apiClient.patch(`/api/v1/cart/items/${itemId}/`, data), // { quantity }
  removeItem: (itemId) => apiClient.delete(`/api/v1/cart/items/${itemId}/`),
  clearCart: () => apiClient.delete('/api/v1/cart/clear/'),
  mergeCart: (sessionKey) => apiClient.post('/api/v1/cart/merge/', { guest_session_key: sessionKey }),
}
