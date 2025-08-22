<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Search Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-4">
          <!-- Search Bar -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              @keydown.enter="performSearch"
              type="text"
              placeholder="Search for products, brands, or categories..."
              class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <div class="absolute inset-y-0 right-0 flex items-center">
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="p-2 text-gray-400 hover:text-gray-600"
              >
                <X class="h-4 w-4" />
              </button>
              <button
                @click="showFilters = !showFilters"
                class="p-2 text-gray-600 hover:text-gray-800 border-l border-gray-200"
              >
                <Filter class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Quick Search Suggestions -->
          <div v-if="showSuggestions && searchSuggestions.length > 0" 
               class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            <div class="py-2">
              <div 
                v-for="suggestion in searchSuggestions" 
                :key="suggestion.id"
                @click="selectSuggestion(suggestion)"
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
              >
                <component :is="suggestion.type === 'product' ? Package : suggestion.type === 'category' ? Grid : Store" 
                           class="h-4 w-4 text-gray-400 mr-3" />
                <span class="text-sm">{{ suggestion.name }}</span>
                <span class="ml-auto text-xs text-gray-500">{{ suggestion.type }}</span>
              </div>
            </div>
          </div>

          <!-- Filter Pills -->
          <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="filter in activeFilters"
              :key="filter.key"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ filter.label }}
              <button @click="removeFilter(filter.key)" class="ml-2 text-blue-600 hover:text-blue-800">
                <X class="h-3 w-3" />
              </button>
            </span>
            <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-gray-700 px-2">
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Sidebar -->
    <div 
      v-if="showFilters"
      class="fixed inset-0 z-40 lg:static lg:inset-auto"
      @click="showFilters = false"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50 lg:hidden"></div>
      <div 
        class="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform lg:relative lg:translate-x-0 lg:shadow-none lg:w-64 overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
            <button @click="showFilters = false" class="lg:hidden">
              <X class="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <!-- Categories Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Categories</h4>
            <div class="space-y-2">
              <label 
                v-for="category in categories" 
                :key="category.id"
                class="flex items-center cursor-pointer"
              >
                <input
                  v-model="filters.categories"
                  :value="category.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ category.name }}</span>
                <span class="ml-auto text-xs text-gray-500">({{ category.product_count || 0 }})</span>
              </label>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
            <div class="space-y-3">
              <div class="flex space-x-2">
                <input
                  v-model="filters.priceMin"
                  type="number"
                  placeholder="Min"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  v-model="filters.priceMax"
                  type="number"
                  placeholder="Max"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="range in priceRanges"
                  :key="range.label"
                  @click="setPriceRange(range)"
                  class="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Rating Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Rating</h4>
            <div class="space-y-2">
              <label 
                v-for="rating in [5, 4, 3, 2, 1]" 
                :key="rating"
                class="flex items-center cursor-pointer"
              >
                <input
                  v-model="filters.minRating"
                  :value="rating"
                  type="radio"
                  class="text-blue-600 focus:ring-blue-500"
                />
                <div class="ml-2 flex items-center">
                  <div class="flex">
                    <Star
                      v-for="i in 5"
                      :key="i"
                      :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-4 w-4 fill-current"
                    />
                  </div>
                  <span class="ml-1 text-sm text-gray-600">& up</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Store Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Stores</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <label 
                v-for="store in popularStores" 
                :key="store.id"
                class="flex items-center cursor-pointer"
              >
                <input
                  v-model="filters.stores"
                  :value="store.id"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ store.store_name }}</span>
              </label>
            </div>
          </div>

          <!-- Availability Filter -->
          <div class="mb-6">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.inStock"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">In Stock Only</span>
            </label>
          </div>

          <!-- Sort Options -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <!-- Apply Filters Button -->
          <button
            @click="applyFilters"
            class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" :class="{ 'lg:pl-72': showFilters }">
      <!-- Results Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ searchQuery ? `Search results for "${searchQuery}"` : 'Explore Products' }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ filteredProducts.length }} products found
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- View Toggle -->
          <div class="flex border border-gray-300 rounded-lg">
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
              class="p-2 rounded-l-lg transition-colors"
            >
              <Grid class="h-4 w-4" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
              class="p-2 rounded-r-lg transition-colors"
            >
              <List class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredProducts.length === 0 && !loading" class="text-center py-12">
        <Package class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p class="text-gray-500 mb-4">Try adjusting your search or filters</p>
        <button
          @click="clearAllFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear all filters
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 12" :key="i" class="animate-pulse">
          <div class="bg-gray-300 aspect-square rounded-lg mb-4"></div>
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div 
        v-else
        :class="viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'"
      >
        <!-- Grid View -->
        <div 
          v-if="viewMode === 'grid'"
          v-for="product in filteredProducts" 
          :key="product.id"
          @click="goToProduct(product.id)"
          class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
        >
          <div class="relative aspect-square overflow-hidden">
            <img
              :src="product.images?.[0]?.image || '/placeholder-product.jpg'"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            
            <!-- Wishlist Button -->
            <button
              @click.stop="toggleWishlist(product)"
              class="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Heart 
                :class="product.is_wishlisted ? 'text-red-500 fill-current' : 'text-gray-400'" 
                class="h-4 w-4" 
              />
            </button>

            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col space-y-2">
              <span v-if="product.discount_percentage" class="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                -{{ product.discount_percentage }}%
              </span>
              <span v-if="product.is_new" class="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg">
                New
              </span>
            </div>

            <!-- Quick Add to Cart -->
            <div class="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                @click.stop="addToCart(product)"
                :disabled="!product.in_stock"
                class="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ product.in_stock ? 'Add to Cart' : 'Out of Stock' }}
              </button>
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-medium text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>
            
            <!-- Rating -->
            <div v-if="product.rating" class="flex items-center mb-2">
              <div class="flex">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="i <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
                  class="h-4 w-4 fill-current"
                />
              </div>
              <span class="ml-1 text-sm text-gray-500">({{ product.review_count || 0 }})</span>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-gray-900">{{ formatPrice(product.price) }}</span>
                <span v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                  {{ formatPrice(product.compare_at_price) }}
                </span>
              </div>
              <span class="text-xs text-gray-500">{{ product.store_name }}</span>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div 
          v-if="viewMode === 'list'"
          v-for="product in filteredProducts" 
          :key="product.id"
          @click="goToProduct(product.id)"
          class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div class="flex space-x-6">
            <div class="flex-shrink-0 w-32 h-32">
              <img
                :src="product.images?.[0]?.image || '/placeholder-product.jpg'"
                :alt="product.name"
                class="w-full h-full object-cover rounded-xl"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">{{ product.name }}</h3>
                  <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ product.description }}</p>
                  
                  <!-- Rating -->
                  <div v-if="product.rating" class="flex items-center mb-4">
                    <div class="flex">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :class="i <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
                        class="h-4 w-4 fill-current"
                      />
                    </div>
                    <span class="ml-2 text-sm text-gray-500">({{ product.review_count || 0 }} reviews)</span>
                  </div>

                  <!-- Store Info -->
                  <div class="flex items-center text-sm text-gray-500">
                    <Store class="h-4 w-4 mr-1" />
                    {{ product.store_name }}
                  </div>
                </div>

                <div class="flex flex-col items-end justify-between ml-6">
                  <!-- Price -->
                  <div class="text-right">
                    <div class="text-2xl font-bold text-gray-900">{{ formatPrice(product.price) }}</div>
                    <div v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                      {{ formatPrice(product.compare_at_price) }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-2 mt-4">
                    <button
                      @click.stop="toggleWishlist(product)"
                      class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart 
                        :class="product.is_wishlisted ? 'text-red-500 fill-current' : 'text-gray-400'" 
                        class="h-4 w-4" 
                      />
                    </button>
                    <button
                      @click.stop="addToCart(product)"
                      :disabled="!product.in_stock"
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {{ product.in_stock ? 'Add to Cart' : 'Out of Stock' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && !loading" class="text-center mt-8">
        <button
          @click="loadMore"
          class="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Load More Products
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { 
  Search, Filter, X, Grid, List, Package, Store, Star, Heart,
  Plus, Minus, ChevronDown, Tag, TrendingUp
} from 'lucide-vue-next'

const router = useRouter()
const { formatPrice } = useCurrency()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

// State
const loading = ref(false)
const searchQuery = ref('')
const showFilters = ref(false)
const showSuggestions = ref(false)
const viewMode = ref('grid')
const page = ref(1)
const hasMore = ref(true)

// Data
const products = ref([])
const categories = ref([])
const popularStores = ref([])
const searchSuggestions = ref([])
const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: null }
]

// Filters
const filters = reactive({
  categories: [],
  stores: [],
  priceMin: '',
  priceMax: '',
  minRating: '',
  inStock: false,
  sortBy: 'relevance'
})

// Computed
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // Apply filters
  if (filters.categories.length > 0) {
    result = result.filter(p => filters.categories.includes(p.category_id))
  }
  
  if (filters.stores.length > 0) {
    result = result.filter(p => filters.stores.includes(p.store_id))
  }
  
  if (filters.priceMin) {
    result = result.filter(p => p.price >= parseFloat(filters.priceMin))
  }
  
  if (filters.priceMax) {
    result = result.filter(p => p.price <= parseFloat(filters.priceMax))
  }
  
  if (filters.minRating) {
    result = result.filter(p => (p.rating || 0) >= parseInt(filters.minRating))
  }
  
  if (filters.inStock) {
    result = result.filter(p => p.in_stock)
  }
  
  // Apply sorting
  switch (filters.sortBy) {
    case 'price_low':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_high':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'popular':
      result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      break
  }
  
  return result
})

const activeFilters = computed(() => {
  const active = []
  
  if (filters.categories.length > 0) {
    filters.categories.forEach(catId => {
      const category = categories.value.find(c => c.id === catId)
      if (category) {
        active.push({ key: `category_${catId}`, label: category.name })
      }
    })
  }
  
  if (filters.stores.length > 0) {
    filters.stores.forEach(storeId => {
      const store = popularStores.value.find(s => s.id === storeId)
      if (store) {
        active.push({ key: `store_${storeId}`, label: store.store_name })
      }
    })
  }
  
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin || '0'
    const max = filters.priceMax || '∞'
    active.push({ key: 'price', label: `$${min} - $${max}` })
  }
  
  if (filters.minRating) {
    active.push({ key: 'rating', label: `${filters.minRating}+ stars` })
  }
  
  if (filters.inStock) {
    active.push({ key: 'stock', label: 'In Stock' })
  }
  
  return active
})

// Methods
const fetchProducts = async (params = {}) => {
  loading.value = true
  try {
    const response = await apiService.getProducts({
      search: searchQuery.value,
      page: page.value,
      page_size: 20,
      ...params
    })
    
    if (page.value === 1) {
      products.value = response.data.results || response.data || []
    } else {
      products.value.push(...(response.data.results || response.data || []))
    }
    
    hasMore.value = !!response.data.next
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await apiService.getCategories()
    categories.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchPopularStores = async () => {
  try {
    const response = await apiService.getStores({ popular: true, page_size: 20 })
    popularStores.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching stores:', error)
  }
}

const fetchSearchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    searchSuggestions.value = []
    return
  }
  
  try {
    const response = await apiService.getSearchSuggestions(query)
    searchSuggestions.value = response.data || []
  } catch (error) {
    console.error('Error fetching suggestions:', error)
  }
}

const handleSearchInput = () => {
  if (searchQuery.value.length >= 2) {
    showSuggestions.value = true
    fetchSearchSuggestions(searchQuery.value)
  } else {
    showSuggestions.value = false
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.name
  showSuggestions.value = false
  performSearch()
}

const performSearch = () => {
  showSuggestions.value = false
  page.value = 1
  fetchProducts()
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  page.value = 1
  fetchProducts()
}

const setPriceRange = (range) => {
  filters.priceMin = range.min.toString()
  filters.priceMax = range.max ? range.max.toString() : ''
}

const applyFilters = () => {
  page.value = 1
  fetchProducts()
  showFilters.value = false
}

const removeFilter = (filterKey) => {
  if (filterKey.startsWith('category_')) {
    const catId = parseInt(filterKey.replace('category_', ''))
    filters.categories = filters.categories.filter(id => id !== catId)
  } else if (filterKey.startsWith('store_')) {
    const storeId = parseInt(filterKey.replace('store_', ''))
    filters.stores = filters.stores.filter(id => id !== storeId)
  } else if (filterKey === 'price') {
    filters.priceMin = ''
    filters.priceMax = ''
  } else if (filterKey === 'rating') {
    filters.minRating = ''
  } else if (filterKey === 'stock') {
    filters.inStock = false
  }
  
  applyFilters()
}

const clearAllFilters = () => {
  Object.assign(filters, {
    categories: [],
    stores: [],
    priceMin: '',
    priceMax: '',
    minRating: '',
    inStock: false,
    sortBy: 'relevance'
  })
  searchQuery.value = ''
  applyFilters()
}

const loadMore = () => {
  page.value++
  fetchProducts()
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const addToCart = async (product) => {
  try {
    await cartStore.addToCart({
      product_id: product.id,
      quantity: 1
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

const toggleWishlist = async (product) => {
  try {
    if (product.is_wishlisted) {
      await wishlistStore.removeFromWishlist(product.id)
    } else {
      await wishlistStore.addToWishlist(product.id)
    }
    product.is_wishlisted = !product.is_wishlisted
  } catch (error) {
    console.error('Error toggling wishlist:', error)
  }
}

// Watchers
watch(() => filters.sortBy, applyFilters)

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchPopularStores()
  ])
})

// Close suggestions when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      showSuggestions.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>