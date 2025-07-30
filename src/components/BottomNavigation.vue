<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
    <div class="flex items-center justify-around h-16">
      <router-link 
        :to="{ name: 'Home' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Home v-if="activeTab === 'home'" class="w-6 h-6 mb-1" />
          <Home v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <div 
            v-if="activeTab === 'home'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
        <span class="font-medium">Home</span>
      </router-link>
      
      <router-link 
        :to="{ name: 'Explore' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'explore' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Search v-if="activeTab === 'explore'" class="w-6 h-6 mb-1" />
          <Search v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <div 
            v-if="activeTab === 'explore'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
        <span class="font-medium">Explore</span>
      </router-link>
      
      <router-link 
        :to="{ name: 'Orders' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'orders' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Package v-if="activeTab === 'orders'" class="w-6 h-6 mb-1" />
          <Package v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <div 
            v-if="activeTab === 'orders'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
        <span class="font-medium">Orders</span>
      </router-link>
      
      <router-link 
        :to="{ name: 'Cart' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'cart' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <ShoppingBag v-if="activeTab === 'cart'" class="w-6 h-6 mb-1" />
          <ShoppingBag v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span 
            v-if="cart.cartItemCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm"
          >
            {{ cart.cartItemCount > 99 ? '99+' : cart.cartItemCount }}
          </span>
          <div 
            v-if="activeTab === 'cart'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
        <span class="font-medium">Cart</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { Home, Search, Package, ShoppingBag } from 'lucide-vue-next'

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
/* Additional styles if needed */
</style> 