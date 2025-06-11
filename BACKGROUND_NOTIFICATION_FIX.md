# 🔥 Background Notification Fix Guide

## The Problem
FCM notifications work in foreground but not when the app is in the background.

## Root Cause
The issue is likely one of these:
1. **Missing/Invalid VAPID Key** - You need the actual VAPID key from Firebase Console
2. **Service Worker not handling messages properly**
3. **Browser tab not properly backgrounded**
4. **Backend sending wrong message format**

## ✅ Step-by-Step Fix

### 1. Get Your Real VAPID Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `afriqmarket-place` project
3. Go to **Project Settings** → **Cloud Messaging**
4. Under **Web Push certificates**, click **Generate key pair** (if you don't have one)
5. Copy the key that looks like: `BFyxyz123abcDEF456_GHI789jklMNO012_pqrSTU345-vwxYZ678_90abcDEF123`

### 2. Update Your Configuration

**Update `.env` file:**
```env
VITE_FIREBASE_VAPID_KEY=YOUR_ACTUAL_VAPID_KEY_HERE
```

**Update `shopper/src/services/firebaseConfig.js`:**
```javascript
export const vapidKey = "YOUR_ACTUAL_VAPID_KEY_HERE";
```

### 3. Test Background Notifications

1. Open: `http://localhost:5173/background-test.html`
2. Follow the test steps
3. Copy your FCM token
4. Use this curl command to test:

```bash
curl -X POST http://localhost:8000/api/core/fcm/test/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "YOUR_FCM_TOKEN",
    "title": "Background Test",
    "message": "This is a background notification test"
  }'
```

### 4. Important Notes

**For Background Notifications to Work:**
- ✅ Notification permission must be granted
- ✅ Service worker must be registered and active
- ✅ Tab must be minimized/backgrounded or browser closed
- ✅ Valid VAPID key must be configured
- ✅ Backend must send `notification` payload (not just `data`)

**Your Backend is Correctly Configured** ✅
I checked your FCM service - it properly sends:
- `notification` payload (required for background notifications)
- `webpush` configuration
- Platform-specific configs

### 5. Debug Issues

**If notifications still don't work:**

1. **Check Browser DevTools:**
   - Open DevTools → Application → Service Workers
   - Check if `firebase-messaging-sw.js` is active
   - Look for errors in the Console

2. **Check Notification Permission:**
   ```javascript
   console.log('Permission:', Notification.permission);
   ```

3. **Test with Chrome DevTools:**
   - DevTools → Application → Service Workers
   - Click "Inspect" next to your service worker
   - Check for console errors

4. **Browser Specific Issues:**
   - **Chrome**: Works well, make sure tab is truly backgrounded
   - **Firefox**: May require explicit backgrounding
   - **Safari**: Limited support, may not work

### 6. Common Issues & Solutions

**Issue: "Registration failed"**
- Solution: Check service worker syntax errors

**Issue: "No registration token available"**
- Solution: Check VAPID key and Firebase config

**Issue: "Notifications work in foreground only"**
- Solution: Ensure proper tab backgrounding and valid service worker

**Issue: "Permission denied"**
- Solution: Reset browser permissions for your domain

### 7. Quick Test Commands

**Test local notification:**
```javascript
new Notification('Test', { body: 'This is a test notification' });
```

**Check service worker status:**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active SWs:', registrations.length);
});
```

## 🎯 Most Likely Solution

The main issue is probably the **VAPID key**. Replace the placeholder in:
1. `shopper/.env`
2. `shopper/src/services/firebaseConfig.js`
3. Regenerate service worker: `npm run generate-sw`

Then test with the background-test.html page! 