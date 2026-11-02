import { apiClient } from './client'

export const reviewsAPI = {
  getSummary: (productId) => apiClient.get(`/api/v1/reviews/products/${productId}/summary/`),
  getReviews: (productId, params) => apiClient.get(`/api/v1/reviews/products/${productId}/`, { params }),
  createReview: (productId, data) => apiClient.post(`/api/v1/reviews/products/${productId}/`, data),
  voteReview: (reviewId, data) => apiClient.post(`/api/v1/reviews/${reviewId}/vote/`, data),
}
