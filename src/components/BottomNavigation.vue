<template>
  <v-bottom-navigation
    v-model="activeTab"
    class="bottom-nav"
    color="primary"
    height="70"
    grow
  >
    <v-btn 
      value="home" 
      :to="{ name: 'Home' }"
      exact
    >
      <v-icon>mdi-home-outline</v-icon>
      <span>Home</span>
    </v-btn>
    
    <v-btn 
      value="explore" 
      :to="{ name: 'Explore' }"
    >
      <v-icon>mdi-compass-outline</v-icon>
      <span>Explore</span>
    </v-btn>
    
    <v-btn 
      value="orders" 
      :to="{ name: 'Orders' }"
    >
      <v-icon>mdi-receipt-text-outline</v-icon>
      <span>Orders</span>
    </v-btn>
    
    <v-btn 
      value="cart" 
      :to="{ name: 'Cart' }"
    >
      <v-badge 
        v-if="cart.cartItemCount > 0"
        :content="cart.cartItemCount" 
        color="error" 
        offset-x="12" 
        offset-y="12"
      >
        <v-icon>mdi-cart-outline</v-icon>
      </v-badge>
      <v-icon v-else>mdi-cart-outline</v-icon>
      <span>Cart</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const cart = useCartStore()
const notification = useNotificationStore()

const activeTab = ref('home')

const currentRouteName = computed(() => route.name)

// Update active tab based on current route
const updateActiveTab = () => {
  const routeTabMap = {
    'Home': 'home',
    'Explore': 'explore',
    'Orders': 'orders',
    'Cart': 'cart'
  }
  
  activeTab.value = routeTabMap[currentRouteName.value] || 'home'
}

onMounted(async () => {
  updateActiveTab()
  
  // Initialize stores
  try {
    cart.initCartState()
    await cart.fetchCart()
    
    // Initialize notification store
    await notification.init()
  } catch (error) {
    console.error('Error initializing bottom navigation stores:', error)
  }
})

// Watch for route changes
import { watch } from 'vue'
watch(currentRouteName, updateActiveTab)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

.v-btn {
  flex-direction: column;
  height: 100%;
  font-size: 11px;
}

.v-btn .v-icon {
  margin-bottom: 2px;
}
</style> 