// Firebase Configuration for Shopper App
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config - these will need to be set in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,

};

// Initialize Firebase
let app = null;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Cloud Messaging and get a reference to the service
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { app, messaging };

// VAPID key - this will need to be set in environment variables
// You need to get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BFyxyz123abcDEF456_GHI789jklMNO012_pqrSTU345-vwxYZ678_90abcDEF123"; // Replace with actual VAPID key
