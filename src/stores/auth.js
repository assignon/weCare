import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import notificationService from '@/services/notificationService'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const error = ref(null)
  const loading = ref(false)
  const authInitialized = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isShopper = computed(() => user.value?.role === 'SHOPPER')

  // Clear all authentication state
  function clearAuthState() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    // Disconnect notification service
    notificationService.disconnect()
  }

  // Initialize authentication state
  async function initAuth() {
    if (accessToken.value) {
      try {
        await fetchUserData()
        
        // Initialize notification service if user is authenticated
        if (user.value?.id) {
          notificationService.initWebSocket(user.value.id)
          await notificationService.requestNotificationPermission()
        }
      } catch (error) {
        // If token is invalid or expired, clear auth state
        clearAuthState()
      }
    }
    authInitialized.value = true
    return isAuthenticated.value
  }

  // Check authentication state
  async function checkAuth() {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      clearAuthState()
      return false
    }
    
    accessToken.value = token
    refreshToken.value = localStorage.getItem('refresh_token')
    
    try {
      if (token) {
        const isValid = await apiService.verifyToken(token)
          .then(() => true)
          .catch(() => false)
          
        if (!isValid) {
          clearAuthState()
          return false
        }
        
        await fetchUserData()
        return true
      }
      return false
    } catch (err) {
      console.log('Token invalid or expired')
      clearAuthState()
      return false
    }
  }

  async function login({ email, password }) {
    error.value = null
    loading.value = true
    
    try {
      const response = await apiService.login({ email, password })
      const { access, refresh } = response.data
      
      accessToken.value = access
      refreshToken.value = refresh
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      
      await fetchUserData()
      
      // Verify user is a shopper
      if (!isShopper.value) {
        error.value = 'Access denied. Only shoppers can access this application.'
        clearAuthState()
        return false
      }
      
      // Initialize notification service after successful login
      if (user.value?.id) {
        notificationService.initWebSocket(user.value.id)
        await notificationService.requestNotificationPermission()
      }
      
      return true
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle specific error cases
      if (err.response) {
        const status = err.response.status
        
        // Handle 401 Unauthorized (invalid credentials)
        if (status === 401) {
          error.value = 'Invalid email or password. Please try again.'
        } 
        // Handle 400 Bad Request (validation errors)
        else if (status === 400) {
          const data = err.response.data
          if (typeof data === 'object') {
            // Format validation errors
            error.value = Object.entries(data)
              .map(([field, errors]) => {
                const fieldName = field.charAt(0).toUpperCase() + field.slice(1)
                const errorMsg = Array.isArray(errors) ? errors.join(', ') : errors
                return `${fieldName}: ${errorMsg}`
              })
              .join('\n')
          } else {
            error.value = data || 'Invalid login request'
          }
        } 
        // Handle other error statuses
        else {
          error.value = err.response.data?.detail || 'An error occurred during login'
        }
      } else {
        // Network errors or other issues
        error.value = 'Connection error. Please check your internet connection.'
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUserData() {
    if (!accessToken.value) return null
    
    try {
      const response = await apiService.getUserData()
      user.value = response.data
      
      // Initialize notification service if not already connected
      if (user.value?.id && !notificationService.isConnected()) {
        notificationService.initWebSocket(user.value.id)
      }
      
      return user.value
    } catch (err) {
      console.error('Error fetching user data:', err)
      user.value = null
      
      // If unauthorized, token is invalid
      if (err.response?.status === 401) {
        clearAuthState()
      }
      
      throw err
    }
  }
    
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      // Add shopper role and clean up data
      const shopperData = {
        ...userData,
        role: 'SHOPPER'
      }
      
      // Remove confirmation password field
      delete shopperData.confirmPassword
      
      console.log('Registration data being sent:', shopperData)
      
      const response = await apiService.register(shopperData)
      console.log('Registration response:', response)
      
      // Optionally automatically log in the user
      if (response.data) {
        // If we get tokens back in the response
        if (response.data.tokens) {
          accessToken.value = response.data.tokens.access
          refreshToken.value = response.data.tokens.refresh
          localStorage.setItem('access_token', accessToken.value)
          localStorage.setItem('refresh_token', refreshToken.value)
          
          if (response.data.user) {
            user.value = response.data.user
          } else {
            await fetchUserData()
          }
          
          return true
        } else {
          // Otherwise, redirect to login
          router.push({ 
            name: 'Login', 
            query: { registered: true }
          })
          return true
        }
      }
      
      return true
    } catch (err) {
      console.error('Registration error:', err)
      
      // Log the full error for debugging
      if (err.response) {
        console.error('API Error Response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        })
      }
      
      if (err.response?.data && typeof err.response.data === 'object') {
        // Format validation errors from Django REST Framework
        const errorMessages = Object.entries(err.response.data)
          .map(([field, errors]) => {
            // Prettier field names for display
            const fieldMap = {
              'first_name': 'First Name',
              'last_name': 'Last Name',
              'email': 'Email',
              'password': 'Password',
              'mobile': 'Mobile',
              'non_field_errors': 'Error'
            }
            
            const displayField = fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1)
            return `${displayField}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
          })
          .join('\n')
        error.value = errorMessages
      } else if (err.response?.data && typeof err.response.data === 'string') {
        // Handle string errors
        error.value = err.response.data
      } else if (err.response?.status === 401) {
        error.value = 'Authentication error: The registration endpoint requires authentication or configuration. Please contact support.'
      } else if (err.message) {
        // Handle network errors
        error.value = `Connection error: ${err.message}`
      } else {
        // Generic error
        error.value = 'Registration failed. Please try again later.'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(redirect = true) {
    loading.value = true
    
    try {
      // Call logout API if we have a refresh token
      if (refreshToken.value) {
        await apiService.logout({ refresh: refreshToken.value })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear auth state, even if API call fails
      clearAuthState()
      loading.value = false
      
      // Redirect to login page if needed
      if (redirect) {
        router.push('/login')
      }
    }
  }

  // Initialize auth on store creation
  initAuth().catch(err => {
    console.error('Auth initialization error:', err)
  })

  return {
    user,
    isAuthenticated,
    isShopper,
    error,
    loading,
    authInitialized,
    login,
    logout,
    register,
    fetchUserData,
    checkAuth,
    initAuth
  }
}) 