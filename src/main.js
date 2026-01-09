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
// Note: We preserve the vite-plugin-pwa service worker for PWA installation
// Only clean up problematic service workers that are not PWA-related
if ('serviceWorker' in navigator) {
  // Clean up only problematic service workers, preserve PWA service worker
  (async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        // Keep Firebase messaging service worker
        if (registration.scope && registration.scope.includes('firebase')) {
          continue
        }
        // Keep vite-plugin-pwa service worker (usually at root scope)
        // The PWA service worker is typically registered at the root scope
        // and is needed for PWA installation
        const isPWAServiceWorker = registration.scope === window.location.origin + '/' ||
                                   registration.active?.scriptURL?.includes('sw.js') ||
                                   registration.active?.scriptURL?.includes('workbox')
        if (isPWAServiceWorker) {
          console.log('Preserving PWA service worker:', registration.scope)
          continue
        }
        // Only unregister other problematic service workers
        try {
          await registration.unregister()
          console.log('Unregistered problematic service worker:', registration.scope)
        } catch (unregError) {
          console.warn('Failed to unregister service worker:', unregError)
        }
      }
    } catch (error) {
      console.warn('Error managing service workers:', error)
    }
  })()
}

// Handle PWA install prompt - let vite-plugin-pwa handle this
// The pwaService will also handle this, but we keep this for compatibility
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  console.log('✅ PWA install prompt available - App can be installed!')
  // Dispatch custom event for components that might want to show install button
  window.dispatchEvent(new CustomEvent('pwa-install-available', { detail: e }))
})

// Handle PWA installation
window.addEventListener('appinstalled', (evt) => {
  console.log('✅ PWA was installed successfully!')
  deferredPrompt = null
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('pwa-installed'))
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
