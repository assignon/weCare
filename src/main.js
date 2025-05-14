import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

// const vuetify = createVuetify({
//   icons: {
//     defaultSet: 'mdi',
//   },
// })

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#7C3AED',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        }
      }
    }
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

// Initialize Auth Store and wait for authentication check before mounting
// This ensures the router guards have accurate auth information on first load
const authStore = useAuthStore()

// Initialize authentication and then mount the app
authStore.checkAuth().finally(() => {
  app.mount('#app')
})

// createApp(App)
//   .use(router)
//   .use(vuetify)
//   .use(pinia)
//   .mount('#app')
