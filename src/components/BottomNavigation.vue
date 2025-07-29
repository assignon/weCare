<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16">
    <div class="flex h-full">
      <RouterLink 
        :to="{ name: 'Home' }"
        class="bottom-nav-item flex-1"
        :class="{ 'active': activeTab === 'home' }"
      >
        <Home class="w-5 h-5" />
        <span class="text-xs mt-1">Home</span>
      </RouterLink>
      
      <RouterLink 
        :to="{ name: 'Explore' }"
        class="bottom-nav-item flex-1"
        :class="{ 'active': activeTab === 'explore' }"
      >
        <Compass class="w-5 h-5" />
        <span class="text-xs mt-1">Explore</span>
      </RouterLink>
      
      <RouterLink 
        :to="{ name: 'Orders' }"
        class="bottom-nav-item flex-1"
        :class="{ 'active': activeTab === 'orders' }"
      >
        <Receipt class="w-5 h-5" />
        <span class="text-xs mt-1">Orders</span>
      </RouterLink>
      
      <RouterLink 
        :to="{ name: 'Cart' }"
        class="bottom-nav-item flex-1 relative"
        :class="{ 'active': activeTab === 'cart' }"
      >
        <div class="relative">
          <ShoppingCart class="w-5 h-5" />
          <span 
            v-if="cart.cartItemCount > 0"
            class="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-0"
          >
            {{ cart.cartItemCount }}
          </span>
        </div>
        <span class="text-xs mt-1">Cart</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { Home, Compass, Receipt, ShoppingCart } from 'lucide-vue-next'

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
watch(currentRouteName, updateActiveTab)
</script>

<style scoped>
/* Component-specific styles if needed */
</style> 