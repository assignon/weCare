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

          <div class="flex-1 ml-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="productSearch"
                type="text"
                placeholder="Search products by name..."
                class="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                @input="handleProductSearch"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Bottom Sheet -->
      <div 
        v-if="showFilterOptions"
        class="fixed inset-0 z-50 flex items-end"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="showFilterOptions = false"
        ></div>

        <!-- Bottom Sheet -->
        <div 
          class="relative w-full h-[95vh] bg-white rounded-t-3xl shadow-2xl flex flex-col transform transition-all duration-300 ease-out"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 rounded-t-3xl shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Filter Products</h3>
                <span class="text-xs text-gray-500">Personalized for your selected store</span>
              </div>
              <button 
                @click="showFilterOptions = false"
                class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <X class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 mb-16">
            <div class="space-y-6">
              <!-- Dynamic attribute filters (from CategoryAttributeTemplate by store category) -->
              <div v-if="storeAttributeTemplates.length > 0" class="space-y-6">
                <div class="grid grid-cols-1 gap-6">
                  <div v-for="tpl in storeAttributeTemplates" :key="tpl.id" class="bg-gray-50/50 rounded-2xl p-4 border border-gray-200/50">
                    <label class="block text-sm font-semibold text-gray-800 mb-3">{{ tpl.label }}</label>
                    <!-- Select / Multiselect as chips -->
                    <div v-if="tpl.field_type === 'select' || tpl.field_type === 'multiselect'">
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="opt in getChoicesArray(tpl)"
                          :key="opt"
                          type="button"
                          @click="toggleChoice(tpl, opt)"
                          :class="[
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                            isSelected(tpl, opt)
                              ? 'text-white border-transparent shadow-sm'
                              : 'text-gray-700 border-gray-200 hover:border-blue-400'
                          ]"
                          :style="isSelected(tpl, opt) ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
                        >
                          {{ opt }}
                        </button>
                      </div>
                    </div>
                    <!-- Boolean toggle -->
                    <div v-else-if="tpl.field_type === 'boolean'" class="flex items-center justify-between">
                      <span class="text-sm text-gray-700">Enable</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" :checked="getBoolean(tpl)" @change="toggleBoolean(tpl)" />
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                        <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                    <!-- Text / Number input -->
                    <div v-else>
                      <input
                        :type="tpl.field_type === 'number' || tpl.field_type === 'decimal' ? 'number' : 'text'"
                        class="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                        :placeholder="tpl.help_text || 'Type to filter'"
                        v-model="dynamicFilters[tpl.id]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback default filters when no templates available -->
              <div v-else class="space-y-6">
                <div class="text-center py-8 text-gray-500">
                  No filters available for this store.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer Actions -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg" style="position: sticky; bottom: 55px;">
            <div class="flex gap-3">
              <button 
                @click="clearDynamicFilters"
                class="flex-1 px-4 py-3 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50/50 hover:bg-blue-100/50 rounded-2xl transition-all duration-200"
              >
                Clear All
              </button>
              <button 
                @click="applyDynamicFilters"
                class="flex-1 px-4 py-3 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

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
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 gap-3 mt-6">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            @click="navigateToDetails(product.id)"
            class="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-md"
          >
            <!-- Product Image -->
            <div class="aspect-square overflow-hidden bg-gray-50">
              <img 
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Product Info -->
            <div class="p-3">
              <h3 class="font-medium text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">{{ product.name }}</h3>
              <p class="text-xs text-gray-500 mb-2">{{ product.seller_name || 'weCare' }}</p>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-base text-blue-600">{{ formatApiPrice(product) }}</span>
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
import apiService from '@/services/api'
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

// Product search functionality
const productSearch = ref('')

// Filter functionality
const showFilterOptions = ref(false)
// Note: Filter variables for skin types, concerns, and product types removed - API endpoints no longer exist
const isFiltering = ref(false)

// Dynamic store attribute templates and selections
const storeAttributeTemplates = ref([])
const dynamicFilters = ref({}) // key: template.id, value: string | string[] | boolean

const loadStoreAttributeTemplates = async () => {
  const defaultStore = sessionStorage.getItem('defaultStore')
  if (!defaultStore) {
    storeAttributeTemplates.value = []
    dynamicFilters.value = {}
    return
  }
  try {
    const { data } = await apiService.getStoreAttributesByStoreCategory({ store_category_id: defaultStore })
    const templates = data?.templates || []
    storeAttributeTemplates.value = templates.filter(t => t.is_filterable && t.is_active)
    // Initialize dynamicFilters for multiselect/select as arrays
    const init = {}
    storeAttributeTemplates.value.forEach(tpl => {
      if (tpl.field_type === 'multiselect') init[tpl.id] = []
      else if (tpl.field_type === 'boolean') init[tpl.id] = false
      else init[tpl.id] = ''
    })
    dynamicFilters.value = init
  } catch (e) {
    console.warn('Failed to load store attribute templates:', e)
    storeAttributeTemplates.value = []
    dynamicFilters.value = {}
  }
}

const getChoicesArray = (tpl) => {
  if (!tpl.choices) return []
  
  // If choices is already an array, return it
  if (Array.isArray(tpl.choices)) return tpl.choices
  
  // If choices is a string, split by comma and trim whitespace
  if (typeof tpl.choices === 'string') {
    return tpl.choices.split(',').map(choice => choice.trim()).filter(choice => choice.length > 0)
  }
  
  return []
}

const isSelected = (tpl, opt) => {
  const val = dynamicFilters.value[tpl.id]
  if (tpl.field_type === 'multiselect') return Array.isArray(val) && val.includes(opt)
  if (tpl.field_type === 'select') return val === opt
  return false
}

const toggleChoice = (tpl, opt) => {
  if (tpl.field_type === 'multiselect') {
    const arr = Array.isArray(dynamicFilters.value[tpl.id]) ? [...dynamicFilters.value[tpl.id]] : []
    const idx = arr.indexOf(opt)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(opt)
    dynamicFilters.value[tpl.id] = arr
  } else if (tpl.field_type === 'select') {
    dynamicFilters.value[tpl.id] = dynamicFilters.value[tpl.id] === opt ? '' : opt
  }
}

const getBoolean = (tpl) => {
  return !!dynamicFilters.value[tpl.id]
}

const toggleBoolean = (tpl) => {
  dynamicFilters.value[tpl.id] = !dynamicFilters.value[tpl.id]
}

const clearDynamicFilters = () => {
  Object.keys(dynamicFilters.value).forEach(key => {
    const tpl = storeAttributeTemplates.value.find(t => String(t.id) === String(key))
    if (!tpl) return
    if (tpl.field_type === 'multiselect') dynamicFilters.value[key] = []
    else if (tpl.field_type === 'boolean') dynamicFilters.value[key] = false
    else dynamicFilters.value[key] = ''
  })
}

const applyDynamicFilters = async () => {
  // Backend support for attribute-based filtering may be added later.
  // Build query params as attr_<templateId>=value[] for server-side filtering
  isFiltering.value = true
  showFilterOptions.value = false // Close the bottom sheet
  
  try {
    const defaultStore = sessionStorage.getItem('defaultStore')
    console.log('🏪 Default store:', defaultStore)
    console.log('🎛️ Dynamic filters state:', dynamicFilters.value)
    console.log('📊 Store attribute templates:', storeAttributeTemplates.value.map(t => ({ id: t.id, label: t.label, type: t.field_type })))
    
    const params = defaultStore ? { store_category: defaultStore, page_size: 24 } : { page_size: 24 }
    Object.entries(dynamicFilters.value).forEach(([templateId, val]) => {
      const key = `attr_${templateId}`
      console.log(`🔧 Processing filter ${templateId}:`, val, typeof val)
      if (Array.isArray(val)) {
        if (val.length > 0) {
          // For multiselect, send as JSON string (backend handles parsing)
          params[key] = JSON.stringify(val)
          console.log(`📤 Added multiselect filter ${key}:`, params[key])
        }
      } else if (typeof val === 'boolean') {
        if (val === true) {
          params[key] = 'true'
          console.log(`📤 Added boolean filter ${key}:`, params[key])
        }
      } else if (val && String(val).trim()) {
        params[key] = String(val).trim()
        console.log(`📤 Added text filter ${key}:`, params[key])
      }
    })
    console.log('📝 Final params to send:', params)
    const hasMore = await productStore.fetchProducts(params)
    hasMoreProducts.value = hasMore
    console.log('✅ Filters applied successfully, hasMore:', hasMore, 'products count:', productStore.products.length)
  } catch (error) {
    console.error('❌ Error applying dynamic filters:', error)
  } finally {
    isFiltering.value = false
  }
}

// Infinite scroll for all products
const loadingMore = ref(false)
const hasMoreProducts = ref(true)
const loadMoreTrigger = ref(null)
let observer = null

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

// Computed property to handle local filtering for multiple skin types, skin concerns, and product types
// Note: filteredProducts computed property removed - references removed fields and variables
const filteredProducts = computed(() => productStore.products)

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

const handleProductSearch = async () => {
  if (productSearch.value.trim()) {
    isSearching.value = true
    const hasMore = await productStore.searchProducts(productSearch.value)
    hasMoreProducts.value = hasMore
  } else {
    await clearProductSearch()
  }
}

const clearProductSearch = async () => {
  productSearch.value = ''
  isSearching.value = false
  productStore.clearFilters()
  const hasMore = await productStore.fetchProducts()
  hasMoreProducts.value = hasMore
}

// Note: Filter functions for skin types, concerns, and product types removed - API endpoints no longer exist

const clearAllFilters = async () => {
  // Note: Filter variables for skin types, concerns, and product types removed
  isFiltering.value = false
  clearDynamicFilters()
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
  if (loadingMore.value || !hasMoreProducts.value || isSearching.value) {
    return
  }

  loadingMore.value = true

  try {
    const currentPage = productStore.pagination?.page || 1
    const nextPage = currentPage + 1

    // Build params to maintain current filters when loading more
    const defaultStore = sessionStorage.getItem('defaultStore')
    const params = { 
      page: nextPage,
      ...(defaultStore ? { store_category: defaultStore } : {}),
      page_size: 24
    }
    
    // Add dynamic filters to params for infinite scroll
    Object.entries(dynamicFilters.value).forEach(([templateId, val]) => {
      const key = `attr_${templateId}`
      if (Array.isArray(val)) {
        if (val.length > 0) {
          // For multiselect, send as JSON string (backend handles parsing)
          params[key] = JSON.stringify(val)
        }
      } else if (typeof val === 'boolean') {
        if (val === true) params[key] = 'true'
      } else if (val && String(val).trim()) {
        params[key] = String(val).trim()
      }
    })

    const hasMore = await productStore.fetchProducts(params, true)
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

// Storage event handler for default store changes
const handleStorageChange = async (e) => {
  if (e.key === 'defaultStore') {
    // Refresh categories and products when default store changes
    await productStore.refreshCategoriesForStore()
    await loadStoreAttributeTemplates()
    
    const newStoreId = e.newValue
    if (newStoreId) {
      try {
        const hasMore = await productStore.fetchProducts({ store_category: newStoreId, page_size: 24 })
        hasMoreProducts.value = hasMore
      } catch (err) {
        console.warn('Failed to refresh products for new store:', err)
      }
    }
  }
}

// Watch for default store changes to refresh categories
watch(() => sessionStorage.getItem('defaultStore'), async (newStoreId, oldStoreId) => {
  if (newStoreId !== oldStoreId) {
    // Refresh categories when default store changes
    await productStore.refreshCategoriesForStore()
    await loadStoreAttributeTemplates()
    
    // Also refresh products with the new store filter
    try {
      const hasMore = await productStore.fetchProducts({ store_category: newStoreId, page_size: 24 })
      hasMoreProducts.value = hasMore
    } catch (e) {
      console.warn('Failed to refresh products for new store:', e)
    }
  }
}, { immediate: false })

// Watch for products changes to re-setup infinite scroll
watch(() => productStore.products, () => {
  if (productStore.products.length > 0 && !isSearching.value) {
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
      // Note: fetchSkinTypes, fetchSkinConcerns, fetchProductTypes removed - API endpoints no longer exist
      cart.fetchCart().catch(err => {
        console.error('Cart fetch failed, continuing anyway:', err)
      })
    ])

    // init notification store
    await notification.init()

    // Load dynamic attribute templates for current default store category
    await loadStoreAttributeTemplates()

    // Fetch products filtered by default store category if set
    const defaultStore = sessionStorage.getItem('defaultStore')
    console.log('🏪 Explore: defaultStore from sessionStorage:', defaultStore)
    
    if (defaultStore) {
      try {
        console.log('🏪 Explore: Fetching products for store category:', defaultStore)
        const hasMoreFromInitialLoad = await productStore.fetchProducts({ store_category: defaultStore, page_size: 24 })
        hasMoreProducts.value = hasMoreFromInitialLoad
        console.log('✅ Explore: Products fetched for store, hasMore:', hasMoreFromInitialLoad)
      } catch (e) {
        console.warn('⚠️ Explore: Failed to fetch products for store, falling back to all products:', e)
        const hasMoreFromInitialLoad = await productStore.fetchProducts()
        hasMoreProducts.value = hasMoreFromInitialLoad
        console.log('✅ Explore: Fallback products fetched, hasMore:', hasMoreFromInitialLoad)
      }
    } else {
      console.log('🏪 Explore: No default store, fetching all products')
      const hasMoreFromInitialLoad = await productStore.fetchProducts()
      hasMoreProducts.value = hasMoreFromInitialLoad
      console.log('✅ Explore: All products fetched, hasMore:', hasMoreFromInitialLoad)
    }
    
    console.log('🏪 Explore: Products in store after fetch:', productStore.products.length)
    console.log('🏪 Explore: filteredProducts computed value:', filteredProducts.value.length)

    // Setup infinite scroll after initial load
    nextTick(() => {
      setupInfiniteScroll()
    })

    // Add storage event listener to handle changes from other tabs
    window.addEventListener('storage', handleStorageChange)
  } catch (error) {
    console.error('Error during Explore page initialization:', error)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  
  // Remove storage event listener
  window.removeEventListener('storage', handleStorageChange)
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

/* Line clamp utility for product names */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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