import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token and Cart Session Key
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    const sessionKey = localStorage.getItem('cart_session_key')
    if (sessionKey) {
      config.headers['X-Session-Key'] = sessionKey
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Capture X-Session-Key & Handle 401 Refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // Capture session key from headers if provided
    const newSessionKey =
      response.headers['x-session-key'] ||
      (response.headers.get && response.headers.get('x-session-key'))
    if (newSessionKey) {
      localStorage.setItem('cart_session_key', newSessionKey)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/api/v1/auth/token/refresh/') || originalRequest.url.includes('/api/v1/auth/login/')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        const newAccess = response.data.access
        localStorage.setItem('access_token', newAccess)
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
