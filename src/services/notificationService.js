import { useNotificationStore } from "@/stores/notification";
import fcmService from "./fcmService";

class NotificationService {
  constructor() {
    this.socket = null;
    this.reconnectInterval = null;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 10000; // Start with 10 seconds
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
        this.reconnectDelay = 10000;
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

  // Dispatch pharmacy events without showing snackbar
  dispatchPharmacyEvent(data) {
    const notification = data.data || {}
    const type = notification.type || notification.category || ''
    
    try {
      // Pharmacy search updates
      if (type === 'pharmacy_search' && notification.reference_type === 'MedicineRequest') {
        window.dispatchEvent(new CustomEvent('pharmacySearchUpdate', {
          detail: {
            eventType: notification.payload?.event_type,
            requestId: notification.reference_id,
            title: notification.title,
            message: data.message || notification.message,
            status: notification.payload?.status,
            progress: notification.payload?.progress,
            data: notification.payload
          }
        }))
      }
      
      // Pharmacy offers received
      if (type === 'pharmacy_offers' && notification.reference_type === 'MedicineRequest') {
        window.dispatchEvent(new CustomEvent('pharmacyOffersReceived', {
          detail: {
            requestId: notification.reference_id,
            offersCount: notification.payload?.offers_count,
            message: data.message || notification.message,
            hasActionButton: true,
            actionButton: notification.payload?.actions?.view_offers,
            timeoutSeconds: notification.payload?.actions?.view_offers?.timeout_seconds || 120
          }
        }))
      }
      
      // Pharmacy request updates
      if (type === 'pharmacy_request' && notification.reference_type === 'MedicineRequest') {
        if (notification.payload?.phase === 'dispatched') {
          window.dispatchEvent(new CustomEvent('pharmacyDispatched', {
            detail: {
              requestId: notification.reference_id,
              radiusKm: notification.payload?.radius_km
            }
          }))
        }
        
        if (notification.severity === 'warning') {
          window.dispatchEvent(new CustomEvent('pharmacyNoOffers', {
            detail: {
              requestId: notification.reference_id
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error dispatching pharmacy event:', error)
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
      const category = data.data?.type || data.data?.category || '';
      
      // Skip pharmacy request notifications - they should only appear in bottom sheet
      if (category === 'pharmacy_request' || 
          category === 'pharmacy_search' ||
          category === 'pharmacy_offers' ||
          title.toLowerCase().includes('pharmacy') ||
          title.toLowerCase().includes('seller found') ||
          title.toLowerCase().includes('seller acknowledged') ||
          title.toLowerCase().includes('offer') ||
          title.toLowerCase().includes('medicine request')) {
        console.log('🚫 Skipping pharmacy request notification - will show in bottom sheet only');
        
        // Still dispatch custom events for bottom sheet updates
        this.dispatchPharmacyEvent(data);
        return;
      }
      
      // Skip only specific restock notification types to prevent duplicate snackbars
      // Allow general stock update notifications but skip restock request confirmations
      if ((message.toLowerCase().includes('notify you when') && message.toLowerCase().includes('back in stock')) ||
          (title.toLowerCase().includes('restock') && message.toLowerCase().includes('notify you when'))) {
        console.log('🚫 Skipping restock request confirmation to prevent duplicate snackbar');
        return;
      }
      
      // Skip parcel delivery notifications - they are handled via custom events and bottom sheet
      if (title.toLowerCase().includes('parcel') || 
          message.toLowerCase().includes('parcel') ||
          title.toLowerCase().includes('driver') && message.toLowerCase().includes('parcel') ||
          category === 'parcel_delivery' ||
          data.data?.reference_type === 'ParcelDelivery') {
        console.log('🚫 Skipping parcel delivery notification - will show in bottom sheet only');
        
        // Still dispatch custom events for bottom sheet updates
        if (data.data?.event_type) {
          window.dispatchEvent(new CustomEvent(data.data.event_type, {
            detail: {
              event_type: data.data.event_type,
              data: data.data
            }
          }));
        }
        return;
      }

      // Add new notification to store
      const notification = {
        id: data.data?.notification_id || Date.now(),
        title: data.data?.title || "New Notification",
        message: data.message || data.data?.message,
        type: data.data?.type || "info",
        severity: data.data?.severity || "info",
        // Ensure pharmacy_request stays persistent even if backend forgets
        persistent: (data.data?.type === 'pharmacy_request') ? true : (data.data?.persistent || true),
        timeout: data.data?.timeout || 0, // 0 means persistent
        reference_id: data.data?.reference_id,
        reference_type: data.data?.reference_type,
        payload: data.data?.payload || {},
        is_read: false,
        created_at: data.data?.created_at || new Date().toISOString(),
      };

      console.log('📋 Processed notification:', notification)

      notificationStore.addNotification(notification);

      // Trigger snackbar display
      this.showSnackbar(notification);

      // Real-time pharmacy flow integration
      try {
        // Offers received for a medicine request
        if (notification.type === 'pharmacy_offers' && notification.reference_type === 'MedicineRequest') {
          const offersCount = notification.payload?.offers_count || 0
          window.dispatchEvent(new CustomEvent('pharmacyOffersReceived', {
            detail: {
              requestId: notification.reference_id,
              offersCount
            }
          }))
        }
        // Dispatched first batch — keep searching UI but show "waiting" state
        if (notification.type === 'pharmacy_request' && notification.reference_type === 'MedicineRequest' && notification.payload?.phase === 'dispatched') {
          window.dispatchEvent(new CustomEvent('pharmacyDispatched', {
            detail: {
              requestId: notification.reference_id,
              radiusKm: notification.payload?.radius_km
            }
          }))
        }
        // No-offers / no_response path conveyed as pharmacy_request + warning
        if (notification.type === 'pharmacy_request' && notification.severity === 'warning' && notification.reference_type === 'MedicineRequest') {
          window.dispatchEvent(new CustomEvent('pharmacyNoOffers', {
            detail: {
              requestId: notification.reference_id
            }
          }))
        }
        
        // Intelligent pharmacy search updates
        if (notification.type === 'pharmacy_search' && notification.reference_type === 'MedicineRequest') {
          window.dispatchEvent(new CustomEvent('pharmacySearchUpdate', {
            detail: {
              eventType: notification.payload?.event_type,
              requestId: notification.reference_id,
              title: notification.title,
              message: notification.message,
              status: notification.payload?.status,
              progress: notification.payload?.progress,
              data: notification.payload
            }
          }))
        }
        
        // Pharmacy offers with action button
        if (notification.type === 'pharmacy_offers' && notification.reference_type === 'MedicineRequest') {
          window.dispatchEvent(new CustomEvent('pharmacyOffersReceived', {
            detail: {
              requestId: notification.reference_id,
              offersCount: notification.payload?.offers_count,
              message: notification.message,
              hasActionButton: true,
              actionButton: notification.payload?.actions?.view_offers,
              timeoutSeconds: notification.payload?.actions?.view_offers?.timeout_seconds || 120
            }
          }))
        }
      } catch (e) {
        console.warn('Pharmacy realtime UI dispatch failed:', e)
      }

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
    } else if (data.type === "custom_event") {
      // Handle custom events for seller notifications
      const eventType = data.event_type
      const eventData = data.data || {}
      
      console.log(`🎯 Dispatching custom event: ${eventType}`, eventData)
      
      switch (eventType) {
        case 'sellerFound':
          console.log('🏥 Dispatching sellerFound event:', eventData)
          window.dispatchEvent(new CustomEvent('sellerFound', {
            detail: {
              seller: {
                ...eventData.seller,
                requestId: eventData.requestId // Ensure requestId is in seller object
              },
              requestId: eventData.requestId
            }
          }))
          break
          
        case 'sellerAcknowledged':
          console.log('✅ Dispatching sellerAcknowledged event:', eventData)
          window.dispatchEvent(new CustomEvent('sellerAcknowledged', {
            detail: {
              sellerId: eventData.sellerId || eventData.seller?.id,
              sellerName: eventData.sellerName || eventData.seller_name || eventData.seller?.seller_name || eventData.seller?.name,
              requestId: eventData.requestId,
              // Pass all seller details
              seller_name: eventData.seller_name || eventData.sellerName,
              business_name: eventData.business_name || eventData.seller?.business_name,
              business_address: eventData.business_address || eventData.seller?.business_address,
              phone_number: eventData.phone_number || eventData.seller?.phone_number,
              delivery_radius: eventData.delivery_radius || eventData.seller?.delivery_radius,
              response_time: eventData.response_time || eventData.seller?.response_time,
              status: eventData.status || 'acknowledged'
            }
          }))
          break
          
        case 'sellerDeclined':
          console.log('❌ Dispatching sellerDeclined event:', eventData)
          window.dispatchEvent(new CustomEvent('sellerDeclined', {
            detail: {
              sellerId: eventData.sellerId || eventData.seller?.id,
              sellerName: eventData.sellerName || eventData.seller?.seller_name || eventData.seller?.name,
              reason: eventData.reason || eventData.decline_reason,
              requestId: eventData.requestId
            }
          }))
          break
          
        case 'sellerOffered':
          console.log('💰 Dispatching sellerOffered event:', eventData)
          window.dispatchEvent(new CustomEvent('sellerOffered', {
            detail: {
              sellerId: eventData.sellerId || eventData.seller?.id,
              sellerName: eventData.sellerName || eventData.seller_name || eventData.seller?.seller_name || eventData.seller?.name,
              seller_name: eventData.seller_name || eventData.sellerName,
              business_name: eventData.business_name || eventData.seller?.business_name,
              business_address: eventData.business_address || eventData.seller?.business_address,
              phone_number: eventData.phone_number || eventData.seller?.phone_number,
              offer: eventData.offer,
              requestId: eventData.requestId
            }
          }))
          break
          
        case 'noSellersFound':
          console.log('🚫 Dispatching noSellersFound event:', eventData)
          window.dispatchEvent(new CustomEvent('noSellersFound', {
            detail: {
              requestId: eventData.requestId,
              message: eventData.message
            }
          }))
          break
          
        case 'acknowledgmentTimeout':
          console.log('⏰ Dispatching acknowledgmentTimeout event:', eventData)
          window.dispatchEvent(new CustomEvent('acknowledgmentTimeout', {
            detail: {
              requestId: eventData.requestId,
              pharmacy_id: eventData.pharmacy_id,
              pharmacy_name: eventData.pharmacy_name
            }
          }))
          break
          
        // Parcel delivery events
        case 'searching_driver':
        case 'driver_found':
        case 'driver_accepted':
        case 'driver_declined':
        case 'driver_timeout':
        case 'no_driver_found':
        case 'admin_fallback':
          console.log(`📦 Dispatching parcel event: ${eventType}`, eventData)
          window.dispatchEvent(new CustomEvent(eventType, {
            detail: {
              event_type: eventType,
              data: eventData
            }
          }))
          // Also dispatch as generic customEvent
          window.dispatchEvent(new CustomEvent('customEvent', {
            detail: {
              event_type: eventType,
              data: eventData
            }
          }))
          break
          
        default:
          console.warn('⚠️ Unknown custom event type:', eventType, eventData)
      }
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
    console.log('🍞 Showing snackbar notification:', notification)
    
    // Handle action button notifications
    if (notification.data?.actionButton) {
      this.handleActionButtonNotification(notification)
    }
    
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
        // Handle action button click if present
        if (notification.onActionClick) {
          notification.onActionClick();
        } else if (notification.reference_type && notification.reference_id) {
          const linkMap = {
            Order: `/order-status/${notification.reference_id}`,
            Product: `/product/${notification.reference_id}`,
            Profile: "/profile",
            ListingInquiry: "/listing-inquiries",
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

  // Handle action button notifications with countdown timers
  handleActionButtonNotification(notification) {
    if (!notification.data?.actionButton) return

    const actionButton = notification.data.actionButton
    const timeoutSeconds = notification.data.timeoutSeconds || 300  // Default to 5 minutes
    
    console.log('🎯 Setting up action button notification with timeout:', timeoutSeconds)
    
    // Start countdown timer
    let remainingSeconds = timeoutSeconds
    const countdownInterval = setInterval(() => {
      remainingSeconds--
      
      // Update notification message with countdown
      if (notification.onCountdownUpdate) {
        notification.onCountdownUpdate(remainingSeconds)
      }
      
      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval)
        
        // Handle timeout
        if (notification.onTimeout) {
          notification.onTimeout()
        }
        
        // Remove notification
        if (notification.onRemove) {
          notification.onRemove()
        }
      }
    }, 1000)
    
    // Store interval for cleanup
    notification.countdownInterval = countdownInterval
    
    return countdownInterval
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
