import axios from 'axios'

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:8000/api'

// Function to refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'))
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/token/refresh/`, 
      { refresh: refreshToken }
    )
    
    const { access } = response.data
    localStorage.setItem('access_token', access)
    return access
  } catch (error) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return Promise.reject(error)
  }
}

// Setup axios interceptors to handle token refreshing
export function setupAuthInterceptors(axiosInstance) {
  // Keep track of if we're refreshing to prevent multiple refreshes
  let isRefreshing = false
  // Store callbacks to retry requests after token refresh
  let refreshSubscribers = []

  // Function to add retry callbacks
  function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback)
  }

  // Function to retry requests after token refresh
  function onTokenRefreshed(newToken) {
    refreshSubscribers.forEach(callback => callback(newToken))
    refreshSubscribers = []
  }

  // Function to reject requests after refresh failure
  function onRefreshFailure(error) {
    refreshSubscribers.forEach(callback => callback(null, error))
    refreshSubscribers = []
  }

  // Request interceptor - add token to requests
  axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  // Response interceptor - handle token refresh on 401
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config
      
      // If we get a 401 and we haven't tried to refresh yet
      if (
        error.response?.status === 401 && 
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If already refreshing, wait for new token
          try {
            const newToken = await new Promise((resolve, reject) => {
              subscribeTokenRefresh(token => {
                if (token) {
                  resolve(token)
                } else {
                  reject(new Error('Failed to refresh token'))
                }
              })
            })
            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return axiosInstance(originalRequest)
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }

        // Mark as retrying and start refresh
        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken()
          
          // Update original request and notify subscribers
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          onTokenRefreshed(newToken)
          
          // Reset refreshing state and retry request
          isRefreshing = false
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          // Notify subscribers of failure
          isRefreshing = false
          onRefreshFailure(refreshError)
          
          // Clear auth state on refresh failure
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          
          // Redirect to login or dispatch logout
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return axiosInstance
} 