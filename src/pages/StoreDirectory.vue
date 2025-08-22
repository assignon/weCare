<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="p-4 pb-24">
      <!-- Enhanced Header -->
      <AppHeader />

      <!-- Search bar -->
      <div class="mb-6">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            v-model="search"
            type="text"
            placeholder="Search stores by name or category..."
            class="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
            @input="handleSearch"
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

      <!-- Store Category Filters -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900">Browse by Category</h2>
          <button 
            @click="showAllStores"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <div class="flex space-x-3 pb-2">
            <button 
              @click="filterByStoreCategory(null)"
              :class="[
                'px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
                selectedStoreCategory === null 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white hover:border-blue-500/50'
              ]"
            >
              All Categories
            </button>
            <button 
              v-for="category in storeCategories" 
              :key="category.id"
              @click="filterByStoreCategory(category.id)"
              :class="[
                'px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md',
                selectedStoreCategory === category.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white hover:border-blue-500/50'
              ]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Featured Stores Section -->
      <div v-if="featuredStores.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">Featured Stores</h2>
            <p class="text-sm text-slate-600">Top-rated stores just for you</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">⭐</span>
          </div>
        </div>

        <div class="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div class="flex gap-4 pb-2">
            <div 
              v-for="store in featuredStores" 
              :key="store.id"
              class="flex-shrink-0 w-80 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-white/30"
              @click="navigateToStore(store.id)"
            >
              <div class="relative h-32">
                <img 
                  :src="store.banner_image || store.profile_picture || defaultStoreImage" 
                  class="w-full h-full object-cover" 
                  alt="Store Banner"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-slate-700">⭐</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div class="p-4">
                <div class="flex items-center mb-2">
                  <img 
                    :src="store.profile_picture || defaultStoreImage" 
                    class="w-8 h-8 rounded-full object-cover mr-3" 
                    alt="Store Logo"
                  />
                  <div class="flex-1">
                    <h3 class="text-sm font-semibold text-slate-900 truncate">{{ store.business_name }}</h3>
                    <div class="flex items-center">
                      <span 
                        :class="`px-2 py-1 text-xs rounded-full ${getStoreCategoryColorClass(store.store_category)}`"
                      >
                        {{ store.store_category?.name || 'General' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Star class="w-4 h-4 text-yellow-400 fill-current" />
                    <span class="text-sm text-slate-600 ml-1">{{ store.rating || '4.5' }}</span>
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ store.product_count || 0 }} products
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Stores Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">{{ getSectionTitle() }}</h2>
            <p class="text-sm text-slate-600">{{ filteredStores.length }} stores available</p>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="toggleViewMode"
              class="p-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white transition-all duration-200"
            >
              <component :is="viewMode === 'grid' ? List : Grid3X3" class="w-4 h-4 text-gray-600" />
            </button>
            <select 
              v-model="sortBy"
              @change="handleSort"
              class="px-3 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
              <option value="products">Most Products</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-12">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="mb-6 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl">
          <div class="flex items-center">
            <AlertCircle class="w-6 h-6 text-red-500 mr-3" />
            <span class="text-red-700 font-medium">{{ error }}</span>
          </div>
        </div>

        <!-- Stores Grid/List -->
        <div v-else-if="filteredStores.length > 0">
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="store in filteredStores" 
              :key="store.id"
              class="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-white/20 hover:border-blue-500/20 transform hover:-translate-y-1"
              @click="navigateToStore(store.id)"
            >
              <div class="relative h-40">
                <img 
                  :src="store.banner_image || store.profile_picture || defaultStoreImage" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Store Banner"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                  <div class="flex items-center">
                    <img 
                      :src="store.profile_picture || defaultStoreImage" 
                      class="w-10 h-10 rounded-full object-cover border-2 border-white mr-3" 
                      alt="Store Logo"
                    />
                    <div class="flex-1">
                      <h3 class="text-white font-semibold text-sm truncate">{{ store.business_name }}</h3>
                      <div class="flex items-center">
                        <Star class="w-3 h-3 text-yellow-400 fill-current" />
                        <span class="text-white text-xs ml-1">{{ store.rating || '4.5' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="absolute top-3 right-3">
                  <span 
                    :class="`px-2 py-1 text-xs rounded-full ${getStoreCategoryColorClass(store.store_category)}`"
                  >
                    {{ store.store_category?.name || 'General' }}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ store.description || 'Welcome to our store!' }}</p>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-gray-500">
                    {{ store.product_count || 0 }} products
                  </div>
                  <div class="flex items-center">
                    <div 
                      :class="getStoreStatusClass(store.verification_status)"
                      class="w-2 h-2 rounded-full mr-2"
                    ></div>
                    <span class="text-xs text-gray-500">{{ getStoreStatusText(store.verification_status) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <div 
              v-for="store in filteredStores" 
              :key="store.id"
              class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-blue-500/20"
              @click="navigateToStore(store.id)"
            >
              <div class="flex items-center p-4">
                <img 
                  :src="store.profile_picture || defaultStoreImage" 
                  class="w-16 h-16 rounded-2xl object-cover mr-4" 
                  alt="Store Logo"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-semibold text-slate-900 truncate">{{ store.business_name }}</h3>
                    <div class="flex items-center">
                      <Star class="w-4 h-4 text-yellow-400 fill-current" />
                      <span class="text-sm text-slate-600 ml-1">{{ store.rating || '4.5' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center mb-2">
                    <span 
                      :class="`px-2 py-1 text-xs rounded-full mr-2 ${getStoreCategoryColorClass(store.store_category)}`"
                    >
                      {{ store.store_category?.name || 'General' }}
                    </span>
                    <div 
                      :class="getStoreStatusClass(store.verification_status)"
                      class="w-2 h-2 rounded-full mr-2"
                    ></div>
                    <span class="text-xs text-gray-500">{{ getStoreStatusText(store.verification_status) }}</span>
                  </div>
                  <p class="text-gray-600 text-sm line-clamp-1">{{ store.description || 'Welcome to our store!' }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ store.product_count || 0 }} products</span>
                    <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="hasMoreStores" class="text-center mt-8">
            <button 
              @click="loadMoreStores"
              :disabled="loadingMore"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <span v-if="loadingMore">Loading...</span>
              <span v-else>Load More Stores</span>
            </button>
          </div>
        </div>

        <!-- No stores state -->
        <div v-else-if="!loading" class="text-center my-12">
          <div class="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store class="w-16 h-16 text-gray-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Stores Found</h3>
          <p class="text-sm text-gray-600 mb-4">
            {{ search ? 'Try adjusting your search terms' : 'Check back soon for new stores' }}
          </p>
          <button 
            v-if="search || selectedStoreCategory"
            @click="clearAllFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import AppHeader from '@/components/AppHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  Search, X, Star, Store, Grid3X3, List, ArrowRight, AlertCircle
} from 'lucide-vue-next'
import { debounce } from 'lodash'

const router = useRouter()

// State
const stores = ref([])
const featuredStores = ref([])
const storeCategories = ref([])
const search = ref('')
const selectedStoreCategory = ref(null)
const viewMode = ref('grid') // 'grid' or 'list'
const sortBy = ref('name')
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const hasMoreStores = ref(true)
const currentPage = ref(1)
const pageSize = ref(12)

// Default store image
const defaultStoreImage = '/public/afriqexpress.png'

// Computed
const filteredStores = computed(() => {
  let filtered = stores.value

  // Filter by search
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(store => 
      store.business_name?.toLowerCase().includes(query) ||
      store.description?.toLowerCase().includes(query) ||
      store.store_category?.name?.toLowerCase().includes(query)
    )
  }

  // Filter by store category
  if (selectedStoreCategory.value) {
    filtered = filtered.filter(store => 
      store.store_category?.id === selectedStoreCategory.value
    )
  }

  // Sort stores
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'products':
        return (b.product_count || 0) - (a.product_count || 0)
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      default: // 'name'
        return (a.business_name || '').localeCompare(b.business_name || '')
    }
  })
})

// Methods
const fetchStores = async (params = {}, append = false) => {
  if (!append) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  
  error.value = null
  
  try {
    const queryParams = {
      page: append ? currentPage.value + 1 : 1,
      page_size: pageSize.value,
      verification_status: 'verified', // Only show verified stores to customers
      ...params
    }

    const response = await apiService.getStores(queryParams)
    const newStores = response.data.results || response.data

    if (append) {
      stores.value = [...stores.value, ...newStores]
      currentPage.value += 1
    } else {
      stores.value = newStores
      currentPage.value = 1
    }

    // Check if there are more stores
    hasMoreStores.value = newStores.length === pageSize.value

    return stores.value
  } catch (err) {
    console.error('Failed to fetch stores:', err)
    error.value = 'Failed to load stores. Please try again later.'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const fetchFeaturedStores = async () => {
  try {
    const response = await apiService.getStores({ 
      featured: true, 
      verification_status: 'verified',
      page_size: 6 
    })
    featuredStores.value = response.data.results || response.data
  } catch (err) {
    console.error('Failed to fetch featured stores:', err)
  }
}

const fetchStoreCategories = async () => {
  try {
    const response = await apiService.getStoreCategories()
    storeCategories.value = response.data.results || response.data
  } catch (err) {
    console.error('Failed to fetch store categories:', err)
  }
}

const handleSearch = debounce(() => {
  // Filtering is handled by computed property
}, 300)

const clearSearch = () => {
  search.value = ''
}

const filterByStoreCategory = (categoryId) => {
  selectedStoreCategory.value = categoryId
}

const showAllStores = () => {
  clearAllFilters()
}

const clearAllFilters = () => {
  search.value = ''
  selectedStoreCategory.value = null
  sortBy.value = 'name'
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const handleSort = () => {
  // Sorting is handled by computed property
}

const loadMoreStores = async () => {
  if (!hasMoreStores.value || loadingMore.value) return
  await fetchStores({}, true)
}

const navigateToStore = (storeId) => {
  router.push({ name: 'StoreDetails', params: { id: storeId } })
}

const getSectionTitle = () => {
  if (search.value) return 'Search Results'
  if (selectedStoreCategory.value) {
    const category = storeCategories.value.find(c => c.id === selectedStoreCategory.value)
    return `${category?.name || 'Category'} Stores`
  }
  return 'All Stores'
}

const getStoreCategoryColorClass = (category) => {
  if (!category) return 'bg-gray-100 text-gray-800'
  
  const colorMap = {
    'beauty': 'bg-pink-100 text-pink-800',
    'fashion': 'bg-purple-100 text-purple-800',
    'electronics': 'bg-blue-100 text-blue-800',
    'home': 'bg-green-100 text-green-800',
    'sports': 'bg-orange-100 text-orange-800',
    'books': 'bg-indigo-100 text-indigo-800',
    'food': 'bg-red-100 text-red-800'
  }
  
  const categoryName = category.name?.toLowerCase() || ''
  return colorMap[categoryName] || 'bg-gray-100 text-gray-800'
}

const getStoreStatusClass = (status) => {
  const statusMap = {
    'verified': 'bg-green-400',
    'pending': 'bg-yellow-400',
    'rejected': 'bg-red-400'
  }
  return statusMap[status] || 'bg-gray-400'
}

const getStoreStatusText = (status) => {
  const statusMap = {
    'verified': 'Verified',
    'pending': 'Pending',
    'rejected': 'Not Verified'
  }
  return statusMap[status] || 'Unknown'
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStores(),
    fetchFeaturedStores(),
    fetchStoreCategories()
  ])
})
</script>

<style scoped>
/* Hide scrollbar for webkit browsers */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced hover effects */
.hover\:-translate-y-1:hover {
  transform: translateY(-0.25rem);
}

.hover\:-translate-y-2:hover {
  transform: translateY(-0.5rem);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glass morphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Custom scrollbar for category chips */
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
</style>