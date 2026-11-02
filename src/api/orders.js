import { apiClient } from './client'

export const ordersAPI = {
  previewCheckout: (data) => apiClient.post('/api/v1/orders/checkout/preview/', data),
  validateCoupon: (data) => apiClient.post('/api/v1/orders/coupons/validate/', data),
  createOrder: (data) => apiClient.post('/api/v1/orders/', data),
  getOrders: (params) => apiClient.get('/api/v1/orders/', { params }),
  getOrderDetail: (orderNumber) => apiClient.get(`/api/v1/orders/${orderNumber}/`),
  getOrderTracking: (orderNumber) => apiClient.get(`/api/v1/orders/${orderNumber}/tracking/`),
  cancelOrder: (orderNumber, data) => apiClient.post(`/api/v1/orders/${orderNumber}/cancel/`, data),
  getInvoice: (orderNumber) => apiClient.get(`/api/v1/orders/${orderNumber}/invoice/`),
}
