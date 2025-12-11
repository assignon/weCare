<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
    <div class="flex items-center justify-around h-16">
      <router-link 
        :to="{ name: 'Home' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Home v-if="activeTab === 'home'" class="w-6 h-6" />
          <Home v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div 
            v-if="activeTab === 'home'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
      </router-link>
      
      <router-link 
        :to="{ name: 'StoreCategory' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'storecategory' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Search v-if="activeTab === 'storecategory'" class="w-6 h-6" />
          <Search v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div 
            v-if="activeTab === 'storecategory'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
      </router-link>
      
      <!-- Cart Tab -->
      <router-link 
        :to="{ name: 'Cart' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'cart' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <ShoppingCart v-if="activeTab === 'cart'" class="w-6 h-6" />
          <ShoppingCart v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
          
          <!-- Cart item count badge -->
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
      </router-link>

      <!-- Send Parcel Tab -->
      <router-link 
        :to="{ name: 'SendParcel' }"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="activeTab === 'sendparcel' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        <div class="relative">
          <Package2 v-if="activeTab === 'sendparcel'" class="w-6 h-6" />
          <Package2 v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
          
          <div 
            v-if="activeTab === 'sendparcel'" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
      </router-link>

      <!-- More menu button -->
      <button 
        @click="openMoreMenu"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 relative group"
        :class="showMoreMenu ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        type="button"
      >
        <div class="relative">
          <MoreVertical v-if="showMoreMenu" class="w-6 h-6" />
          <MoreVertical v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div 
            v-if="showMoreMenu" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          ></div>
        </div>
      </button>
    </div>
  </nav>

  <!-- More Menu Drawer (Right Side) -->
  <Transition name="slide-left">
    <div v-if="showMoreMenu" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/40" @click="closeMoreMenu"></div>
      <div class="absolute right-0 top-0 bottom-0 w-72 bg-gray-100 flex flex-col">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/AE-no-text.svg" alt="AfriQExpress" class="w-10 h-10 object-contain" />
              </div>
              <h2 class="text-base font-semibold text-[#1a5f2a]">AfriQExpress</h2>
            </div>
            <button 
              @click="navigateToNotification"
              class="relative w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
            >
              <Bell class="w-5 h-5 text-[#333333]" />
              <span 
                v-if="notification.hasUnreadNotifications"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
              >
                {{ notification.unreadCount > 99 ? '99+' : notification.unreadCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Main Navigation -->
        <div class="flex-1 px-6 py-4 border-b border-gray-300">
          <div class="space-y-1">
            <!-- Orders -->
            <router-link 
              :to="{ name: 'Orders' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
              :class="activeTab === 'orders' ? 'bg-gray-200' : ''"
            >
              <Package class="w-5 h-5 text-[#333333]" />
              <span class="text-base font-semibold text-[#333333]">Orders</span>
            </router-link>
            
            <!-- Rendezvous -->
            <router-link 
              :to="{ name: 'Rendezvous' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group relative"
              :class="activeTab === 'rendezvous' ? 'bg-gray-200' : ''"
            >
              <div class="relative">
                <Calendar class="w-5 h-5 text-[#333333]" />
                <span 
                  v-if="pendingViewingRequests > 0"
                  class="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                >
                  {{ pendingViewingRequests > 99 ? '99+' : pendingViewingRequests }}
                </span>
              </div>
              <span class="text-base font-semibold text-[#333333]">Viewing Requests</span>
            </router-link>
            
            <!-- My Ads -->
            <router-link 
              :to="{ name: 'MyListings' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
            >
              <Megaphone class="w-5 h-5 text-[#333333]" />
              <span class="text-base font-semibold text-[#333333]">My Ads</span>
            </router-link>
            
            <!-- Inquiries -->
            <router-link 
              :to="{ name: 'ListingInquiries' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group relative"
            >
              <div class="relative">
                <MessageSquareQuote class="w-5 h-5 text-[#333333]" />
                <span 
                  v-if="listingStore.unreadInquiriesCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                >
                  {{ listingStore.unreadInquiriesCount > 99 ? '99+' : listingStore.unreadInquiriesCount }}
                </span>
              </div>
              <span class="text-base font-semibold text-[#333333]">Inquiries</span>
            </router-link>
            
            <!-- Messages -->
            <router-link 
              :to="{ name: 'Messages' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
            >
              <MessageCircle class="w-5 h-5 text-[#333333]" />
              <span class="text-base font-semibold text-[#333333]">Messages</span>
            </router-link>
            
            <!-- Parcels -->
            <router-link 
              :to="{ name: 'ParcelsList' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
            >
              <Package2 class="w-5 h-5 text-[#333333]" />
              <span class="text-base font-semibold text-[#333333]">Parcels</span>
            </router-link>
            
            <!-- Likes -->
            <router-link 
              :to="{ name: 'LikedProducts' }"
              @click="closeMoreMenu"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
            >
              <Heart class="w-5 h-5 text-[#333333]" />
              <span class="text-base font-semibold text-[#333333]">Likes</span>
            </router-link>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="px-6 pb-6 pt-4">
          <div class="space-y-1">
            <!-- User Info -->
            <button 
              @click="navigateToProfile"
              class="w-full flex items-center space-x-4 py-3 px-2 hover:bg-gray-200 transition-colors group"
            >
              <div class="w-8 h-8 rounded-xl bg-[#E0B95B] flex items-center justify-center overflow-hidden">
                <img 
                  v-if="auth.user?.profile_picture" 
                  :src="auth.user.profile_picture" 
                  alt="User" 
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-[#333333] font-semibold text-sm">
                  {{ auth.user?.first_name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
              </div>
              <span class="text-base font-semibold text-[#333333]">
                {{ auth.user?.first_name && auth.user?.last_name 
                  ? `${auth.user.first_name} ${auth.user.last_name}` 
                  : auth.user?.email?.split('@')[0] || 'User' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useCRMStore } from '@/stores/crm'
import { usePharmacyStore } from '@/stores/pharmacy'
import { useAuthStore } from '@/stores/auth'
import { useListingStore } from '@/stores/listing'
import { Home, Search, Receipt, ShoppingCart, Store, Sparkles, Shirt, Pill, Sofa, Monitor, Car, Calendar, MoreVertical, Bell, User, X, ChevronRight, Package, MessageCircle, MessageSquareQuote, Megaphone, Package2 } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const notification = useNotificationStore()
const crmStore = useCRMStore()
const pharmacyStore = usePharmacyStore()
const auth = useAuthStore()
const listingStore = useListingStore()

const activeTab = ref('home')

const currentRouteName = computed(() => route.name)

// Use CRM store for state
const shouldShowRendezvous = computed(() => crmStore.shouldShowRendezvous)
const pendingViewingRequests = computed(() => crmStore.pendingViewingRequests)

// Use Pharmacy store for state
const shouldHideExploreAndCart = computed(() => pharmacyStore.shouldHideExploreAndCart)

// Update active tab based on current route
const updateActiveTab = () => {
  const routeTabMap = {
    'Home': 'home',
    'StoreCategory': 'storecategory',
    'Explore': 'explore',
    'Orders': 'orders',
    'Cart': 'cart',
    'Rendezvous': 'rendezvous',
    'SendParcel': 'sendparcel'
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
    
    // Fetch seller inquiries to get unread count
    try {
      await listingStore.fetchSellerInquiries()
    } catch (error) {
      console.warn('Failed to fetch seller inquiries:', error)
    }
    
    // Load store categories to ensure default store icon is displayed
    if (sessionStorage.getItem('defaultStore')) {
      try {
        const resp = await apiService.getStoreCategories({ is_active: true })
        storeCategories.value = resp.data?.results || resp.data || []
        
        // Initialize CRM state from session
        console.log('🚀 BottomNav: Initializing CRM state from session...')
        await crmStore.initializeFromSession()
        
        // Initialize Pharmacy state from session
        console.log('🚀 BottomNav: Initializing Pharmacy state from session...')
        await pharmacyStore.initializeFromSession()
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

// More menu state
const showMoreMenu = ref(false)

// Store dialog state
const showStoreDialog = ref(false)
const storeCategories = ref([])

const openMoreMenu = async () => {
  showMoreMenu.value = true
  // Refresh inquiries count when opening the menu
  try {
    await listingStore.fetchSellerInquiries()
  } catch (error) {
    console.warn('Failed to refresh seller inquiries:', error)
  }
}

const closeMoreMenu = () => {
  showMoreMenu.value = false
  updateActiveTab()
}

const navigateToNotification = () => {
  closeMoreMenu()
  router.push({ name: 'Notification' })
}

const navigateToProfile = () => {
  closeMoreMenu()
  router.push({ name: 'Profile' })
}

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
  console.log('🏪 BottomNav: Store selected, ID:', id)
  
  sessionStorage.setItem('defaultStore', String(id))
  showStoreDialog.value = false
  
  // Force reactivity update
  if (storeCategories.value.length > 0) {
    storeCategories.value = [...storeCategories.value]
  }
  
  // Find the selected category name for debugging
  const selectedCategory = storeCategories.value.find(cat => String(cat.id) === String(id))
  console.log('🏪 BottomNav: Selected category:', selectedCategory?.name)
  
  // Check CRM flow for new store
  console.log('🔄 BottomNav: Calling CRM store checkCategoryFlow...')
  await crmStore.checkCategoryFlow(parseInt(id))
  
  // Check pharmacy category for new store
  console.log('🔄 BottomNav: Calling Pharmacy store checkCategoryForPharmacy...')
  await pharmacyStore.checkCategoryForPharmacy(parseInt(id), selectedCategory?.name)
  
  console.log('🔄 BottomNav: CRM and Pharmacy checks complete, reloading page...')
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


</script>

<style scoped>
/* Slide left animation for drawer */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from .absolute.right-0 {
  transform: translateX(100%);
}

.slide-left-leave-to .absolute.right-0 {
  transform: translateX(100%);
}
</style> 