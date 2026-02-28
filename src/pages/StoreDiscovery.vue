<template>
  <div class="page-container">
    <!-- Header -->
    <div class="bg-white shadow-nav border-b border-grey-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-4">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-navy">Discover Stores</h1>
            
            <!-- View Toggle -->
            <div class="flex items-center space-x-3">
              <div class="flex border border-grey-200 rounded-2xl">
                <button
                  @click="viewMode = 'grid'"
                  :class="viewMode === 'grid' ? 'bg-navy text-white' : 'text-grey-500 hover:bg-grey-50'"
                  class="p-2 rounded-l-2xl transition-colors"
                >
                  <Grid class="h-4 w-4" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="viewMode === 'list' ? 'bg-navy text-white' : 'text-grey-500 hover:bg-grey-50'"
                  class="p-2 rounded-r-2xl transition-colors"
                >
                  <List class="h-4 w-4" />
                </button>
              </div>
              
              <button
                @click="showFilters = !showFilters"
                class="flex items-center px-4 py-2 border border-grey-200 rounded-2xl hover:bg-grey-50"
              >
                <Filter class="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-grey-400" />
            </div>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search stores by name, category, or location..."
              class="input w-full pl-10 pr-4 py-3"
            />
          </div>

          <!-- Category Filters -->
          <div class="flex space-x-2 mt-4 overflow-x-auto pb-2">
            <button
              @click="selectedCategory = null"
              :class="selectedCategory === null 
                ? 'bg-navy text-white' 
                : 'bg-white text-grey-500 hover:bg-grey-50'"
              class="flex-shrink-0 px-4 py-2 rounded-full border border-grey-200 text-sm font-medium transition-colors"
            >
              All Categories
            </button>
            <button
              v-for="category in storeCategories"
              :key="category.id"
              @click="selectedCategory = category.id"
              :class="selectedCategory === category.id 
                ? 'bg-navy text-white' 
                : 'bg-white text-grey-500 hover:bg-grey-50'"
              class="flex-shrink-0 px-4 py-2 rounded-full border border-grey-200 text-sm font-medium transition-colors"
            >
              {{ category.name }}
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
        class="absolute right-0 top-0 h-full w-80 bg-white shadow-float transform lg:relative lg:translate-x-0 lg:shadow-none lg:w-64 overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-navy">Filters</h3>
            <button @click="showFilters = false" class="lg:hidden">
              <X class="h-5 w-5 text-grey-400" />
            </button>
          </div>

          <!-- Location Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-navy mb-3">Location</h4>
            <select
              v-model="filters.location"
              class="select w-full"
            >
              <option value="">All Locations</option>
              <option v-for="location in locations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>

          <!-- Rating Filter -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-navy mb-3">Minimum Rating</h4>
            <div class="space-y-2">
              <label 
                v-for="rating in [5, 4, 3, 2]" 
                :key="rating"
                class="flex items-center cursor-pointer"
              >
                <input
                  v-model="filters.minRating"
                  :value="rating"
                  type="radio"
                  class="text-navy focus:ring-navy"
                />
                <div class="ml-2 flex items-center">
                  <div class="flex">
                    <Star
                      v-for="i in 5"
                      :key="i"
                      :class="i <= rating ? 'text-yellow-400' : 'text-grey-200'"
                      class="h-4 w-4 fill-current"
                    />
                  </div>
                  <span class="ml-1 text-sm text-grey-500">& up</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Store Features -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-navy mb-3">Features</h4>
            <div class="space-y-2">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="filters.freeShipping"
                  type="checkbox"
                  class="rounded border-grey-200 text-navy focus:ring-navy"
                />
                <span class="ml-2 text-sm text-grey-500">Free Shipping</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="filters.verified"
                  type="checkbox"
                  class="rounded border-grey-200 text-navy focus:ring-navy"
                />
                <span class="ml-2 text-sm text-grey-500">Verified Stores</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="filters.featured"
                  type="checkbox"
                  class="rounded border-grey-200 text-navy focus:ring-navy"
                />
                <span class="ml-2 text-sm text-grey-500">Featured Stores</span>
              </label>
            </div>
          </div>

          <!-- Sort Options -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-navy mb-3">Sort By</h4>
            <select
              v-model="filters.sortBy"
              class="select w-full"
            >
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="followers">Most Followers</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          <button
            @click="applyFilters"
            class="btn-cta"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" :class="{ 'lg:pl-72': showFilters }">
      <!-- Featured Stores Section -->
      <div v-if="!searchQuery && !selectedCategory" class="mb-8">
        <h2 class="text-xl font-bold text-navy mb-6">Featured Stores</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="store in featuredStores" 
            :key="store.id"
            @click="goToStore(store.id)"
            class="card overflow-hidden hover:shadow-float transition-all duration-200 cursor-pointer group"
          >
            <!-- Store Banner -->
            <div class="relative h-32 bg-navy overflow-hidden">
              <img
                v-if="store.banner_image"
                :src="store.banner_image"
                :alt="store.store_name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div class="absolute inset-0 bg-black bg-opacity-20"></div>
              
              <!-- Featured Badge -->
              <div class="absolute top-3 left-3">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown class="w-3 h-3 mr-1" />
                  Featured
                </span>
              </div>

              <!-- Follow Button -->
              <button
                @click.stop="toggleFollow(store)"
                class="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
              >
                <Heart 
                  :class="store.is_following ? 'text-red-500 fill-current' : 'text-grey-500'" 
                  class="w-4 h-4" 
                />
              </button>
            </div>

            <!-- Store Info -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <img
                    :src="store.logo || '/placeholder-store.jpg'"
                    :alt="store.store_name"
                    class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-card"
                  />
                  <div class="ml-3">
                    <h3 class="font-semibold text-navy">{{ store.store_name }}</h3>
                    <div class="flex items-center mt-1">
                      <div class="flex">
                        <Star
                          v-for="i in 5"
                          :key="i"
                          :class="i <= (store.rating || 0) ? 'text-yellow-400' : 'text-grey-200'"
                          class="w-4 h-4 fill-current"
                        />
                      </div>
                      <span class="ml-1 text-sm text-grey-400">({{ store.review_count || 0 }})</span>
                    </div>
                  </div>
                </div>
                
                <!-- Verification Badge -->
                <div v-if="store.is_verified" class="flex-shrink-0">
                  <CheckCircle class="w-5 h-5 text-green-500" />
                </div>
              </div>

              <p class="text-sm text-grey-500 mb-4 line-clamp-2">{{ store.description }}</p>

              <!-- Store Stats -->
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-lg font-bold text-navy">{{ store.product_count || 0 }}</div>
                  <div class="text-xs text-grey-400">Products</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-navy">{{ store.follower_count || 0 }}</div>
                  <div class="text-xs text-grey-400">Followers</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-navy">{{ store.order_count || 0 }}</div>
                  <div class="text-xs text-grey-400">Orders</div>
                </div>
              </div>

              <!-- Store Tags -->
              <div class="flex flex-wrap gap-2 mt-4">
                <span 
                  v-for="tag in store.tags?.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-1 bg-grey-50 text-grey-500 text-xs rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Results -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-navy">
            {{ searchQuery ? `Search results for "${searchQuery}"` : 'All Stores' }}
          </h2>
          <p class="text-sm text-grey-400">{{ filteredStores.length }} stores found</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 9" :key="i" class="animate-pulse">
            <div class="card overflow-hidden">
              <div class="h-32 bg-grey-200"></div>
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-grey-200 rounded-full"></div>
                  <div class="ml-3 flex-1">
                    <div class="h-4 bg-grey-200 rounded mb-2"></div>
                    <div class="h-3 bg-grey-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div class="h-3 bg-grey-200 rounded mb-4"></div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-8 bg-grey-200 rounded"></div>
                  <div class="h-8 bg-grey-200 rounded"></div>
                  <div class="h-8 bg-grey-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div 
          v-else-if="viewMode === 'grid'"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <StoreCard
            v-for="store in filteredStores"
            :key="store.id"
            :store="store"
            @click="goToStore(store.id)"
            @toggle-follow="toggleFollow"
          />
        </div>

        <!-- List View -->
        <div v-else-if="viewMode === 'list'" class="space-y-4">
          <StoreListItem
            v-for="store in filteredStores"
            :key="store.id"
            :store="store"
            @click="goToStore(store.id)"
            @toggle-follow="toggleFollow"
          />
        </div>

        <!-- No Results -->
        <div v-if="!loading && filteredStores.length === 0" class="text-center py-16">
          <Store class="w-16 h-16 text-grey-200 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-navy mb-2">No stores found</h3>
          <p class="text-grey-400 mb-4">Try adjusting your search or filters</p>
          <button
            @click="clearFilters"
            class="btn btn-primary px-4 py-2"
          >
            Clear Filters
          </button>
        </div>

        <!-- Load More -->
        <div v-if="hasMore && !loading" class="text-center mt-8">
          <button
            @click="loadMore"
            class="btn btn-outlined px-6 py-3"
          >
            Load More Stores
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import StoreCard from '@/components/StoreCard.vue'
import StoreListItem from '@/components/StoreListItem.vue'
import { 
  Search, Filter, X, Grid, List, Star, Heart, Crown, 
  CheckCircle, Store
} from 'lucide-vue-next'

const router = useRouter()

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)
const showFilters = ref(false)
const viewMode = ref('grid')
const page = ref(1)
const hasMore = ref(true)

// Data
const stores = ref([])
const featuredStores = ref([])
const storeCategories = ref([])
const locations = ref([])

// Filters
const filters = reactive({
  location: '',
  minRating: '',
  freeShipping: false,
  verified: false,
  featured: false,
  sortBy: 'featured'
})

// Mock data
const mockStores = [
  {
    id: 1,
    store_name: 'TechZone Electronics',
    description: 'Your one-stop shop for all electronics and gadgets',
    logo: '/store-logos/techzone.jpg',
    banner_image: '/store-banners/techzone.jpg',
    rating: 4.8,
    review_count: 1250,
    product_count: 450,
    follower_count: 15000,
    order_count: 8500,
    is_verified: true,
    is_following: false,
    tags: ['Electronics', 'Gadgets', 'Computers'],
    location: 'New York',
    category_id: 1
  },
  {
    id: 2,
    store_name: 'EcoFashion Store',
    description: 'Sustainable and eco-friendly fashion for everyone',
    logo: '/store-logos/ecofashion.jpg',
    banner_image: '/store-banners/ecofashion.jpg',
    rating: 4.6,
    review_count: 890,
    product_count: 230,
    follower_count: 8500,
    order_count: 4200,
    is_verified: true,
    is_following: true,
    tags: ['Fashion', 'Sustainable', 'Organic'],
    location: 'California',
    category_id: 2
  },
  {
    id: 3,
    store_name: 'Beauty Paradise',
    description: 'Premium beauty products and cosmetics',
    logo: '/store-logos/beauty.jpg',
    banner_image: '/store-banners/beauty.jpg',
    rating: 4.9,
    review_count: 2100,
    product_count: 680,
    follower_count: 25000,
    order_count: 12000,
    is_verified: true,
    is_following: false,
    tags: ['Beauty', 'Cosmetics', 'Skincare'],
    location: 'Florida',
    category_id: 3
  }
]

const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 3, name: 'Beauty' },
  { id: 4, name: 'Home & Garden' },
  { id: 5, name: 'Sports' }
]

// Initialize with mock data
stores.value = mockStores
featuredStores.value = mockStores.slice(0, 3)
storeCategories.value = mockCategories
locations.value = ['New York', 'California', 'Florida', 'Texas', 'Illinois']

// Computed
const filteredStores = computed(() => {
  let result = [...stores.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(store => 
      store.store_name.toLowerCase().includes(query) ||
      store.description.toLowerCase().includes(query) ||
      store.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // Category filter
  if (selectedCategory.value) {
    result = result.filter(store => store.category_id === selectedCategory.value)
  }
  
  // Location filter
  if (filters.location) {
    result = result.filter(store => store.location === filters.location)
  }
  
  // Rating filter
  if (filters.minRating) {
    result = result.filter(store => (store.rating || 0) >= parseInt(filters.minRating))
  }
  
  // Feature filters
  if (filters.verified) {
    result = result.filter(store => store.is_verified)
  }
  
  if (filters.featured) {
    result = result.filter(store => featuredStores.value.some(f => f.id === store.id))
  }
  
  // Sorting
  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'followers':
      result.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'alphabetical':
      result.sort((a, b) => a.store_name.localeCompare(b.store_name))
      break
  }
  
  return result
})

// Methods
const fetchStores = async (params = {}) => {
  loading.value = true
  try {
    const response = await apiService.getStores({
      search: searchQuery.value,
      category: selectedCategory.value,
      page: page.value,
      page_size: 20,
      ...params
    })
    
    if (page.value === 1) {
      stores.value = response.data.results || response.data || []
    } else {
      stores.value.push(...(response.data.results || response.data || []))
    }
    
    hasMore.value = !!response.data.next
  } catch (error) {
    console.error('Error fetching stores:', error)
  } finally {
    loading.value = false
  }
}

const fetchFeaturedStores = async () => {
  try {
    const response = await apiService.getStores({ featured: true, page_size: 6 })
    featuredStores.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching featured stores:', error)
  }
}

const fetchStoreCategories = async () => {
  try {
    const response = await apiService.getStoreCategories()
    storeCategories.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching store categories:', error)
  }
}

const handleSearch = () => {
  page.value = 1
  fetchStores()
}

const applyFilters = () => {
  page.value = 1
  fetchStores()
  showFilters.value = false
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = null
  Object.assign(filters, {
    location: '',
    minRating: '',
    freeShipping: false,
    verified: false,
    featured: false,
    sortBy: 'featured'
  })
  page.value = 1
  fetchStores()
}

const loadMore = () => {
  page.value++
  fetchStores()
}

const goToStore = (storeId) => {
  router.push(`/store/${storeId}`)
}

const toggleFollow = async (store) => {
  try {
    if (store.is_following) {
      await apiService.unfollowStore(store.id)
      store.follower_count = Math.max(0, (store.follower_count || 0) - 1)
    } else {
      await apiService.followStore(store.id)
      store.follower_count = (store.follower_count || 0) + 1
    }
    store.is_following = !store.is_following
  } catch (error) {
    console.error('Error toggling follow:', error)
  }
}

// Watchers
watch(() => filters.sortBy, applyFilters)
watch(selectedCategory, () => {
  page.value = 1
  fetchStores()
})

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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
