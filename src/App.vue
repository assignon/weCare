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
    console.error('Error initializing app stores:', error)
  }
})
</script>

<template>
  <v-app>
    <!-- Universal top app bar for authenticated users -->
    <!-- <v-app-bar 
      v-if="showUniversalTopBar" 
      color="white" 
      flat
      density="compact"
    > -->
      <!-- Back button for non-main pages -->
      <!-- <v-btn 
        v-if="showTopNav"
        icon 
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn> -->
      
      <!-- App title/logo for main pages -->
      <!-- <v-toolbar-title v-if="!showTopNav" class="text-h6 font-weight-bold">
        afriQExpress
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
       -->
      <!-- Navigation buttons for non-main pages -->
      <!-- <template v-if="showTopNav">
        <v-btn :to="{ name: 'Explore' }">
          <v-icon>mdi-compass-outline</v-icon>
          <span>Explore</span>
        </v-btn>
        <v-btn :to="{ name: 'Cart' }">
          <v-badge 
            v-if="cart.cartItemCount > 0"
            :content="cart.cartItemCount" 
            color="error" 
            offset-x="12" 
            offset-y="12"
          >
            <v-icon>mdi-cart</v-icon>
          </v-badge>
          <v-icon v-else>mdi-cart</v-icon>
          <span>Cart</span>
        </v-btn>
      </template> -->
      
      <!-- Notification icon (always visible for authenticated users) -->
      <!-- <v-btn 
        icon
        :to="{ name: 'Notification' }"
      >
        <v-badge 
          v-if="notification.hasUnreadNotifications"
          :content="notification.unreadCount" 
          color="error" 
          offset-x="8" 
          offset-y="8"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn> -->
      
      <!-- User profile menu -->
      <!-- <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="ml-2"
          >
            <v-avatar size="32">
              <v-img 
                v-if="auth.user?.profile_picture" 
                :src="auth.user.profile_picture" 
                alt="Profile"
              />
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="{ name: 'Profile' }">
            <v-list-item-title>
              <v-icon start>mdi-account</v-icon>
              Profile
            </v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'Orders' }">
            <v-list-item-title>
              <v-icon start>mdi-receipt-text</v-icon>
              My Orders
            </v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'Wishlist' }" v-if="false">
            <v-list-item-title>
              <v-icon start>mdi-heart</v-icon>
              Wishlist
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="auth.logout">
            <v-list-item-title>
              <v-icon start>mdi-logout</v-icon>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar> -->
    
    <router-view />
    
    <!-- Show bottom navigation only on main pages -->
    <BottomNavigation v-if="showBottomNav" />
    
    <!-- Global notification snackbar -->
    <GlobalSnackbar />
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #7C3AED;
  --secondary-color: #006763;
}

html, body {
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

/* Fix for v-app not taking full width in some browsers */
.v-application {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}

.v-application__wrap {
  width: 100% !important;
  min-width: 100% !important;
}
</style>
