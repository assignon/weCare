import { useNotificationStore } from '@/stores/notification'

class NotificationService {
  constructor() {
    this.socket = null
    this.reconnectInterval = null
    this.maxReconnectAttempts = 5
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000 // Start with 1 second
  }

  // Initialize WebSocket connection for real-time notifications
  initWebSocket(userId) {
    if (!userId) return

    try {
      const wsUrl = `ws://localhost:8000/ws/notifications/`
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('Notification WebSocket connected')
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleNotificationMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = (event) => {
        console.log('Notification WebSocket disconnected')
        if (!event.wasClean) {
          this.handleReconnect(userId)
        }
      }

      this.socket.onerror = (error) => {
        console.error('Notification WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
      this.handleReconnect(userId)
    }
  }

  // Handle incoming notification messages
  handleNotificationMessage(data) {
    const notificationStore = useNotificationStore()
    
    if (data.type === 'notification_message') {
      // Add new notification to store
      const notification = {
        id: data.data?.notification_id || Date.now(),
        title: data.data?.title || 'New Notification',
        message: data.message || data.data?.message,
        type: data.data?.type || 'info',
        reference_id: data.data?.reference_id,
        reference_type: data.data?.reference_type,
        is_read: false,
        created_at: data.data?.created_at || new Date().toISOString()
      }
      
      notificationStore.addNotification(notification)
      
      // Show browser notification if permission granted
      this.showBrowserNotification(notification)
    }
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      })

      browserNotification.onclick = () => {
        window.focus()
        // Navigate to notification if it has a reference
        if (notification.reference_type && notification.reference_id) {
          const linkMap = {
            'Order': `/order-status/${notification.reference_id}`,
            'Product': `/product/${notification.reference_id}`,
            'Profile': '/profile'
          }
          const link = linkMap[notification.reference_type]
          if (link) {
            window.location.href = link
          } else {
            window.location.href = '/notifications'
          }
        } else {
          window.location.href = '/notifications'
        }
        browserNotification.close()
      }

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close()
      }, 5000)
    }
  }

  // Handle WebSocket reconnection
  handleReconnect(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectInterval = setTimeout(() => {
      this.initWebSocket(userId)
    }, this.reconnectDelay)

    // Exponential backoff with max delay of 30 seconds
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close()
    }
    this.socket = null
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService 