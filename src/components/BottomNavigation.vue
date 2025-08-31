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
          <Telescope v-if="activeTab === 'explore'" class="w-6 h-6 mb-1" />
          <Telescope v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
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
      
      <!-- Dynamic Cart/Rendezvous Tab -->
      <router-link 
        :to="{ name: shouldShowRendezvous ? 'Rendezvous' : 'Cart' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="(activeTab === 'cart' || activeTab === 'rendezvous') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Calendar v-if="shouldShowRendezvous && (activeTab === 'cart' || activeTab === 'rendezvous')" class="w-6 h-6 mb-1" />
          <Calendar v-else-if="shouldShowRendezvous" class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <ShoppingBag v-else-if="activeTab === 'cart'" class="w-6 h-6 mb-1" />
          <ShoppingBag v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          
          <!-- Cart item count badge -->
          <span 
            v-if="!shouldShowRendezvous && cart.cartItemCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm"
          >
            {{ cart.cartItemCount > 99 ? '99+' : cart.cartItemCount }}
          </span>
          
          <!-- Viewing requests badge -->
          <span 
            v-if="shouldShowRendezvous && pendingViewingRequests > 0"
            class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm"
          >
            {{ pendingViewingRequests > 99 ? '99+' : pendingViewingRequests }}
          </span>
          
          <div 
            v-if="activeTab === 'cart' || activeTab === 'rendezvous'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
        <span class="font-medium">{{ shouldShowRendezvous ? 'Rendezvous' : 'Cart' }}</span>
      </router-link>

             <!-- Store selector -->
       <button 
         @click="openStoreDialog"
         class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
         :class="activeTab === 'store' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
         type="button"
       >
                   <div class="relative">
            <component :is="defaultStoreIcon" v-if="activeTab === 'store'" class="w-6 h-6 mb-1" />
            <component :is="defaultStoreIcon" v-else class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
           <div 
             v-if="activeTab === 'store'" 
             class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
             style="background: linear-gradient(to right, #2563eb, #9333ea);"
           ></div>
         </div>
         <span class="font-medium">Store</span>
       </button>
    </div>
  </nav>

  <!-- Store category floating selector -->
  <div v-if="showStoreDialog" class="fixed inset-0 z-[60]">
    <div class="absolute inset-0 bg-black/50" @click="closeStoreDialog"></div>
    <div class="absolute right-4 bottom-20 space-y-3 flex flex-col items-end">
      <button
        v-for="cat in storeCategories"
        :key="cat.id"
        @click="selectStore(cat.id)"
                 class="flex items-center space-x-3 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
         :class="isDefault(cat.id) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-white'"
         :style="isDefault(cat.id) ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : 'background: white;'"
      >
        <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <component :is="getCategoryIcon(cat.name)" class="w-4 h-4 text-slate-600" />
        </div>
        <span class="font-medium text-slate-800" :style="isDefault(cat.id) ? 'color: white;' : 'color: black;'">{{ cat.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { Home, Telescope, Package, ShoppingBag, Store, Sparkles, Shirt, Pill, Sofa, Monitor, Car, Calendar } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const cart = useCartStore()
const notification = useNotificationStore()

const activeTab = ref('home')

const currentRouteName = computed(() => route.name)

// State for CRM flow detection
const shouldShowRendezvous = ref(false)
const pendingViewingRequests = ref(0)

// Update active tab based on current route
const updateActiveTab = () => {
  const routeTabMap = {
    'Home': 'home',
    'Explore': 'explore',
    'Orders': 'orders',
    'Cart': 'cart',
    'Rendezvous': 'rendezvous'
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
    
    // Load store categories to ensure default store icon is displayed
    if (sessionStorage.getItem('defaultStore')) {
      try {
        const resp = await apiService.getStoreCategories({ is_active: true })
        storeCategories.value = resp.data?.results || resp.data || []
        
        // Check CRM flow after loading categories
        await checkCRMFlow()
      } catch (e) {
        console.warn('Failed to load store categories on mount:', e)
      }
    }
  } catch (error) {
    console.error('Error initializing bottom navigation stores:', error)
  }
})

// Watch for route changes
import { watch } from 'vue'
watch(currentRouteName, updateActiveTab)

// Listen for sessionStorage changes
const handleStorageChange = (e) => {
  if (e.key === 'defaultStore') {
    // Force reactivity update when defaultStore changes
    if (storeCategories.value.length > 0) {
      // Trigger reactivity by updating the array reference
      storeCategories.value = [...storeCategories.value]
    }
  }
}

onMounted(() => {
  // Add event listener for storage changes
  window.addEventListener('storage', handleStorageChange)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// Store dialog state
const showStoreDialog = ref(false)
const storeCategories = ref([])

const openStoreDialog = async () => {
  activeTab.value = 'store'
  try {
    if (storeCategories.value.length === 0) {
      const resp = await apiService.getStoreCategories({ is_active: true })
      storeCategories.value = resp.data?.results || resp.data || []
    }
    showStoreDialog.value = true
  } catch (e) {
    console.warn('Failed to load store categories:', e)
    showStoreDialog.value = true
  }
}

const closeStoreDialog = () => {
  showStoreDialog.value = false
  updateActiveTab()
}

const isDefault = (id) => String(sessionStorage.getItem('defaultStore') || '') === String(id)

const selectStore = async (id) => {
  sessionStorage.setItem('defaultStore', String(id))
  showStoreDialog.value = false
  // Force reactivity update
  if (storeCategories.value.length > 0) {
    storeCategories.value = [...storeCategories.value]
  }
  
  // Check CRM flow for new store before reload
  await checkCRMFlow()
  
  // Reload to refresh product feeds with selected category
  location.reload()
}

const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Beauty': Sparkles,
    'Fashion': Shirt,
    'Pharmacy': Pill,
    'Furniture': Sofa,
    'Electronics': Monitor,
    'Automobile': Car
  }
  return iconMap[categoryName] || Store
}

const getDefaultStoreIcon = () => {
  const defaultStoreId = sessionStorage.getItem('defaultStore')
  if (defaultStoreId && storeCategories.value.length > 0) {
    const defaultCategory = storeCategories.value.find(cat => String(cat.id) === String(defaultStoreId))
    if (defaultCategory) {
      return getCategoryIcon(defaultCategory.name)
    }
  }
  return Store
}

// Reactive computed property for the default store icon
const defaultStoreIcon = computed(() => getDefaultStoreIcon())

// Function to check if current default store uses CRM flow
const checkCRMFlow = async () => {
  try {
    const defaultStoreId = sessionStorage.getItem('defaultStore')
    if (!defaultStoreId) {
      shouldShowRendezvous.value = false
      return
    }

    // Find the default store category
    if (storeCategories.value.length === 0) {
      const resp = await apiService.getStoreCategories({ is_active: true })
      storeCategories.value = resp.data?.results || resp.data || []
    }

    const defaultCategory = storeCategories.value.find(cat => String(cat.id) === String(defaultStoreId))
    if (defaultCategory) {
      const response = await apiService.checkStoreCategoryCRMFlow(defaultCategory.id)
      shouldShowRendezvous.value = response.data.default_to_crm || false
      
      // If showing rendezvous, fetch pending requests count
      if (shouldShowRendezvous.value) {
        await fetchPendingViewingRequests()
      }
    }
  } catch (error) {
    console.error('Failed to check CRM flow:', error)
    shouldShowRendezvous.value = false
  }
}

// Function to fetch pending viewing requests count
const fetchPendingViewingRequests = async () => {
  try {
    const response = await apiService.getViewingRequestStats()
    pendingViewingRequests.value = response.data.pending_requests || 0
  } catch (error) {
    console.error('Failed to fetch viewing request stats:', error)
    pendingViewingRequests.value = 0
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style> 