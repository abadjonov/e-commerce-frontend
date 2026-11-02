import { apiClient } from './client'

export const paymentsAPI = {
  initialize: (data) => apiClient.post('/api/v1/payments/initialize/', data),
  getPaymentDetail: (paymentNumber) => apiClient.get(`/api/v1/payments/${paymentNumber}/`),
  getPayments: (params) => apiClient.get('/api/v1/payments/', { params }),
  cancelPayment: (paymentNumber, data) => apiClient.post(`/api/v1/payments/${paymentNumber}/cancel/`, data),
  getSavedCards: () => apiClient.get('/api/v1/payments/cards/'),
  createSavedCard: (data) => apiClient.post('/api/v1/payments/cards/', data),
  verifySavedCard: (pk, data) => apiClient.post(`/api/v1/payments/cards/${pk}/verify/`, data),
  setDefaultSavedCard: (pk) => apiClient.post(`/api/v1/payments/cards/${pk}/default/`),
  deleteSavedCard: (pk) => apiClient.delete(`/api/v1/payments/cards/${pk}/`),
  payWithCard: (data) => apiClient.post('/api/v1/payments/pay-with-card/', data),
}
