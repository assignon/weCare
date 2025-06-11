# Firebase Background Notifications Fix

## Issues Identified

1. **Service Worker Configuration**: The `firebase-messaging-sw.js` file was trying to use `import.meta.env` variables which don't work in service workers
2. **Order Status strftime Error**: The order status messages were calling `strftime()` on potentially string values instead of datetime objects

## Fixes Applied

### 1. Fixed Service Worker Configuration

**File**: `shopper/public/firebase-messaging-sw.js`

**Problem**: Service workers cannot access `import.meta.env` variables from Vite.

**Solution**: Replaced `import.meta.env` variables with placeholder values that need to be manually updated.

**Action Required**: 
```javascript
// Replace these placeholder values with your actual Firebase config:
firebase.initializeApp({
  apiKey: "AIzaSyExample123456789-AbCdEfGhIjKlMnOpQrSt", // ← Replace with actual
  authDomain: "afriqmarket-place.firebaseapp.com",
  projectId: "afriqmarket-place",
  storageBucket: "afriqmarket-place.firebasestorage.app",
  messagingSenderId: "123456789012", // ← Replace with actual
  appId: "1:123456789012:web:abc123def456ghi789jkl", // ← Replace with actual
  measurementId: "G-XXXXXXXXXX", // ← Replace with actual
});
```

### 2. Fixed strftime Error in Order Status Messages

**File**: `administration/business_logic/apps/orders/services.py`

**Problem**: The code was calling `.strftime('%d %B %Y')` directly on `order.expected_delivery_time` which could be a string.

**Solution**: All instances now use the existing `OrderService._format_delivery_date()` helper method which safely handles both string and datetime objects.

## How to Fix Background Notifications

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `afriqmarket-place` project
3. Go to Project Settings (gear icon) → General → Your apps
4. Find your web app configuration
5. Copy these values:
   - API Key
   - Messaging Sender ID  
   - App ID
   - Measurement ID (optional)

### Step 2: Update Service Worker

Edit `shopper/public/firebase-messaging-sw.js` and replace the placeholder values:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "afriqmarket-place.firebaseapp.com",
  projectId: "afriqmarket-place",
  storageBucket: "afriqmarket-place.firebasestorage.app",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID_HERE",
  appId: "YOUR_ACTUAL_APP_ID_HERE",
  measurementId: "YOUR_ACTUAL_MEASUREMENT_ID_HERE",
});
```

### Step 3: Verify Environment Variables Match

Make sure your `shopper/.env` file has the same values:

```env
VITE_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=afriqmarket-place.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=afriqmarket-place
VITE_FIREBASE_STORAGE_BUCKET=afriqmarket-place.firebasestorage.app
VITE_FIREBASE_SENDER_ID=YOUR_ACTUAL_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_ACTUAL_APP_ID_HERE
VITE_FIREBASE_VAPID_KEY=YOUR_ACTUAL_VAPID_KEY_HERE
```

### Step 4: Test Background Notifications

1. Open the test page: `http://localhost:5173/test-firebase-bg.html`
2. Follow the step-by-step instructions on the page
3. Or use the Vue app's FCM test page: `http://localhost:5173/fcm-test`

### Step 5: Verify Service Worker Registration

1. Open browser DevTools
2. Go to Application → Service Workers
3. Verify `firebase-messaging-sw.js` is registered and active
4. Check Console for any errors

## Testing Background Notifications

### Method 1: Using Test Page

1. Navigate to `http://localhost:5173/test-firebase-bg.html`
2. Click through the buttons in order:
   - Test Service Worker
   - Request Permission
   - Initialize Firebase
   - Get FCM Token
   - Copy the token
3. Use your backend to send a test notification to the token
4. Minimize the browser tab
5. Notification should appear as system notification

### Method 2: Using Vue App FCM Test

1. Navigate to `http://localhost:5173/fcm-test` (if available)
2. Run the full test suite
3. Check results and follow any recommendations

### Method 3: Using Backend Test Endpoint

If you have the backend test endpoint set up:

```bash
curl -X POST http://localhost:8000/api/core/fcm/test/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "YOUR_FCM_TOKEN_HERE",
    "title": "Test Background Notification",
    "message": "This tests background notification delivery"
  }'
```

## Troubleshooting

### Background Notifications Not Appearing

1. **Check Service Worker**: Ensure `firebase-messaging-sw.js` has correct config values
2. **Check Permissions**: Notification permission must be granted
3. **Check Browser Support**: Must be HTTPS (or localhost) and modern browser
4. **Check Console**: Look for errors in browser DevTools
5. **Check Network**: Verify Firebase project ID and credentials are correct

### Service Worker Errors

1. **INVALID_ARGUMENT**: Usually means incorrect Firebase config values
2. **Registration Failed**: Check if file exists at `/firebase-messaging-sw.js`
3. **Import Errors**: Ensure Firebase SDK URLs are accessible

### FCM Token Issues

1. **No Token Generated**: Check if notification permission is granted
2. **Token Invalid**: Verify Firebase config matches project settings
3. **VAPID Key Error**: Ensure VAPID key is correctly set in environment

## Error Logs to Check

1. **Browser Console**: Check for JavaScript errors
2. **Service Worker Console**: DevTools → Application → Service Workers → Console
3. **Backend Logs**: Check Django logs for FCM sending errors
4. **Firebase Console**: Check Firebase project for usage and errors

## Common Firebase Config Values

Make sure these match your Firebase project:

- **Project ID**: `afriqmarket-place`
- **Auth Domain**: `afriqmarket-place.firebaseapp.com`
- **Storage Bucket**: `afriqmarket-place.firebasestorage.app`

The API Key, Sender ID, and App ID will be unique to your project and must be copied exactly from the Firebase Console. 