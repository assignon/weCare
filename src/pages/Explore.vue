<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="p-4">
      <!-- Enhanced Header -->
      <AppHeader />

      <!-- Search bar -->
      <transition name="slide-down">
        <div v-if="showSearch" class="mb-6">
          <div class="relative group">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              v-model="search"
              type="text"
              placeholder="Search for products..."
              class="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
              @input="handleSearch"
              @keyup="search.trim() === '' && clearSearch()"
            />
            <button 
              v-if="search" 
              @click="clearSearch"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </transition>

      <!-- Filter section -->
      <div class="sticky top-0 z-10 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pt-2 pb-4 mb-4">
        <div class="flex justify-between items-center">
          <button 
            @click="showFilterOptions = !showFilterOptions"
            class="flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 shadow-sm"
          >
            <Filter class="w-4 h-4 mr-2" />
            Filter
          </button>

          <div class="flex-1 ml-4 overflow-x-auto">
            <div class="flex space-x-3">
              <button 
                @click="showAllProducts"
                class="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                All
              </button>
              <button 
                v-for="category in productStore.categories" 
                :key="category.id"
                @click="filterByCategory(category.id)"
                :class="[
                  'px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
                  productStore.selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white hover:border-blue-500/50'
                ]"
                :style="productStore.selectedCategory === category.id ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter options -->
      <transition name="slide-down">
        <div v-if="showFilterOptions" class="mb-6 p-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <div class="space-y-6">
            <!-- Skin Type Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3">Filter by Skin Type</label>
              <select 
                v-model="selectedSkinTypes" 
                multiple
                @change="applySkinTypeFilter"
                class="w-full p-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option 
                  v-for="skinType in productStore.skinTypes" 
                  :key="skinType.id" 
                  :value="skinType.id"
                >
                  {{ skinType.name }}
                </option>
              </select>
            </div>

            <!-- Skin Concern Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3">Filter by Skin Concern</label>
              <select 
                v-model="selectedSkinConcerns" 
                multiple
                @change="applySkinConcernFilter"
                class="w-full p-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option 
                  v-for="concern in productStore.skinConcerns" 
                  :key="concern.id" 
                  :value="concern.id"
                >
                  {{ concern.name }}
                </option>
              </select>
            </div>

            <!-- Product Type Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-3">Filter by Product Type</label>
              <select 
                v-model="selectedProductTypes" 
                multiple
                @change="applyProductTypeFilter"
                class="w-full p-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option 
                  v-for="productType in productStore.productTypes" 
                  :key="productType.id" 
                  :value="productType.id"
                >
                  {{ productType.name }}
                </option>
              </select>
            </div>

            <div class="flex justify-end pt-2">
              <button 
                @click="clearAllFilters"
                class="px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50/50 hover:bg-blue-100/50 rounded-2xl transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- All Products Section with Infinite Scroll -->
      <div class="mb-6">
        <!-- Loading state for initial load -->
        <div v-if="loading && productStore.products.length === 0" class="flex justify-center my-12">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200" style="border-color: #dbeafe;"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0" style="border-color: #2563eb;"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="mb-6 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl">
          <div class="flex items-center">
            <AlertCircle class="w-6 h-6 text-red-500 mr-3" />
            <span class="text-red-700 font-medium">{{ error }}</span>
          </div>
        </div>

        <!-- Products grid -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 gap-4 mt-6">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            @click="navigateToDetails(product.id)"
            class="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-white/20 hover:border-blue-500/20 transform hover:-translate-y-1"
          >
            <div class="aspect-square overflow-hidden relative">
              <img 
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-sm text-gray-900 mb-2 truncate capitalize leading-tight">{{ product.name }}</h3>
              <p class="text-xs text-gray-500 mb-3 truncate">{{ product.seller_name || 'weCare' }}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-lg text-gray-900">{{ formatApiPrice(product) }}</span>
                <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                  <ArrowRight class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Infinite Scroll Loading -->
        <div v-if="hasMoreProducts && productStore.products.length > 0" ref="loadMoreTrigger" class="text-center py-8">
          <div v-if="loadingMore" class="relative inline-block">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-200" style="border-color: #dbeafe;"></div>
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0" style="border-color: #2563eb;"></div>
          </div>
          <p v-if="loadingMore" class="text-sm text-gray-600 mt-3 font-medium">
            Loading more products...
          </p>
        </div>

        <!-- End of Results -->
        <div v-if="!hasMoreProducts && productStore.products.length > 0 && !loading" class="text-center py-12 mb-20">
          <div class="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6" style="background: linear-gradient(to right, #2563eb, #9333ea);"></div>
          <CheckCircle class="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p class="text-sm text-gray-600 font-medium">
            That's all for now!
          </p>
          <p class="text-xs text-gray-500 mt-1">
            You've seen all {{ filteredProducts.length }} products
          </p>
        </div>

        <!-- No products state -->
        <div v-else-if="!loading && filteredProducts.length === 0" class="text-center my-12">
          <div class="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6" style="background: linear-gradient(to right, #dbeafe, #e9d5ff);">
            <img :src="emptyBoxImage" alt="No products" class="w-20 h-20 opacity-60" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
          <p class="text-sm text-gray-600">Check back soon for new products.</p>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'
import packagingImage from '@/assets/packaging_10471395.png'
import emptyBoxImage from '@/assets/unboxing_empty.png'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'
import { 
  Bell, User, Search, X, Filter, AlertCircle, CheckCircle, ShoppingBag, ArrowRight
} from 'lucide-vue-next'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()
const auth = useAuthStore()
const notification = useNotificationStore()
const { formatApiPrice } = useCurrency()

// Search functionality
const search = ref('')
const showSearch = ref(false)
const isSearching = ref(false)

// Filter functionality
const showFilterOptions = ref(false)
const selectedSkinTypes = ref([])
const selectedSkinConcerns = ref([])
const selectedProductTypes = ref([])
const isFiltering = ref(false)

// Infinite scroll for all products
const loadingMore = ref(false)
const hasMoreProducts = ref(true)
const loadMoreTrigger = ref(null)
let observer = null

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

// Computed property to handle local filtering for multiple skin types, skin concerns, and product types
const filteredProducts = computed(() => {
  let products = productStore.products

  // Filter by multiple skin types
  if (selectedSkinTypes.value.length > 1) {
    products = products.filter(product => {
      // Check if product has any of the selected skin types
      return product.suitable_for && product.suitable_for.some(skinType =>
        selectedSkinTypes.value.includes(skinType.id)
      )
    })
  }

  // Filter by skin concerns
  if (selectedSkinConcerns.value.length > 0) {
    products = products.filter(product => {
      // Check if product addresses any of the selected skin concerns
      return product.skin_concerns && product.skin_concerns.some(concern =>
        selectedSkinConcerns.value.includes(concern.id)
      )
    })
  }

  // Filter by product types
  if (selectedProductTypes.value.length > 0) {
    products = products.filter(product => {
      // Check if product matches any of the selected product types
      return product.product_types && product.product_types.some(type =>
        selectedProductTypes.value.includes(type.id)
      )
    })
  }

  return products
})

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
}

// Dynamic section title based on current view
const sectionTitle = computed(() => {
  if (isSearching.value) return 'Search Results'
  if (isFiltering.value) return 'Filtered Products'
  return 'All Products'
})

const navigateToProfile = () => {
  router.push({ name: 'Profile' })
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    isSearching.value = true
  } else {
    clearSearch()
  }
}

const handleSearch = async () => {
  if (search.value.trim()) {
    isSearching.value = true
    const hasMore = await productStore.searchProducts(search.value)
    hasMoreProducts.value = hasMore
  } else {
    await clearSearch()
  }
}

const clearSearch = async () => {
  search.value = ''
  isSearching.value = false
  productStore.clearFilters()
  const hasMore = await productStore.fetchProducts()
  hasMoreProducts.value = hasMore
}

const applySkinTypeFilter = async () => {
  isFiltering.value = true
  const hasMore = await productStore.filterBySkinTypes(selectedSkinTypes.value)
  hasMoreProducts.value = hasMore
}

const applySkinConcernFilter = async () => {
  isFiltering.value = true
  // For now, we'll handle skin concern filtering locally since the API might not support it yet
  // You can extend the backend API to support skin concern filtering if needed
}

const applyProductTypeFilter = async () => {
  isFiltering.value = true
  // For now, we'll handle product type filtering locally since the API might not support it yet
  // You can extend the backend API to support product type filtering if needed
}

const clearAllFilters = async () => {
  selectedSkinTypes.value = []
  selectedSkinConcerns.value = []
  selectedProductTypes.value = []
  isFiltering.value = false
  productStore.clearFilters()
  const hasMore = await productStore.fetchProducts()
  hasMoreProducts.value = hasMore
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

const filterByCategory = async (categoryId) => {
  isFiltering.value = true
  const hasMore = await productStore.filterByCategory(categoryId)
  hasMoreProducts.value = hasMore
}

const showAllProducts = async () => {
  productStore.clearFilters()
  const hasMore = await productStore.fetchProducts()
  clearAllFilters()
  hasMoreProducts.value = hasMore
  setupInfiniteScroll()
}

// Infinite scroll methods
const loadMoreProducts = async () => {
  if (loadingMore.value || !hasMoreProducts.value || isSearching.value || isFiltering.value) {
    return
  }

  loadingMore.value = true

  try {
    const currentPage = productStore.pagination?.page || 1
    const nextPage = currentPage + 1

    const hasMore = await productStore.fetchProducts({ page: nextPage }, true)
    hasMoreProducts.value = hasMore

    if (!hasMore && observer) {
      observer.disconnect()
    }
  } catch (error) {
    console.error('Error loading more products:', error)
  } finally {
    loadingMore.value = false
  }
}

const setupInfiniteScroll = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreProducts.value && !loadingMore.value && !loading.value) {
        loadMoreProducts()
      }
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  )

  nextTick(() => {
    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }
  })
}

// Watch for products changes to re-setup infinite scroll
watch(() => productStore.products, () => {
  if (productStore.products.length > 0 && !isSearching.value && !isFiltering.value) {
    nextTick(() => {
      setupInfiniteScroll()
    })
  }
}, { flush: 'post' })

onMounted(async () => {
  try {
    // Initialize cart state and fetch categories, skin types, skin concerns, and product types
    cart.initCartState()

    await Promise.all([
      productStore.fetchCategories(),
      productStore.fetchSkinTypes(),
      productStore.fetchSkinConcerns(),
      productStore.fetchProductTypes(),
      cart.fetchCart().catch(err => {
        console.error('Cart fetch failed, continuing anyway:', err)
      })
    ])

    // init notification store
    await notification.init()

    // Fetch products
    const hasMoreFromInitialLoad = await productStore.fetchProducts()
    hasMoreProducts.value = hasMoreFromInitialLoad

    // Setup infinite scroll after initial load
    nextTick(() => {
      setupInfiniteScroll()
    })
  } catch (error) {
    console.error('Error during Explore page initialization:', error)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive grid */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Custom scrollbar for filter chips */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to right, #2563eb, #9333ea);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to right, #1d4ed8, #7c3aed);
}
</style>