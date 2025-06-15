<template>
  <div class="explore-page">
    <v-container class="pa-4 pb-24">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <h1 class="text-h5 font-weight-bold">weCare</h1>
        <div class="d-flex">
          <v-btn icon class="" variant="text" @click="navigateToNotification">
            <v-badge v-if="notification.hasUnreadNotifications" :content="notification.unreadCount" color="error"
              offset-x="1" offset-y="1">
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>
          <v-btn icon class="" variant="text" @click="navigateToProfile">
            <v-avatar size="32" color="primary" v-if="auth.user?.profile_picture">
              <v-img :src="auth.user.profile_picture" alt="Profile" />
            </v-avatar>
            <v-icon v-else>mdi-account-circle-outline</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Search bar -->
      <v-expand-transition>
        <div v-if="showSearch" class="mb-4">
          <v-text-field v-model="search" label="Search products" prepend-inner-icon="mdi-magnify" variant="outlined"
            density="compact" hide-details clearable @update:model-value="handleSearch" @click:clear="clearSearch"
            @keyup="search.trim() === '' && clearSearch()" rounded="pill"></v-text-field>
        </div>
      </v-expand-transition>

      <!-- Filter section -->
      <div class="filter-section mb-2">
        <div class="d-flex justify-space-between align-center">
          <v-btn variant="outlined" class="mr-2 filter-btn text-none" prepend-icon="mdi-filter-variant" rounded="pill"
            @click="showFilterOptions = !showFilterOptions">
            Filter
          </v-btn>

          <div class="filter-chips-container">
            <div class="d-flex overflow-x-auto">
              <v-btn class="mr-2 text-none" color="primary" rounded="pill" @click="showAllProducts">
                All
              </v-btn>
              <v-btn v-for="category in productStore.categories" :key="category.id" class="mr-2 text-none"
                :variant="productStore.selectedCategory === category.id ? 'elevated' : 'outlined'" rounded="pill"
                color="primary" @click="filterByCategory(category.id)">
                {{ category.name }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter options -->
      <v-expand-transition>
        <div v-if="showFilterOptions" class="filter-options mb-4 pa-3">
          <div class="d-flex flex-column">
            <!-- Skin Type Filter -->
            <div class="mb-4">
              <span class="text-subtitle-2 mb-2 d-block">Filter by Skin Type:</span>
              <v-select v-model="selectedSkinTypes" :items="productStore.skinTypes" item-title="name" item-value="id"
                label="Select skin types" multiple chips variant="outlined" density="compact" hide-details clearable
                @update:model-value="applySkinTypeFilter">
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.name" size="small" color="primary" variant="outlined"></v-chip>
                </template>
              </v-select>
            </div>

            <!-- Skin Concern Filter -->
            <div class="mb-4">
              <span class="text-subtitle-2 mb-2 d-block">Filter by Skin Concern:</span>
              <v-select v-model="selectedSkinConcerns" :items="productStore.skinConcerns" item-title="name"
                item-value="id" label="Select skin concerns" multiple chips variant="outlined" density="compact"
                hide-details clearable @update:model-value="applySkinConcernFilter">
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.name" size="small" color="teal" variant="outlined"></v-chip>
                </template>
              </v-select>
            </div>

            <!-- Product Type Filter -->
            <div class="mb-4">
              <span class="text-subtitle-2 mb-2 d-block">Filter by Product Type:</span>
              <v-select v-model="selectedProductTypes" :items="productStore.productTypes" item-title="name"
                item-value="id" label="Select product types" multiple chips variant="outlined" density="compact"
                hide-details clearable @update:model-value="applyProductTypeFilter">
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.name" size="small" color="purple" variant="outlined"></v-chip>
                </template>
              </v-select>
            </div>

            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" variant="text" @click="clearAllFilters" class="mr-2 text-none">
                Clear All
              </v-btn>
            </div>
          </div>
        </div>
      </v-expand-transition>

      <!-- All Products Section with Infinite Scroll -->
      <div class="section mb-6">
        <!-- <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">{{ sectionTitle }}</h2>
        </div> -->

        <!-- Loading state for initial load -->
        <div v-if="loading && productStore.products.length === 0" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>

        <!-- Products grid -->
        <div v-else-if="filteredProducts.length > 0" class="products-grid mt-6">
          <v-card v-for="product in filteredProducts" :key="product.id" class="product-card" flat
            @click="navigateToDetails(product.id)">
            <v-img :src="product.main_image || packagingImage" height="150" class="mb-2" cover></v-img>
            <div class="px-2 pb-2">
              <h3 class="text-subtitle-2 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
              <p class="text-caption mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">{{ formatApiPrice(product) }}</span>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Infinite Scroll Loading -->
        <div v-if="hasMoreProducts && productStore.products.length > 0" ref="loadMoreTrigger" class="text-center py-6">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
          <p v-if="loadingMore" class="text-body-2 text-medium-emphasis mt-2">
            Loading more products...
          </p>
        </div>

        <!-- End of Results -->
        <div v-if="!hasMoreProducts && productStore.products.length > 0 && !loading" class="text-center py-8 mb-20">
          <v-divider class="mb-4"></v-divider>
          <v-icon color="grey-lighten-1" size="24" class="mb-2">
            mdi-check-circle-outline
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">
            That's all for now!
          </p>
          <p class="text-caption text-medium-emphasis">
            You've seen all {{ filteredProducts.length }} products
          </p>
        </div>

        <!-- No products state -->
        <div v-else-if="!loading && filteredProducts.length === 0" class="empty-state text-center my-6">
          <v-img :src="emptyBoxImage" width="200" height="200" contain class="mx-auto mb-4"></v-img>
          <h3 class="text-h6 mb-2">No Products Available</h3>
          <p class="text-body-2 text-grey">Check back soon for new products.</p>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <BottomNavigation />
    </v-container>
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
.explore-page {
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
}

.filter-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
  padding-top: 8px;
  padding-bottom: 8px;
}

.filter-chips-container {
  overflow-x: auto;
  flex-grow: 1;
  margin-left: 8px;
}

.filter-btn {
  border: 1px solid #e0e0e0;
  white-space: nowrap;
}

.filter-options {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
}

.primary-color {
  color: #6b3aa5;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.products-grid .product-card {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.products-grid .product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (min-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}



.gap-2 {
  gap: 8px;
}
</style>