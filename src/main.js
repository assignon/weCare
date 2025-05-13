import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
  },
})

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(vuetify)
  .use(pinia)
  .mount('#app')
