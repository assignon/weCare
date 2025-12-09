<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useCRMStore } from '@/stores/crm'
import BottomNavigation from '@/components/BottomNavigation.vue'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'

const route = useRoute()
const cart = useCartStore()
const notification = useNotificationStore()
const auth = useAuthStore()
const crmStore = useCRMStore()

const mainPages = ['Home', 'Orders', 'Explore']
const authPages = ['Login', 'Register', 'ForgotPassword', 'ResetPassword']
const showBottomNav = computed(() => mainPages.includes(route.name))
const showTopNav = computed(() => !mainPages.includes(route.name) && !authPages.includes(route.name))
const showUniversalTopBar = computed(() => !authPages.includes(route.name) && auth.isAuthenticated)

onMounted(async () => {
  // Initialize stores
  try {
    cart.initCartState()
    await cart.fetchCart()

    // Initialize notification store
    await notification.init()
    
    // Initialize CRM store from session storage
    await crmStore.initializeFromSession()
  } catch (error) {
    console.log('Error initializing app stores:', error)
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-grey-50">
    <router-view />

    <!-- Show bottom navigation only on main pages -->
    <BottomNavigation v-if="showBottomNav" />

    <!-- Global notification snackbar -->
    <GlobalSnackbar />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #7C3AED;
  --secondary-color: #006763;
}

html,
body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
}

body {
  background: #f9f9f9;
}
</style>
