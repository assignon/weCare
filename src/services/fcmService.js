// Firebase Cloud Messaging Service for Shopper App
import { getToken, onMessage } from "firebase/messaging";
import { messaging, vapidKey } from "./firebaseConfig";
import { api } from "./api";

class FCMService {
  constructor() {
    this.token = null;
    this.isInitialized = false;
    this.notificationCallback = null;
    this.appName = "shopper";
  }

  async initialize() {
    // if (this.isInitialized || !messaging) {
    //   return;
    // }

    try {
      // Request notification permission
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return false;
      }

      // Register service worker
      await this.registerServiceWorker();
      

      // Get FCM token
      await this.getToken();

      // Set up message listener
      this.setupMessageListener();

      this.isInitialized = true;
      console.log("FCM Service initialized successfully");
      return true;
    } catch (error) {
      console.error("FCM initialization error:", error);
      return false;
    }
  }

  async requestPermission() {
    try {
      if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return "denied";
      }

      if (Notification.permission === "granted") {
        return "granted";
      }

      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission;
      }

      return Notification.permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  }

  async getToken() {
    if (!messaging || !vapidKey) {
      console.error("Firebase messaging not available or VAPID key missing");
      return null;
    }

    try {
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        this.token = token;
        console.log("FCM token generated:", token);

        // Register token with backend
        await this.registerTokenWithBackend(token);

        return token;
      } else {
        console.warn("No registration token available");
        return null;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  async registerTokenWithBackend(token) {
    try {
      const deviceId = this.getDeviceId();

      const response = await api.post("/core/fcm/register/", {
        token: token,
        app_name: this.appName,
        device_type: "web",
        device_id: deviceId,
      });

      if (response.data.success) {
        console.log("FCM token registered with backend successfully");
        localStorage.setItem("fcm_token", token);
        localStorage.setItem("fcm_token_registered", "true");
      }
    } catch (error) {
      console.error("Error registering FCM token with backend:", error);
    }
  }

  async unregisterToken() {
    if (!this.token) return;

    try {
      const response = await api.delete("/core/fcm/unregister/", {
        data: {
          token: this.token,
          app_name: this.appName,
        },
      });

      if (response.data.success) {
        console.log("FCM token unregistered successfully");
        localStorage.removeItem("fcm_token");
        localStorage.removeItem("fcm_token_registered");
        this.token = null;
      }
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
    }
  }

  setupMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("Message received (foreground):", payload);

      // Extract notification data
      const notificationData = {
        title:
          payload.notification?.title ||
          payload.data?.title ||
          "New Notification",
        message: payload.notification?.body || payload.data?.body || "",
        type: payload.data?.type || "info",
        severity: payload.data?.severity || "info",
        persistent: payload.data?.persistent === "true",
        timeout: parseInt(payload.data?.timeout) || 5000,
        reference_id: payload.data?.reference_id || null,
        reference_type: payload.data?.reference_type || null,
        notification_id: payload.data?.notification_id || null,
      };

      // Show in-app notification
      if (this.notificationCallback) {
        this.notificationCallback(notificationData);
      }

      // Show browser notification if app is not in focus
      if (document.hidden || !document.hasFocus()) {
        this.showBrowserNotification(notificationData);
      }
    });
  }

  showBrowserNotification(data) {
    if (Notification.permission !== "granted") return;

    const options = {
      body: data.message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: "afriqexpress-shopper",
      requireInteraction: data.persistent,
      data: {
        url: this.getNotificationUrl(data),
        notification_id: data.notification_id,
      },
    };

    const notification = new Notification(data.title, options);

    notification.onclick = function () {
      window.focus();
      if (options.data.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };
  }

  getNotificationUrl(data) {
    const baseUrl = window.location.origin;

    if (data.reference_type && data.reference_id) {
      switch (data.reference_type) {
        case "Order":
          return `${baseUrl}/order-status/${data.reference_id}`;
        case "Product":
          return `${baseUrl}/product/${data.reference_id}`;
        case "Profile":
          return `${baseUrl}/profile`;
        default:
          return `${baseUrl}/notifications`;
      }
    }

    return `${baseUrl}/notifications`;
  }

  getDeviceId() {
    // Generate or get stored device ID for browser identification
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId =
        "web_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  }

  setNotificationCallback(callback) {
    this.notificationCallback = callback;
  }

  removeNotificationCallback() {
    this.notificationCallback = null;
  }

  getCurrentToken() {
    return this.token;
  }

  isSupported() {
    return !!(
      messaging &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }
}

// Export singleton instance
export default new FCMService();
