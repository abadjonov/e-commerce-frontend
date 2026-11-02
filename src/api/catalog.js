import { apiClient } from './client'

export const catalogAPI = {
  getCategories: () => apiClient.get('/api/v1/catalog/categories/'),
  getCategoryDetail: (slug) => apiClient.get(`/api/v1/catalog/categories/${slug}/`),
  getBrands: (params) => apiClient.get('/api/v1/catalog/brands/', { params }),
  getBrandDetail: (slug) => apiClient.get(`/api/v1/catalog/brands/${slug}/`),
  getProducts: (params) => apiClient.get('/api/v1/catalog/products/', { params }),
  getProductDetail: (slug) => apiClient.get(`/api/v1/catalog/products/${slug}/`),
  getProductVariant: (slug, sku) => apiClient.get(`/api/v1/catalog/products/${slug}/variants/${sku}/`),
  getFilters: (params) => apiClient.get('/api/v1/catalog/filters/', { params }),
  getSuggestions: (q) => apiClient.get('/api/v1/catalog/search/suggest/', { params: { q } }),
  getFeatured: () => apiClient.get('/api/v1/catalog/featured/'),
  getSellers: () => apiClient.get('/api/v1/catalog/sellers/'),
  applySeller: (data) => apiClient.post('/api/v1/catalog/sellers/apply/', data),
}
