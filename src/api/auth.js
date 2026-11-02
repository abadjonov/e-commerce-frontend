import { apiClient } from './client'

export const authAPI = {
  register: (data) => apiClient.post('/api/v1/auth/register/', data),
  verifyOtp: (data) => apiClient.post('/api/v1/auth/verify-otp/', data),
  sendOtp: (data) => apiClient.post('/api/v1/auth/send-otp/', data),
  resendOtp: (data) => apiClient.post('/api/v1/auth/resend-otp/', data),
  login: (data) => apiClient.post('/api/v1/auth/login/', data),
  getProfile: () => apiClient.get('/api/v1/auth/me/'),
  updateProfile: (data) => apiClient.patch('/api/v1/auth/me/', data),
}
