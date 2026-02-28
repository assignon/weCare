<template>
  <!-- Back button header -->
  <div v-if="showBack" class="mb-4">
    <button 
      @click="goBack"
      class="w-10 h-10 flex items-center justify-center rounded-2xl bg-grey-50 hover:bg-grey-100 transition-colors"
    >
      <ArrowLeft class="w-5 h-5 text-navy" />
    </button>
  </div>
  
  <!-- Search bar -->
  <div v-else-if="shouldShowSearch" class="fixed top-0 left-0 right-0 z-50 px-5 pt-3 pb-3 bg-white/90 backdrop-blur-md">
    <div class="relative flex items-center gap-2">
      <div class="relative flex-1 min-w-0">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-grey-400" />
        </div>
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search_placeholder')"
          class="w-full pl-11 pr-10 h-12 text-sm bg-grey-50 border-0 rounded-2xl placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-navy/10 focus:bg-white transition-all duration-200"
          @input="handleSearch"
          @keyup.enter="handleSearch"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-grey-200 text-grey-500 hover:bg-grey-300 transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
      <router-link
        :to="{ name: 'Notification' }"
        class="relative w-10 h-10 flex-shrink-0 flex items-center justify-center text-navy hover:opacity-80 transition-opacity"
      >
        <Bell class="w-5 h-5" />
        <span
          v-if="notification.hasUnreadNotifications"
          class="absolute top-0 right-0 bg-error-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold leading-none px-1"
        >
          {{ notification.unreadCount > 99 ? '99+' : notification.unreadCount }}
        </span>
      </router-link>
      <button 
        v-if="showFilterButton"
        @click="handleFilterClick"
        class="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl bg-navy transition-colors hover:bg-navy-500"
      >
        <Filter class="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { Search, X, ArrowLeft, Filter, Bell } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false
  },
  customTitle: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const notification = useNotificationStore()
const searchQuery = ref('')
const searchInput = ref(null)

// Sync with product store search query
watch(() => productStore.searchQuery, (newQuery) => {
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery || ''
  }
})

onMounted(() => {
  // Initialize search query from store
  searchQuery.value = productStore.searchQuery || ''
  
  // Auto focus search input on StoreCategory page
  if (route.name === 'StoreCategory') {
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    })
  }
})

// Watch for route changes to auto focus on StoreCategory page
watch(() => route.name, (newRoute) => {
  if (newRoute === 'StoreCategory') {
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    })
  }
})

// Debounce search
let searchTimeout = null

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      // Check if we're on Home page - navigate to StoreCategory and search all products
      if (route.name === 'Home') {
        // Search all products without store category filter and navigate to StoreCategory
        await productStore.searchProducts(searchQuery.value, true) // true = skip store category filter
        router.push({ name: 'StoreCategory' })
      } else if (route.name === 'StoreCategory') {
        // Search all products without store category filter, don't redirect
        await productStore.searchProducts(searchQuery.value, true) // true = skip store category filter
      } else {
        // Set search in store and navigate to Explore page
        await productStore.searchProducts(searchQuery.value)
        if (route.name !== 'Explore') {
          router.push({ name: 'Explore' })
        }
      }
    } else {
      await clearSearch()
    }
  }, 300) // 300ms debounce
}

const clearSearch = async () => {
  searchQuery.value = ''
  productStore.clearFilters()
  
  // Check if we're on Home or StoreCategory page - don't redirect
  if (route.name === 'Home') {
    // On Home page, just clear the search (no need to fetch products)
    // The page will show its normal content
  } else if (route.name === 'StoreCategory') {
    // On StoreCategory page, clear search to show categories again
    // Products will be cleared and categories will show
  } else if (route.name === 'Explore') {
    // If on Explore page, refresh products there
    await productStore.fetchProducts()
  } else {
    // Navigate to Explore page
    router.push({ name: 'Explore' })
  }
}

// Watch for route changes to sync search query
watch(() => route.name, (newRoute) => {
  if (newRoute === 'Explore' || newRoute === 'Home' || newRoute === 'StoreCategory') {
    // Sync search query when on Explore, Home, or StoreCategory
    searchQuery.value = productStore.searchQuery || ''
  } else {
    // Clear search when navigating away
    searchQuery.value = ''
  }
})

// Hide search on certain pages
const shouldShowSearch = computed(() => {
  const hiddenRoutes = [
    'Profile', 'Cart', 'Rendezvous', 'Orders', 'Checkout', 'OrderStatus', 'ProductDetails',
    'EditProfile', 'SkinProfile', 'Addresses', 'CustomerSupport'
  ]
  return !hiddenRoutes.includes(route.name) && !props.showBack
})

// Show filter button only on Explore page
const showFilterButton = computed(() => {
  return route.name === 'Explore'
})

// Filter button handler
const handleFilterClick = () => {
  // Emit event to parent or use event bus to trigger filter
  // For now, we'll use a custom event that Explore page can listen to
  window.dispatchEvent(new CustomEvent('openFilter'))
}

// Back button handler
const goBack = () => {
  router.push({ name: 'Profile' })
}
</script>
