<template>
  <div class="home-page">
    <v-container class="pa-4 pb-24">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <h1 class="text-h5 font-weight-bold">weCare</h1>
        <div class="d-flex">
          <v-btn icon class="" variant="text" @click="toggleSearch">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon class="" variant="text">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
          <v-btn icon class="" variant="text" @click="navigateToProfile">
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>
        </div>
      </div>
      
      <!-- Search bar -->
      <v-expand-transition>
        <div v-if="showSearch" class="mb-4">
          <v-text-field
            v-model="search"
            label="Search products"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="handleSearch"
            @click:clear="clearSearch"
            @keyup="search.trim() === '' && clearSearch()"
            rounded="pill"
          ></v-text-field>
        </div>
      </v-expand-transition>
      
      <!-- Filter section -->
      <div class="filter-section mb-2">
        <div class="d-flex justify-space-between align-center">
          <v-btn 
            variant="outlined" 
            class="mr-2 filter-btn text-none"
            prepend-icon="mdi-filter-variant"
            rounded="pill"
            @click="showFilterOptions = !showFilterOptions"
          >
            Filter
          </v-btn>
          
          <div class="filter-chips-container">
            <div class="d-flex overflow-x-auto">
              <v-btn 
                class="mr-2 text-none" 
                color="primary" 
                rounded="pill" 
                @click="showAllProducts"
              >
                All
              </v-btn>
              <v-btn 
                v-for="category in productStore.categories"
                :key="category.id"
                class="mr-2 text-none" 
                :variant="productStore.selectedCategory === category.id ? 'elevated' : 'outlined'" 
                rounded="pill" 
                color="primary"
                @click="filterByCategory(category.id)"
              >
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
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-2 mr-2">Price Range:</span>
              <v-spacer></v-spacer>
              <v-btn 
                icon 
                size="small" 
                @click="toggleSortOrder"
                :color="sortOrder === 'desc' ? 'primary' : ''"
              >
                <v-icon>{{ sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending' }}</v-icon>
              </v-btn>
            </div>
            
            <div class="d-flex">
              <v-text-field
                v-model="minPrice"
                label="Min"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                rounded="pill"
                class="mr-2"
              ></v-text-field>
              <v-text-field
                v-model="maxPrice"
                label="Max"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                rounded="pill"
              ></v-text-field>
            </div>
            
            <div class="d-flex justify-end mt-2">
              <v-btn 
                color="primary" 
                variant="text" 
                @click="clearAllFilters"
                class="mr-2 text-none"
              >
                Clear
              </v-btn>
              <v-btn 
                color="primary" 
                @click="applyPriceFilter"
                rounded="pill"
                class="text-none"
              >
                Apply
              </v-btn>
            </div>
          </div>
        </div>
      </v-expand-transition>
      
      <!-- Popular Products Section - only shown if products exist and not searching/filtering -->
      <div v-if="!isFiltering && !isSearching && productStore.popularProducts.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">Popular Product</h2>
          <!-- <span class="text-caption primary-color">View More</span> -->
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- Popular products with horizontal scroll -->
        <div v-else class="horizontal-scroll-container">
          <div class="horizontal-scroll-content">
            <v-card 
              v-for="product in productStore.popularProducts.slice(0, 10)" 
              :key="product.id"
              class="product-card-horizontal" 
              flat 
              @click="navigateToDetails(product.id)"
            >
              <v-img 
                :src="product.main_image || packagingImage" 
                height="150"
                class="mb-2"
                cover
              ></v-img>
              <div class="px-2 pb-2">
                <h3 class="text-subtitle-2 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
                <p class="text-caption mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-2 font-weight-bold">${{ product.price }}</span>
                  <v-btn icon="mdi-heart-outline" variant="text" density="compact" size="small" color="primary"></v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
      
      <!-- New Arrivals Section - only shown if products exist and not searching/filtering -->
      <div v-if="!isFiltering && !isSearching && productStore.newArrivals.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">New Arrivals</h2>
          <!-- <span class="text-caption primary-color">View More</span> -->
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- New arrivals with horizontal scroll -->
        <div v-else class="horizontal-scroll-container">
          <div class="horizontal-scroll-content">
            <v-card 
              v-for="product in productStore.newArrivals.slice(0, 10)" 
              :key="product.id"
              class="product-card-bundle-horizontal" 
              flat 
              @click="navigateToDetails(product.id)"
            >
              <div class="d-flex">
                <v-img 
                  :src="product.main_image || packagingImage" 
                  height="150"
                  width="100"
                  class="rounded-lg flex-shrink-0"
                  cover
                ></v-img>
                <div class="px-3 py-2 d-flex flex-column justify-space-between flex-grow-1">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
                    <p class="text-caption text-grey mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
                    <!-- <p class="text-caption text-grey-darken-1 text-truncate">{{ product.short_description || 'For your intensive bodycare set' }}</p> -->
                  </div>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <span v-if="product.original_price && product.original_price > product.price" class="text-caption text-decoration-line-through text-grey mr-1">${{ product.original_price }}</span>
                      <span class="text-subtitle-2 font-weight-bold primary-color">${{ product.price }}</span>
                    </div>
                    <v-btn icon="mdi-heart-outline" variant="text" density="compact" size="small" color="primary"></v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
      
      <!-- All Products Section with Infinite Scroll -->
      <div class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">{{ sectionTitle }}</h2>
        </div>
        
        <!-- Loading state for initial load -->
        <div v-if="loading && productStore.products.length === 0" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- Products grid -->
        <div v-else-if="productStore.products.length > 0" class="products-grid">
          <v-card 
            v-for="product in productStore.products" 
            :key="product.id"
            class="product-card" 
            flat 
            @click="navigateToDetails(product.id)"
          >
            <v-img 
              :src="product.main_image || packagingImage" 
              height="150"
              class="mb-2"
              cover
            ></v-img>
            <div class="px-2 pb-2">
              <h3 class="text-subtitle-2 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
              <p class="text-caption mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">${{ product.price }}</span>
                <v-btn 
                  icon="mdi-cart-plus" 
                  size="small" 
                  color="primary" 
                  variant="text"
                  @click.stop="addToCart(product)" 
                ></v-btn>
              </div>
            </div>
          </v-card>
        </div>
        
        <!-- Infinite Scroll Loading -->
        <div 
          v-if="hasMoreProducts && productStore.products.length > 0"
          ref="loadMoreTrigger"
          class="text-center py-6"
        >
          <v-progress-circular 
            v-if="loadingMore"
            indeterminate 
            color="primary" 
            size="32"
          />
          <p v-if="loadingMore" class="text-body-2 text-medium-emphasis mt-2">
            Loading more products...
          </p>
        </div>

        <!-- End of Results - Always show when products exist and no more to load -->
        <div v-if="!hasMoreProducts && productStore.products.length > 0 && !loading" class="text-center py-8 mb-20">
          <v-divider class="mb-4"></v-divider>
          <v-icon color="grey-lighten-1" size="24" class="mb-2">
            mdi-check-circle-outline
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">
            That's all for now!
          </p>
          <p class="text-caption text-medium-emphasis">
            You've seen all {{ productStore.products.length }} products
          </p>
        </div>
        
        <!-- No products state -->
        <div v-else-if="!loading && productStore.products.length === 0" class="empty-state text-center my-6">
          <v-img
            :src="emptyBoxImage"
            width="200"
            height="200"
            contain
            class="mx-auto mb-4"
          ></v-img>
          <h3 class="text-h6 mb-2">No Products Available</h3>
          <p class="text-body-2 text-grey">Check back soon for new products.</p>
        </div>
      </div>
      
      <!-- Bottom Navigation -->
      <div class="bottom-navigation">
        <v-bottom-navigation grow color="primary">
          <v-btn value="home">
            <v-icon>mdi-home</v-icon>
            <span>Home</span>
          </v-btn>
          <v-btn value="explore">
            <v-icon>mdi-compass</v-icon>
            <span>Explore</span>
          </v-btn>
          <v-btn value="cart">
            <v-icon>mdi-cart</v-icon>
            <span>Cart</span>
          </v-btn>
          <v-btn value="wishlist">
            <v-icon>mdi-heart</v-icon>
            <span>Wishlist</span>
          </v-btn>
        </v-bottom-navigation>
      </div>
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

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()

// Search functionality
const search = ref('')
const showSearch = ref(false)
const isSearching = ref(false)

// Filter functionality
const showFilterOptions = ref(false)
const minPrice = ref('')
const maxPrice = ref('')
const sortOrder = ref('asc')
const isFiltering = ref(false)

// Infinite scroll for all products
const loadingMore = ref(false)
const hasMoreProducts = ref(true)
const loadMoreTrigger = ref(null)
let observer = null

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

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
    // Hide sections when search is shown
    isSearching.value = true
  } else {
    // Show sections when search is hidden
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
  // Refresh all products
  await Promise.all([
    productStore.fetchPopularProducts(),
    productStore.fetchNewArrivals()
  ])
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

// Watch for filter options visibility
watch(showFilterOptions, async (newValue) => {
  if (newValue) {
    // When filter options show, hide popular and new arrivals sections
    isFiltering.value = true
  } else if (!minPrice.value && !maxPrice.value) {
    // When filter options are hidden and no filter values, clear filters and show all sections
    isFiltering.value = false
    await clearAllFilters()
  }
})

const applyPriceFilter = async () => {
  const params = {}
  
  if (minPrice.value) {
    params.min_price = parseFloat(minPrice.value)
  }
  
  if (maxPrice.value) {
    params.max_price = parseFloat(maxPrice.value)
  }
  
  if (sortOrder.value) {
    params.ordering = sortOrder.value === 'asc' ? 'price' : '-price'
  }
  
  isFiltering.value = Object.keys(params).length > 0
  const hasMore = await productStore.fetchProducts(params)
  hasMoreProducts.value = hasMore
}

const clearAllFilters = async () => {
  minPrice.value = ''
  maxPrice.value = ''
  sortOrder.value = 'asc'
  isFiltering.value = false
  productStore.clearFilters()
  const hasMore = await productStore.fetchProducts()
  hasMoreProducts.value = hasMore
}

const addToCart = (product) => {
  cart.addToCart(product, 1)
  // Show toast or notification
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

const filterByCategory = async (categoryId) => {
  // If a category is selected (not "All"), hide popular and new arrivals sections
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
    
    console.log('Loading more products, page:', nextPage)
    const hasMore = await productStore.fetchProducts({ page: nextPage }, true) // true for append
    hasMoreProducts.value = hasMore
    
    console.log('Has more products:', hasMore, 'Total products:', productStore.products.length)
    
    if (!hasMore && observer) {
      observer.disconnect()
      console.log('No more products, disconnecting observer')
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
  // Fetch categories
  await productStore.fetchCategories()
  
  // Fetch products for each section
  const [hasMoreFromInitialLoad] = await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchPopularProducts(),
    productStore.fetchNewArrivals()
  ])
  
  // Set initial hasMoreProducts state
  hasMoreProducts.value = hasMoreFromInitialLoad
  console.log('Initial load - has more products:', hasMoreProducts.value)
  
  // Setup infinite scroll after initial load
  nextTick(() => {
    setupInfiniteScroll()
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.home-page {
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

.special-offer-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.product-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-bundle {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-bundle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Horizontal scroll containers */
.horizontal-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.horizontal-scroll-container::-webkit-scrollbar {
  display: none; /* WebKit */
}

.horizontal-scroll-content {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

.product-card-horizontal {
  flex: 0 0 160px; /* Fixed width */
  width: 160px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card-bundle-horizontal {
  flex: 0 0 280px; /* Fixed width for bundle cards */
  width: 280px;
  height: 150px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-bundle-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Make sure vertical scrolling is smooth */
::-webkit-scrollbar {
  height: 0;
  width: 0;
  display: none;
}

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  z-index: 99;
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
</style> 