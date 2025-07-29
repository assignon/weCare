<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import BottomNavigation from '@/components/BottomNavigation.vue'
import GlobalSnackbar from '@/components/GlobalSnackbar.vue'

const route = useRoute()
const cart = useCartStore()
const notification = useNotificationStore()
const auth = useAuthStore()

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
  } catch (error) {
    console.log('Error initializing app stores:', error)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <router-view />

    <!-- Show bottom navigation only on main pages -->
    <BottomNavigation v-if="showBottomNav" />

    <!-- Global notification snackbar -->
    <GlobalSnackbar />
  </div>
</template>

<style scoped>
/* App-specific styles if needed */
</style>
