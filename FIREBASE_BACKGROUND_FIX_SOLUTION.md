# Firebase Background Notifications - Complete Fix Guide

## The Problem

Firebase `onBackgroundMessage` wasn't working because service workers **cannot access** `import.meta.env` variables from Vite. When the service worker tried to access these variables, they returned `undefined`, causing Firebase initialization to fail completely.

## The Solution

We've implemented an automated solution that generates the service worker file dynamically using your actual environment variables.

## Quick Fix Steps

### Option 1: Automated Solution (Recommended)

1. **Generate the service worker with your environment variables:**
   ```bash
   npm run generate-sw
   ```

2. **Start development with automatic service worker generation:**
   ```bash
   npm run dev:sw
   ```

3. **For production builds** (service worker is auto-generated):
   ```bash
   npm run build
   ```

### Option 2: Manual Fix

1. **Copy your Firebase config values** from your `.env` file
2. **Open** `shopper/public/firebase-messaging-sw.js`
3. **Replace the placeholder values** with your actual Firebase credentials:

```javascript
firebase.initializeApp({
  apiKey: "your_actual_api_key_here",           // From VITE_FIREBASE_API_KEY
  authDomain: "afriqmarket-place.firebaseapp.com",
  projectId: "afriqmarket-place",
  storageBucket: "afriqmarket-place.firebasestorage.app",
  messagingSenderId: "your_actual_sender_id",   // From VITE_FIREBASE_SENDER_ID
  appId: "your_actual_app_id",                  // From VITE_FIREBASE_APP_ID
  measurementId: "your_measurement_id"          // From VITE_FIREBASE_MEASUREMENT_ID
});
```

## Environment Variables Required

Make sure your `.env` file contains all these variables with **real values** (not placeholders):

```env
VITE_FIREBASE_API_KEY=AIzaSyYour_Real_API_Key_Here
VITE_FIREBASE_AUTH_DOMAIN=afriqmarket-place.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=afriqmarket-place
VITE_FIREBASE_STORAGE_BUCKET=afriqmarket-place.firebasestorage.app
VITE_FIREBASE_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD123456
VITE_FIREBASE_VAPID_KEY=BFyxyz123abcDEF456...
```

## How to Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `afriqmarket-place` project
3. Go to **Project Settings** → **General** → **Your apps**
4. Find your web app or click **Add app** if you don't have one
5. Copy the config values and update your `.env` file

## Testing Background Notifications

### Method 1: Use the Test Page
1. Navigate to `/test-firebase-bg.html` in your browser
2. Click "Initialize FCM" → "Get FCM Token"
3. Copy the token and test with your backend

### Method 2: Browser Developer Tools
1. Open **DevTools** → **Application** → **Service Workers**
2. Check if `firebase-messaging-sw.js` is registered and active
3. Look for any errors in the service worker logs

### Method 3: Send Test Notification
Use your backend or Firebase console to send a test notification to the FCM token.

## Troubleshooting

### Service Worker Not Working
- Check browser console for errors
- Ensure HTTPS is enabled (required for service workers)
- Verify Firebase credentials are correct
- Check that `firebase-messaging-sw.js` has actual values, not placeholders

### Notifications Not Appearing
- Check notification permissions: `Notification.permission`
- Verify the FCM token is being sent to your backend
- Test with a simple browser notification first
- Check if the browser tab is in focus (background notifications only work when tab is not active)

### Common Errors
- **"Default Firebase app does not exist"**: Firebase config is incorrect
- **"FCM token retrieval failed"**: VAPID key or configuration issue
- **"Service worker registration failed"**: Check file path and HTTPS

## Technical Details

### How the Automated Solution Works
1. The `scripts/generate-sw.js` script reads your `.env` file
2. It replaces placeholders in a service worker template with actual values
3. It generates `public/firebase-messaging-sw.js` with working Firebase config
4. The build process automatically runs this script

### Files Modified
- `shopper/scripts/generate-sw.js` - Generator script
- `shopper/package.json` - Updated scripts
- `shopper/public/firebase-messaging-sw.js` - Generated service worker

## Production Deployment

For production:
1. Ensure your `.env` file has real Firebase credentials
2. Run `npm run build` (automatically generates service worker)
3. Deploy the built files including the generated service worker

## Security Note

The generated service worker will contain your Firebase API key in plain text. This is normal and safe for client-side Firebase applications, as the API key is meant to be public for client authentication.

---

**✅ After following these steps, your background notifications should work properly!** 