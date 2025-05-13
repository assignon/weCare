import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const error = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login({ email, password }) {
    error.value = null
    loading.value = true
    try {
      const response = await axios.post('/api/auth/token/', { email, password })
      const { access, refresh } = response.data
      accessToken.value = access
      refreshToken.value = refresh
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      await fetchUserData()
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed. Please check your credentials.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUserData() {
    if (!accessToken.value) return
    try {
      const response = await axios.get('/api/accounts/profile/', {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      })
      user.value = response.data
    } catch (err) {
      user.value = null
      error.value = 'Failed to fetch user data.'
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return {
    user,
    isAuthenticated,
    error,
    loading,
    login,
    logout,
    fetchUserData
  }
}) 