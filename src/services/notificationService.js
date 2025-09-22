import { useNotificationStore } from "@/stores/notification";
import fcmService from "./fcmService";

class NotificationService {
  constructor() {
    this.socket = null;
    this.reconnectInterval = null;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Start with 1 second
    this.heartbeatInterval = null;
    this.snackbarCallbacks = [];
    this.fcmInitialized = false;
  }

  // Initialize notification service (FCM + WebSocket)
  async init(userId) {
    if (!userId) return;

    // Initialize FCM as primary notification method
    try {
      this.fcmInitialized = await fcmService.initialize();

      if (this.fcmInitialized) {
        console.log("FCM initialized successfully");
        // Set notification callback for FCM
        fcmService.setNotificationCallback((notification) => {
          this.handleNotificationMessage({
            type: "notification",
            data: notification,
          });
        });
      } else {
        console.warn("FCM initialization failed, will rely on WebSocket only");
      }
    } catch (error) {
      console.error("FCM initialization error:", error);
    }

    // Initialize WebSocket as enhancement for immediate UI updates
    this.initWebSocket(userId);
  }

  // Initialize WebSocket connection for real-time notifications
  initWebSocket(userId) {
    if (!userId) return;

    try {
      // Get JWT token from localStorage for authentication
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        console.warn('No JWT token found, WebSocket connection may be anonymous');
      }

      // Use environment-aware WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Handle local development domains (.local) by pointing to localhost:8000
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.local');
      const host = isLocalDev ? 'localhost:8000' : window.location.host;
      
      // Add JWT token as query parameter for authentication
      const wsUrl = token 
        ? `${protocol}//${host}/ws/notifications/?token=${token}` 
        : `${protocol}//${host}/ws/notifications/`;
      
      console.log('🔌 Shopper connecting to WebSocket:', wsUrl.replace(/token=[^&]+/, 'token=***'));
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("Shopper notification WebSocket connected");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNotificationMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        console.log("Shopper notification WebSocket disconnected");
        this.stopHeartbeat();
        if (!event.wasClean) {
          this.handleReconnect(userId);
        }
      };

      this.socket.onerror = (error) => {
        console.error("Shopper notification WebSocket error:", error);
      };
    } catch (error) {
      console.error("Error initializing shopper WebSocket:", error);
      this.handleReconnect(userId);
    }
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: "heartbeat",
            timestamp: Date.now(),
          })
        );
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle incoming notification messages
  handleNotificationMessage(data) {
    console.log('📩 Shopper received WebSocket notification:', data)
    
    const notificationStore = useNotificationStore();

    if (data.type === "notification") {
      // Check if this is a restock notification and skip it
      const message = data.message || data.data?.message || '';
      const title = data.data?.title || '';
      
      // Skip only specific restock notification types to prevent duplicate snackbars
      // Allow general stock update notifications but skip restock request confirmations
      if ((message.toLowerCase().includes('notify you when') && message.toLowerCase().includes('back in stock')) ||
          (title.toLowerCase().includes('restock') && message.toLowerCase().includes('notify you when'))) {
        console.log('🚫 Skipping restock request confirmation to prevent duplicate snackbar');
        return;
      }

      // Add new notification to store
      const notification = {
        id: data.data?.notification_id || Date.now(),
        title: data.data?.title || "New Notification",
        message: data.message || data.data?.message,
        type: data.data?.type || "info",
        severity: data.data?.severity || "info",
        persistent: data.data?.persistent || true, // Make notifications persistent by default
        timeout: data.data?.timeout || 0, // 0 means persistent
        reference_id: data.data?.reference_id,
        reference_type: data.data?.reference_type,
        is_read: false,
        created_at: data.data?.created_at || new Date().toISOString(),
      };

      console.log('📋 Processed notification:', notification)

      notificationStore.addNotification(notification);

      // Trigger snackbar display
      this.showSnackbar(notification);

      // If order-related, optionally refresh order list/store (non-blocking)
      try {
        if (notification.reference_type === 'Order' || (notification.type && notification.type.toLowerCase() === 'order')) {
          import('@/stores/order').then(mod => {
            if (mod && mod.useOrderStore) {
              const ordersStore = mod.useOrderStore()
              ordersStore.fetchOrders?.().catch(() => {})
            }
          }).catch(() => {})
        }
      } catch (e) {}

      // Show browser notification if permission granted
      this.showBrowserNotification(notification);
    } else if (data.type === "chat_message") {
      const chat = data.data || {}
      const chatNotification = {
        id: chat.message_id || Date.now(),
        title: "New Chat Message",
        message: chat.content || data.message || "You have a new message",
        type: "info",
        severity: "info",
        persistent: false,
        timeout: 5000,
        is_read: false,
        created_at: chat.created_at || new Date().toISOString(),
      };
      this.showSnackbar(chatNotification);
    } else if (data.type === "broadcast") {
      // Handle broadcast messages
      const broadcastNotification = {
        id: Date.now(),
        title: "System Announcement",
        message: data.message,
        type: "info",
        severity: "info",
        persistent: false,
        timeout: 10000, // Broadcast messages show for 10 seconds
        is_read: false,
        created_at: new Date().toISOString(),
      };

      this.showSnackbar(broadcastNotification);
    } else if (data.type === "heartbeat_response") {
      // Handle heartbeat response
      console.debug("Heartbeat response received");
    }
  }

  // Register snackbar callback for displaying notifications
  registerSnackbarCallback(callback) {
    this.snackbarCallbacks.push(callback);
  }

  // Unregister snackbar callback
  unregisterSnackbarCallback(callback) {
    const index = this.snackbarCallbacks.indexOf(callback);
    if (index > -1) {
      this.snackbarCallbacks.splice(index, 1);
    }
  }

  // Show snackbar notification
  showSnackbar(notification) {
    this.snackbarCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error calling snackbar callback:", error);
      }
    });
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ("Notification" in window && Notification.permission === "granted") {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `notification-${notification.id}`,
        requireInteraction: notification.persistent,
        silent: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        // Navigate to notification if it has a reference
        if (notification.reference_type && notification.reference_id) {
          const linkMap = {
            Order: `/order-status/${notification.reference_id}`,
            Product: `/product/${notification.reference_id}`,
            Profile: "/profile",
          };
          const link = linkMap[notification.reference_type];
          if (link) {
            window.location.href = link;
          } else {
            window.location.href = "/notifications";
          }
        } else {
          window.location.href = "/notifications";
        }
        browserNotification.close();
      };

      // Auto close non-persistent notifications after timeout
      if (!notification.persistent && notification.timeout > 0) {
        setTimeout(() => {
          browserNotification.close();
        }, notification.timeout);
      }
    }
  }

  // Handle WebSocket reconnection
  handleReconnect(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectInterval = setTimeout(() => {
      this.initWebSocket(userId);
    }, this.reconnectDelay);

    // Exponential backoff with max delay of 30 seconds
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return Notification.permission === "granted";
    }
    return false;
  }

  // Send ping to server
  ping() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "ping" }));
    }
  }

  // Disconnect WebSocket and FCM
  disconnect() {
    this.stopHeartbeat();

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;

    // Unregister FCM token and cleanup
    if (this.fcmInitialized) {
      fcmService.unregisterToken();
      fcmService.removeNotificationCallback();
      this.fcmInitialized = false;
    }
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Get connection status
  getConnectionStatus() {
    if (!this.socket) return "disconnected";

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "closed";
      default:
        return "unknown";
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
