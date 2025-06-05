import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import notificationService from '@/services/notificationService'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const unreadCount = ref(0)

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.is_read)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.is_read)
  )

  const hasUnreadNotifications = computed(() => unreadCount.value > 0)

  // Actions
  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getNotifications()
      notifications.value = response.data.results || response.data
      // Update unread count from the fetched notifications
      unreadCount.value = notifications.value.filter(n => !n.is_read).length
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationsCount()
      unreadCount.value = response.data.unread_count || 0
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark notification as read'
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      
      // Update local state
      notifications.value.forEach(notification => {
        notification.is_read = true
      })
      unreadCount.value = 0
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark all notifications as read'
      console.error('Error marking all notifications as read:', err)
    }
  }

  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.is_read) {
      unreadCount.value++
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    notifications.value = []
    loading.value = false
    error.value = null
    unreadCount.value = 0
  }

  // Initialize store and WebSocket connection
  const init = async () => {
    try {
      // Fetch initial notification count
      await fetchUnreadCount()
      
      // Initialize WebSocket connection if user is authenticated
      const authStore = useAuthStore()
      if (authStore.isAuthenticated && authStore.user?.id) {
        console.log('Initializing WebSocket for shopper:', authStore.user.id)
        notificationService.initWebSocket(authStore.user.id)
        await notificationService.requestNotificationPermission()
      }
    } catch (error) {
      console.error('Error initializing notification store:', error)
    }
  }

  return {
    // State
    notifications,
    loading,
    error,
    unreadCount,

    // Getters
    unreadNotifications,
    readNotifications,
    hasUnreadNotifications,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearError,
    resetStore,
    init
  }
}) 