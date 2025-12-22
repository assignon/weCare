import { createApp } from 'vue'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import LucideIcons from './plugins/lucide'
import i18n, { initializeLocale } from './i18n'



const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(LucideIcons)
app.use(i18n)

// PWA Service Worker Registration and Update Handling
// Clean up any stuck or problematic service workers IMMEDIATELY on app load
// This must happen before any dynamic imports to prevent loading errors
if ('serviceWorker' in navigator) {
  // Unregister service workers immediately (synchronously if possible)
  (async () => {
    try {
      // Unregister any existing service workers that might be causing issues
      // (except firebase-messaging-sw.js which is handled by Firebase)
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        // Only unregister if it's not the Firebase messaging service worker
        if (registration.scope && !registration.scope.includes('firebase')) {
          try {
            await registration.unregister()
            console.log('Unregistered problematic service worker:', registration.scope)
          } catch (unregError) {
            console.warn('Failed to unregister service worker:', unregError)
          }
        }
      }
      
      // Also clear all caches to remove stale files
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          // Keep Firebase caches, clear others
          if (!cacheName.includes('firebase') && !cacheName.includes('google-fonts')) {
            try {
              await caches.delete(cacheName)
              console.log('Cleared cache:', cacheName)
            } catch (cacheError) {
              console.warn('Failed to clear cache:', cacheName, cacheError)
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error cleaning up service workers:', error)
    }
  })()
  
  // Also handle on page load as backup
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        if (registration.scope && !registration.scope.includes('firebase')) {
          try {
            await registration.unregister()
          } catch (unregError) {
            // Silent fail on retry
          }
        }
      }
    } catch (error) {
      // Silent fail
    }
  })
}

// Handle PWA install prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  console.log('PWA install prompt available')
})

// Handle PWA installation
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA was installed')
})

// Mount the app directly - let router guards handle authentication when needed
app.mount('#app')

// Initialize locale after mounting
initializeLocale()

// createApp(App)
//   .use(router)
//   .use(vuetify)
//   .use(pinia)
//   .mount('#app')
