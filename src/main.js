import { createApp } from 'vue'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import LucideIcons from './plugins/lucide'



const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(LucideIcons)

// PWA Service Worker Registration and Update Handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              console.log('New content is available; please refresh.')
              // You can show a snackbar or notification here
            }
          })
        })
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
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

// createApp(App)
//   .use(router)
//   .use(vuetify)
//   .use(pinia)
//   .mount('#app')
