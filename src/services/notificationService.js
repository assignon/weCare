import { useNotificationStore } from '@/stores/notification'

class NotificationService {
  constructor() {
    this.socket = null
    this.reconnectInterval = null
    this.maxReconnectAttempts = 5
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000 // Start with 1 second
    this.heartbeatInterval = null
    this.snackbarCallbacks = []
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
        this.startHeartbeat()
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
        this.stopHeartbeat()
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

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }))
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Handle incoming notification messages
  handleNotificationMessage(data) {
    const notificationStore = useNotificationStore()
    
    if (data.type === 'notification') {
      // Add new notification to store
      const notification = {
        id: data.data?.notification_id || Date.now(),
        title: data.data?.title || 'New Notification',
        message: data.message || data.data?.message,
        type: data.data?.type || 'info',
        severity: data.data?.severity || 'info',
        persistent: data.data?.persistent || false,
        timeout: data.data?.timeout || 5000,
        reference_id: data.data?.reference_id,
        reference_type: data.data?.reference_type,
        is_read: false,
        created_at: data.data?.created_at || new Date().toISOString()
      }
      
      notificationStore.addNotification(notification)
      
      // Trigger snackbar display
      this.showSnackbar(notification)
      
      // Show browser notification if permission granted
      this.showBrowserNotification(notification)
    } else if (data.type === 'broadcast') {
      // Handle broadcast messages
      const broadcastNotification = {
        id: Date.now(),
        title: 'System Announcement',
        message: data.message,
        type: 'info',
        severity: 'info',
        persistent: false,
        timeout: 10000, // Broadcast messages show for 10 seconds
        is_read: false,
        created_at: new Date().toISOString()
      }
      
      this.showSnackbar(broadcastNotification)
    } else if (data.type === 'heartbeat_response') {
      // Handle heartbeat response
      console.debug('Heartbeat response received')
    }
  }

  // Register snackbar callback for displaying notifications
  registerSnackbarCallback(callback) {
    this.snackbarCallbacks.push(callback)
  }

  // Unregister snackbar callback
  unregisterSnackbarCallback(callback) {
    const index = this.snackbarCallbacks.indexOf(callback)
    if (index > -1) {
      this.snackbarCallbacks.splice(index, 1)
    }
  }

  // Show snackbar notification
  showSnackbar(notification) {
    this.snackbarCallbacks.forEach(callback => {
      try {
        callback(notification)
      } catch (error) {
        console.error('Error calling snackbar callback:', error)
      }
    })
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.persistent,
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

      // Auto close non-persistent notifications after timeout
      if (!notification.persistent && notification.timeout > 0) {
        setTimeout(() => {
          browserNotification.close()
        }, notification.timeout)
      }
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
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return Notification.permission === 'granted'
    }
    return false
  }

  // Send ping to server
  ping() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'ping' }))
    }
  }

  // Disconnect WebSocket
  disconnect() {
    this.stopHeartbeat()
    
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

  // Get connection status
  getConnectionStatus() {
    if (!this.socket) return 'disconnected'
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'closed'
      default:
        return 'unknown'
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService 