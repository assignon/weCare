<template>
  <nav class="fixed bottom-4 left-4 right-4 z-50 bg-navy rounded-3xl shadow-float">
    <div class="flex items-center justify-around h-16 px-2">
      <router-link 
        :to="{ name: 'Home' }"
        class="nav-tab text-white"
        :class="activeTab === 'home' ? 'nav-tab-active opacity-100' : 'opacity-70 hover:opacity-100'"
      >
        <Home class="w-5 h-5" />
        <span class="text-[10px] font-medium mt-0.5">{{ $t('navigation.home') }}</span>
      </router-link>
      
      <router-link 
        :to="{ name: 'StoreCategory' }"
        class="nav-tab text-white"
        :class="activeTab === 'storecategory' ? 'nav-tab-active opacity-100' : 'opacity-70 hover:opacity-100'"
      >
        <Search class="w-5 h-5" />
        <span class="text-[10px] font-medium mt-0.5">{{ $t('navigation.search') }}</span>
      </router-link>
      
      <router-link 
        :to="{ name: 'MyListings' }"
        class="nav-tab text-white"
        :class="activeTab === 'mylistings' ? 'nav-tab-active opacity-100' : 'opacity-70 hover:opacity-100'"
      >
        <Megaphone class="w-5 h-5" />
        <span class="text-[10px] font-medium mt-0.5">{{ $t('navigation.ads') }}</span>
      </router-link>

      <button 
        @click="openMoreMenu"
        class="nav-tab text-white"
        :class="showMoreMenu ? 'nav-tab-active opacity-100' : 'opacity-70 hover:opacity-100'"
        type="button"
      >
        <MoreVertical class="w-5 h-5" />
        <span class="text-[10px] font-medium mt-0.5">{{ $t('navigation.more') }}</span>
      </button>
    </div>
  </nav>

  <!-- More Menu Drawer -->
  <Transition name="slide-left">
    <div v-if="showMoreMenu" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeMoreMenu"></div>
      <div class="absolute right-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl">
        <!-- Header -->
        <div class="px-6 pt-14 pb-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-navy">Menu</h3>
            <button 
              @click="navigateToCart"
              class="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-grey-50 hover:bg-grey-100 transition-colors"
            >
              <ShoppingCart class="w-5 h-5 text-navy" />
              <span 
                v-if="cart.cartItemCount > 0"
                class="badge-count"
              >
                {{ cart.cartItemCount > 99 ? '99+' : cart.cartItemCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Main Navigation -->
        <div class="flex-1 px-4 py-2 overflow-y-auto">
          <div class="space-y-1">
            <router-link 
              :to="{ name: 'Orders' }"
              @click="closeMoreMenu"
              class="drawer-item"
              :class="activeTab === 'orders' ? 'drawer-item-active' : ''"
            >
              <div class="drawer-icon"><Package class="w-5 h-5" /></div>
              <span>{{ $t('navigation.orders') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'Rendezvous' }"
              @click="closeMoreMenu"
              class="drawer-item"
              :class="activeTab === 'rendezvous' ? 'drawer-item-active' : ''"
            >
              <div class="drawer-icon relative">
                <Calendar class="w-5 h-5" />
                <span 
                  v-if="activeViewingRequests > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold"
                >
                  {{ activeViewingRequests > 99 ? '99+' : activeViewingRequests }}
                </span>
              </div>
              <span>{{ $t('navigation.viewing_requests') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'MyBookings' }"
              @click="closeMoreMenu"
              class="drawer-item"
              :class="activeTab === 'mybookings' ? 'drawer-item-active' : ''"
            >
              <div class="drawer-icon relative">
                <CalendarDays class="w-5 h-5" />
                <span 
                  v-if="pendingBookingsCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold"
                >
                  {{ pendingBookingsCount > 99 ? '99+' : pendingBookingsCount }}
                </span>
              </div>
              <span>{{ $t('navigation.my_bookings') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'MyListings' }"
              @click="closeMoreMenu"
              class="drawer-item"
            >
              <div class="drawer-icon"><Megaphone class="w-5 h-5" /></div>
              <span>{{ $t('navigation.my_ads') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'ListingInquiries' }"
              @click="closeMoreMenu"
              class="drawer-item"
            >
              <div class="drawer-icon relative">
                <MessageSquareQuote class="w-5 h-5" />
                <span 
                  v-if="listingStore.unreadInquiriesCount > 0"
                  class="absolute -top-1 -right-1 bg-error-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                >
                  {{ listingStore.unreadInquiriesCount > 99 ? '99+' : listingStore.unreadInquiriesCount }}
                </span>
              </div>
              <span>{{ $t('navigation.inquiries') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'Messages' }"
              @click="closeMoreMenu"
              class="drawer-item"
            >
              <div class="drawer-icon"><MessageCircle class="w-5 h-5" /></div>
              <span>{{ $t('navigation.messages') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'Notification' }"
              @click="closeMoreMenu"
              class="drawer-item"
              :class="activeTab === 'notification' ? 'drawer-item-active' : ''"
            >
              <div class="drawer-icon relative">
                <Bell class="w-5 h-5" />
                <span 
                  v-if="notification.hasUnreadNotifications"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold"
                >
                  {{ notification.unreadCount > 99 ? '99+' : notification.unreadCount }}
                </span>
              </div>
              <span>{{ $t('navigation.notifications') }}</span>
            </router-link>
            
            <router-link 
              :to="{ name: 'LikedProducts' }"
              @click="closeMoreMenu"
              class="drawer-item"
            >
              <div class="drawer-icon"><Heart class="w-5 h-5" /></div>
              <span>{{ $t('navigation.likes') }}</span>
            </router-link>
          </div>
        </div>

        <!-- User Section -->
        <div class="px-4 pb-8 pt-4 border-t border-grey-100">
          <button 
            @click="navigateToProfile"
            class="w-full flex items-center gap-3 py-3 px-3 rounded-2xl hover:bg-grey-50 transition-colors"
          >
            <div class="w-10 h-10 rounded-2xl bg-warm-200 flex items-center justify-center overflow-hidden">
              <img 
                v-if="auth.user?.profile_picture" 
                :src="auth.user.profile_picture" 
                alt="User" 
                class="w-full h-full object-cover"
              />
              <span v-else class="text-navy font-bold text-sm">
                {{ auth.user?.first_name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'U' }}
              </span>
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-navy">
                {{ auth.user?.first_name && auth.user?.last_name 
                  ? `${auth.user.first_name} ${auth.user.last_name}` 
                  : auth.user?.email?.split('@')[0] || 'User' }}
              </p>
              <p class="text-xs text-grey-400">{{ $t('navigation.view_profile') }}</p>
            </div>
          </button>
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
import { Home, Search, Receipt, ShoppingCart, Store, Sparkles, Shirt, Pill, Sofa, Monitor, Car, Calendar, CalendarDays, MoreVertical, Bell, User, X, ChevronRight, Package, MessageCircle, MessageSquareQuote, Megaphone } from 'lucide-vue-next'
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
const activeViewingRequests = computed(() => crmStore.activeViewingRequests ?? 0)

// Use Pharmacy store for state
const shouldHideExploreAndCart = computed(() => pharmacyStore.shouldHideExploreAndCart)

// Pending bookings count for "Mes réservations" badge (status = en attente / pending)
const pendingBookingsCount = ref(0)
const fetchPendingBookingsCount = async () => {
  if (!auth.isAuthenticated) return
  try {
    const res = await apiService.getMyBookings({ status: 'pending' })
    const list = res.data?.results ?? res.data ?? []
    pendingBookingsCount.value = Array.isArray(list) ? list.length : 0
  } catch (e) {
    pendingBookingsCount.value = 0
  }
}

// Update active tab based on current route
const updateActiveTab = () => {
  const routeTabMap = {
    'Home': 'home',
    'StoreCategory': 'storecategory',
    'Explore': 'explore',
    'Orders': 'orders',
    'MyListings': 'mylistings',
    'Rendezvous': 'rendezvous',
    'MyBookings': 'mybookings',
    'Notification': 'notification'
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
    
    try {
      await listingStore.fetchSellerInquiries()
    } catch (error) {
      console.warn('Failed to fetch seller inquiries:', error)
    }
    
    try {
      await crmStore.fetchViewingRequestStatsForBadge()
    } catch (e) {
      console.warn('Failed to fetch viewing request stats:', e)
    }
    try {
      await fetchPendingBookingsCount()
    } catch (e) {
      console.warn('Failed to fetch pending bookings count:', e)
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
  try {
    await listingStore.fetchSellerInquiries()
    await crmStore.fetchViewingRequestStatsForBadge()
    await fetchPendingBookingsCount()
  } catch (error) {
    console.warn('Failed to refresh menu counts:', error)
  }
}

const closeMoreMenu = () => {
  showMoreMenu.value = false
  updateActiveTab()
}

const navigateToCart = () => {
  closeMoreMenu()
  router.push({ name: 'Cart' })
}

const navigateToProfile = () => {
  closeMoreMenu()
  router.push({ name: 'Profile' })
}

const openStoreDialog = async () => {
  // Don't show store dialog when shopper is logged in
  // activeTab.value = 'store'
  // try {
  //   if (storeCategories.value.length === 0) {
  //     const resp = await apiService.getStoreCategories({ is_active: true })
  //     storeCategories.value = resp.data?.results || resp.data || []
  //   }
  //   showStoreDialog.value = true
  // } catch (e) {
  //   console.warn('Failed to load store categories:', e)
  //   showStoreDialog.value = true
  // }
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
.nav-tab {
  @apply flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative;
}

.nav-tab-active {
  @apply opacity-100;
}

.drawer-item {
  @apply flex items-center gap-3 py-3 px-3 rounded-2xl text-sm font-medium text-grey-600 hover:bg-grey-50 transition-all duration-200;
}

.drawer-item-active {
  @apply bg-navy/5 text-navy;
}

.drawer-icon {
  @apply w-9 h-9 rounded-xl bg-grey-50 flex items-center justify-center flex-shrink-0;
}

.drawer-item-active .drawer-icon {
  @apply bg-navy/10;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
}

.slide-left-enter-from .absolute.right-0,
.slide-left-leave-to .absolute.right-0 {
  transform: translateX(100%);
}
</style> 