// Firebase messaging service worker for background notifications
// This file is auto-generated. Do not edit manually!
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Initialize Firebase with actual config values
firebase.initializeApp({
  apiKey: "{{VITE_FIREBASE_API_KEY}}",
  authDomain: "{{VITE_FIREBASE_AUTH_DOMAIN}}",
  projectId: "{{VITE_FIREBASE_PROJECT_ID}}",
  storageBucket: "{{VITE_FIREBASE_STORAGE_BUCKET}}",
  messagingSenderId: "{{VITE_FIREBASE_SENDER_ID}}",
  appId: "{{VITE_FIREBASE_APP_ID}}",
  measurementId: "{{VITE_FIREBASE_MEASUREMENT_ID}}",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "afriQExpress";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "afriqexpress-shopper",
    data: {
      url: getNotificationUrl(payload.data),
      notification_id: payload.data?.notification_id,
      type: payload.data?.type,
      reference_id: payload.data?.reference_id,
      reference_type: payload.data?.reference_type,
    },
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    requireInteraction: payload.data?.persistent === "true",
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Handle click action
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // If there's already a window/tab open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes("afriqexpress") && "focus" in client) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: urlToOpen,
              data: event.notification.data,
            });
            return;
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper function to generate notification URLs
function getNotificationUrl(data) {
  const baseUrl = self.location.origin;

  if (data?.reference_type && data?.reference_id) {
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

// Service worker activation
self.addEventListener("activate", function (event) {
  console.log("Firebase messaging service worker activated");
});

// Service worker installation
self.addEventListener("install", function (event) {
  console.log("Firebase messaging service worker installed");
  self.skipWaiting();
});