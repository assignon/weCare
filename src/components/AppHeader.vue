<template>
  <!-- Back button header -->
  <div v-if="showBack" class="mb-6">
    <button 
      @click="goBack"
      class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div class="gradient-arrow-wrapper">
        <ArrowLeft class="w-6 h-6" />
      </div>
    </button>
  </div>
  
  <!-- Search bar -->
  <div v-else-if="shouldShowSearch" class="fixed top-0 left-0 right-0 z-50 px-4 py-3">
    <div class="relative group flex items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search for products..."
          class="w-full pl-12 pr-12 py-3 bg-white border border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-sm"
          @input="handleSearch"
          @keyup.enter="handleSearch"
        />
        <button 
          v-if="searchQuery" 
          @click="clearSearch"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <button 
        v-if="showFilterButton"
        @click="handleFilterClick"
        class="w-12 h-12 flex items-center justify-center rounded-xl transition-colors"
        style="background: linear-gradient(to right, #8c36ea, #3060eb);"
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
import { Search, X, ArrowLeft, Filter } from 'lucide-vue-next'

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

<style scoped>
.gradient-arrow-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
  background: linear-gradient(to right, #8c36ea, #3060eb);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.gradient-arrow-wrapper :deep(svg) {
  display: none;
}
</style> 