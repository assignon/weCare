#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
        env[key] = value;
      }
    });
  }
  
  return env;
}

// Service worker template
const swTemplate = `// Firebase messaging service worker for background notifications
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
        return \`\${baseUrl}/order-status/\${data.reference_id}\`;
      case "Product":
        return \`\${baseUrl}/product/\${data.reference_id}\`;
      case "Profile":
        return \`\${baseUrl}/profile\`;
      default:
        return \`\${baseUrl}/notifications\`;
    }
  }

  return \`\${baseUrl}/notifications\`;
}

// Service worker activation
self.addEventListener("activate", function (event) {
  console.log("Firebase messaging service worker activated");
});

// Service worker installation
self.addEventListener("install", function (event) {
  console.log("Firebase messaging service worker installed");
  self.skipWaiting();
});`;

function generateServiceWorker() {
  console.log('🔧 Generating Firebase service worker...');
  
  const env = loadEnvFile();
  
  // Check if required variables exist
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !env[varName] || env[varName].includes('placeholder'));
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Warning: Missing or placeholder Firebase environment variables:');
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}: ${env[varName] || 'undefined'}`);
    });
    console.warn('   Service worker will be generated but background notifications may not work.');
    console.warn('   Please update your .env file with actual Firebase credentials.');
  }
  
  // Replace placeholders with actual values
  let swContent = swTemplate;
  Object.keys(env).forEach(key => {
    if (key.startsWith('VITE_FIREBASE_')) {
      swContent = swContent.replace(new RegExp(`{{${key}}}`, 'g'), env[key] || '');
    }
  });
  
  // Write the generated service worker
  const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
  fs.writeFileSync(outputPath, swContent);
  
  console.log('✅ Firebase service worker generated successfully!');
  console.log(`   Output: ${outputPath}`);
  
  if (missingVars.length === 0) {
    console.log('🔥 All Firebase environment variables found. Background notifications should work!');
  }
}

// Run if called directly
const scriptPath = fileURLToPath(import.meta.url);
const runPath = process.argv[1];
if (scriptPath === runPath) {
  generateServiceWorker();
}

export { generateServiceWorker }; 