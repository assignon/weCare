<template>
  <div class="page-container">
    <div class="p-4 pt-16">
      <!-- Enhanced Header -->
      <AppHeader />

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
          <div class="sticky top-0 bg-white border-b border-grey-200 px-6 py-5 rounded-t-3xl shadow-nav">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-navy">Filter Products</h3>
                <span class="text-xs text-grey-400">Personalized for your selected store</span>
              </div>
              <button 
                @click="showFilterOptions = false"
                class="w-10 h-10 rounded-full bg-grey-100 hover:bg-grey-200 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <X class="w-5 h-5 text-grey-400" />
              </button>
            </div>
          </div>
          
          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 mb-16">
            <div class="space-y-6">
              <!-- Dynamic attribute filters (from CategoryAttributeTemplate by store category) -->
              <div v-if="storeAttributeTemplates.length > 0" class="space-y-6">
                <div class="grid grid-cols-1 gap-6">
                  <div v-for="tpl in storeAttributeTemplates" :key="tpl.id" class="bg-grey-50/50 rounded-2xl p-4 border border-grey-200/50">
                    <label class="block text-sm font-semibold text-navy mb-3">{{ tpl.label }}</label>
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
                              : 'text-grey-500 border-grey-200 hover:border-navy'
                          ]"
                          :style="isSelected(tpl, opt) ? 'background: #1a1a2e;' : ''"
                        >
                          {{ opt }}
                        </button>
                      </div>
                    </div>
                    <!-- Boolean toggle -->
                    <div v-else-if="tpl.field_type === 'boolean'" class="flex items-center justify-between">
                      <span class="text-sm text-grey-500">Enable</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" :checked="getBoolean(tpl)" @change="toggleBoolean(tpl)" />
                        <div class="w-11 h-6 bg-grey-200 rounded-full peer peer-checked:bg-navy transition-colors"></div>
                        <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                    <!-- Text / Number input -->
                    <div v-else>
                      <input
                        :type="tpl.field_type === 'number' || tpl.field_type === 'decimal' ? 'number' : 'text'"
                        class="w-full p-3 bg-white border border-grey-200 rounded-2xl focus:ring-2 focus:ring-navy/20 focus:border-navy/50"
                        :placeholder="tpl.help_text || 'Type to filter'"
                        v-model="dynamicFilters[tpl.id]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback default filters when no templates available -->
              <div v-else class="space-y-6">
                <div class="text-center py-8 text-grey-400">
                  No filters available for this store.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer Actions -->
          <div class="sticky bottom-0 bg-white border-t border-grey-200 p-6 shadow-lg" style="position: sticky; bottom: 55px;">
            <div class="flex gap-3">
              <button 
                @click="clearDynamicFilters"
                class="flex-1 px-4 py-3 text-navy hover:text-navy/80 font-semibold text-sm bg-grey-50 hover:bg-grey-100 rounded-2xl transition-all duration-200"
              >
                Clear All
              </button>
              <button 
                @click="applyDynamicFilters"
                class="flex-1 px-4 py-3 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                style="background: #1a1a2e;"
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
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-grey-200"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent absolute top-0 left-0"></div>
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
            class="flex flex-col"
          >
            <!-- Product Card - Only contains image -->
            <div 
              @click="navigateToDetails(product.id, product.item_type)"
              class="group bg-grey-50 rounded-2xl transition-all duration-200 overflow-hidden mb-2 aspect-square cursor-pointer relative"
            >
              <img 
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover rounded-2xl"
              />
              <!-- Verified Badge (for all approved store products) -->
              <button
                v-if="product.item_type === 'store_product' && product.seller_account_status === 'APPROVED'"
                @click.stop="showVerificationDialog = true; selectedProduct = product"
                class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
              >
                <BadgeCheck class="w-4 h-4 text-navy" />
              </button>
            </div>
            
            <!-- Product Info - Outside the card -->
            <div class="space-y-1">
              <!-- Store Name Caption (only for store products, not shopper listings) -->
              <p v-if="product.item_type === 'store_product'" class="text-xs text-grey-400 mb-0.5">
                {{ product.seller_name || product.store_name || 'AfriQExpress Seller' }}
              </p>
              
              <!-- Product Name -->
              <h3 
                @click="navigateToDetails(product.id, product.item_type)"
                class="text-sm text-navy mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-navy/80 transition-colors capitalize"
              >
                {{ product.name }}
              </h3>
              
              <!-- Local Names/Description with Flag -->
              <div v-if="product.local_name || product.description" class="flex items-start gap-1.5 mb-1">
                <Flag class="w-3.5 h-3.5 text-grey-400 mt-0.5 flex-shrink-0" />
                <p class="text-xs italic text-grey-400 line-clamp-1">
                  {{ product.local_name || (product.description ? product.description.substring(0, 50) + '...' : '') }}
                </p>
              </div>
              
              <!-- Price and Quantity -->
              <div class="flex items-center justify-between">
                <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-navy'">
                  {{ formatApiPrice(product) }}
                  <span v-if="product.quantity || product.weight" class="text-xs font-normal text-grey-400">
                    / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Infinite Scroll Loading -->
        <div v-if="hasMoreProducts && productStore.products.length > 0" ref="loadMoreTrigger" class="text-center py-8">
          <div v-if="loadingMore" class="relative inline-block">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-grey-200"></div>
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-navy border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p v-if="loadingMore" class="text-sm text-grey-400 mt-3 font-medium">
            Loading more products...
          </p>
        </div>

        <!-- End of Results -->
        <div v-if="!hasMoreProducts && productStore.products.length > 0 && !loading" class="text-center py-12 mb-20">
          <div class="w-16 h-1 bg-navy rounded-full mx-auto mb-6"></div>
          <CheckCircle class="w-8 h-8 text-grey-300 mx-auto mb-3" />
          <p class="text-sm text-grey-400 font-medium">
            That's all for now!
          </p>
          <p class="text-xs text-grey-400 mt-1">
            You've seen all {{ filteredProducts.length }} products
          </p>
        </div>

        <!-- No products state -->
        <div v-else-if="!loading && filteredProducts.length === 0" class="text-center my-12">
          <div class="w-32 h-32 bg-grey-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <img :src="emptyBoxImage" alt="No products" class="w-20 h-20 opacity-60" />
          </div>
          <h3 class="text-xl font-bold text-navy mb-2">No Products Available</h3>
          <p class="text-sm text-grey-400">Check back soon for new products.</p>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </div>

    <!-- Verification Dialog -->
    <Transition name="dialog">
      <div v-if="showVerificationDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showVerificationDialog = false"></div>
        <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-grey-50 rounded-full flex items-center justify-center">
                <BadgeCheck class="w-8 h-8 text-navy" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-center text-navy mb-2">Verified by AfriQExpress</h3>
            <p class="text-center text-grey-400 text-sm leading-relaxed">
              This product and seller have been verified by AfriQExpress. You can shop with confidence knowing that this seller has been authenticated and approved.
            </p>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-4">
            <button
              @click="showVerificationDialog = false"
              class="w-full py-3 bg-navy hover:bg-navy/80 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-card hover:shadow-float"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useListingStore } from '@/stores/listing'
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
  Bell, User, Search, X, Filter, AlertCircle, CheckCircle, ShoppingBag, ArrowRight, Flag, BadgeCheck
} from 'lucide-vue-next'

const productStore = useProductStore()
const listingStore = useListingStore()
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
const showVerificationDialog = ref(false)
const selectedProduct = ref(null)
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

const navigateToDetails = (productId, itemType = 'store_product') => {
  if (itemType === 'shopper_listing') {
    router.push({ name: 'ShopperProduct', params: { id: productId } })
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId } })
  }
}

const addToCart = async (product) => {
  try {
    await cart.addToCart(product, 1)
    // Optionally show a success notification
    console.log('Product added to cart:', product.name)
  } catch (error) {
    console.error('Failed to add product to cart:', error)
  }
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

// Listen for filter button click from AppHeader
const handleFilterButtonClick = () => {
  showFilterOptions.value = !showFilterOptions.value
}

onMounted(async () => {
  // Listen for filter button click from AppHeader
  window.addEventListener('openFilter', handleFilterButtonClick)
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

    // Check if filtering by seller (for shopper listings)
    const filterBySeller = sessionStorage.getItem('filterBySeller')
    const filterBySellerType = sessionStorage.getItem('filterBySellerType')
    let fetchedBySeller = false
    
    if (filterBySeller && filterBySellerType === 'shopper_listing') {
      try {
        // Fetch shopper listings filtered by seller ID
        const sellerId = parseInt(filterBySeller)
        console.log('🔍 Explore: Filtering shopper listings by seller ID:', sellerId)
        
        // Fetch all active shopper listings (API may not support seller filter, so we filter client-side)
        const listingsResponse = await listingStore.fetchAllListings({ 
          status: 'active' // Only active listings
        })
        
        // Get listings array
        const allListings = listingsResponse?.results || listingsResponse || []
        
        // Filter by seller ID (client-side filtering since API may not support it)
        const sellerListings = allListings.filter(listing => {
          const listingSellerId = typeof listing.seller === 'object' 
            ? listing.seller?.id 
            : listing.seller
          return listingSellerId === sellerId
        })
        
        console.log('🔍 Explore: Found', sellerListings.length, 'active listings for seller', sellerId)
        
        // Convert shopper listings to product format for display
        const formattedListings = sellerListings.map(listing => ({
          id: listing.id,
          name: listing.title,
          main_image: listing.main_image || (listing.images && listing.images.length > 0 ? listing.images[0].image_url : null),
          price: listing.price,
          price_type: listing.price_type,
          min_offer_price: listing.min_offer_price,
          item_type: 'shopper_listing',
          seller: listing.seller,
          seller_name: listing.seller_name,
          city: listing.city,
          neighborhood: listing.neighborhood,
          category_name: listing.category_name,
          views_count: listing.views_count,
          formatted_price: listing.price_type === 'free' ? 'Free' : listing.price_type === 'offer' ? 'Best Offer' : null
        }))
        
        // Set products to the formatted listings
        productStore.products = formattedListings
        hasMoreProducts.value = false // No pagination for now
        sessionStorage.removeItem('filterBySeller') // Clear after use
        sessionStorage.removeItem('filterBySellerType') // Clear after use
        fetchedBySeller = true
        console.log('✅ Explore: Filtered shopper listings by seller, found', formattedListings.length, 'listings')
      } catch (e) {
        console.warn('⚠️ Explore: Failed to filter shopper listings by seller:', e)
        sessionStorage.removeItem('filterBySeller') // Clear on error too
        sessionStorage.removeItem('filterBySellerType') // Clear on error too
        // Fall through to normal fetch
      }
    } else if (filterBySeller) {
      // Legacy: Filter store products by seller ID
      try {
        const sellerId = parseInt(filterBySeller)
        console.log('🔍 Explore: Filtering store products by seller ID:', sellerId)
        
        const hasMore = await productStore.fetchProducts({ 
          seller: sellerId,
          page_size: 24 
        })
        hasMoreProducts.value = hasMore
        sessionStorage.removeItem('filterBySeller') // Clear after use
        fetchedBySeller = true
        console.log('✅ Explore: Filtered store products by seller, found', productStore.products.length, 'products')
      } catch (e) {
        console.warn('⚠️ Explore: Failed to filter store products by seller:', e)
        sessionStorage.removeItem('filterBySeller') // Clear on error too
        // Fall through to normal fetch
      }
    }
    
    if (!fetchedBySeller) {
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
  // Remove event listener
  window.removeEventListener('openFilter', handleFilterButtonClick)
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
  background: #1a1a2e;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #2d2d4e;
}
</style>