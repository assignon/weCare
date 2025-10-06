import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import notificationService from '@/services/notificationService'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(null)
  const unreadCount = ref(0)
  
  // Pagination state
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true
  })

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.is_read)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.is_read)
  )

  const hasUnreadNotifications = computed(() => unreadCount.value > 0)

  // Actions
  const fetchNotifications = async (append = false) => {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      pagination.value.page = 1
    }
    error.value = null
    
    try {
      const params = {
        page: pagination.value.page,
        page_size: pagination.value.pageSize
      }
      
      const response = await apiService.getNotifications(params)
      const newNotifications = response.data.results || response.data
      
      if (append) {
        notifications.value = [...notifications.value, ...newNotifications]
      } else {
        notifications.value = newNotifications
      }
      
      // Update pagination info
      pagination.value.total = response.data.count || notifications.value.length
      pagination.value.hasMore = notifications.value.length < pagination.value.total
      
      // Update unread count from the fetched notifications if not appending
      if (!append) {
        unreadCount.value = notifications.value.filter(n => !n.is_read).length
      }
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMoreNotifications = async () => {
    if (!pagination.value.hasMore || loadingMore.value) return
    
    pagination.value.page += 1
    await fetchNotifications(true)
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

  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      const notification = notifications.value[index]
      notifications.value.splice(index, 1)
      if (!notification.is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    notifications.value = []
    loading.value = false
    loadingMore.value = false
    error.value = null
    unreadCount.value = 0
    pagination.value = {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    }
  }

  // Initialize store and notification services (FCM + WebSocket)
  const init = async () => {
    try {
      // Fetch initial notification count
      await fetchUnreadCount()
      
      // Initialize FCM and WebSocket connection if user is authenticated
      const authStore = useAuthStore()
      if (authStore.isAuthenticated && authStore.user?.id) {
        console.log('Initializing notification services for shopper:', authStore.user.id)
        await notificationService.init(authStore.user.id)
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
    loadingMore,
    error,
    unreadCount,
    pagination,

    // Getters
    unreadNotifications,
    readNotifications,
    hasUnreadNotifications,

    // Actions
    fetchNotifications,
    loadMoreNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearError,
    resetStore,
    init
  }
}) 