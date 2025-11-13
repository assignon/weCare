<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="pb-24">
      <!-- Enhanced Header with Back Button -->
      <div class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div class="flex items-center justify-between p-4">
          <button 
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft class="w-6 h-6 text-gray-600" />
          </button>
          <h1 class="text-lg font-semibold text-gray-900 truncate mx-4">
            {{ store?.business_name || 'Store Details' }}
          </h1>
          <div class="flex items-center space-x-2">
            <button 
              @click="shareStore"
              class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Share2 class="w-5 h-5 text-gray-600" />
            </button>
            <button 
              @click="toggleFavorite"
              class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Heart 
                :class="isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'"
                class="w-5 h-5 transition-colors" 
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-[50vh]">
        <div class="relative">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4">
        <div class="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6">
          <div class="flex items-center">
            <AlertCircle class="w-6 h-6 text-red-500 mr-3" />
            <span class="text-red-700 font-medium">{{ error }}</span>
          </div>
        </div>
      </div>

      <!-- Store Content -->
      <div v-else-if="store">
        <!-- Store Hero Section -->
        <div class="relative">
          <div class="h-48 relative">
            <img 
              :src="store.banner_image || store.profile_picture || defaultStoreImage" 
              class="w-full h-full object-cover" 
              alt="Store Banner"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>
          
          <!-- Store Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div class="flex items-end space-x-4">
              <img 
                :src="store.profile_picture || defaultStoreImage" 
                class="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" 
                alt="Store Logo"
              />
              <div class="flex-1">
                <h1 class="text-2xl font-bold mb-1">{{ store.business_name }}</h1>
                <div class="flex items-center space-x-4 mb-2">
                  <div class="flex items-center">
                    <Star class="w-4 h-4 text-yellow-400 fill-current" />
                    <span class="text-sm ml-1">{{ store.rating || '4.5' }}</span>
                    <span class="text-sm text-white/80 ml-1">({{ store.review_count || '0' }} reviews)</span>
                  </div>
                  <div class="flex items-center">
                    <div 
                      :class="getStoreStatusClass(store.verification_status)"
                      class="w-2 h-2 rounded-full mr-2"
                    ></div>
                    <span class="text-sm">{{ getStoreStatusText(store.verification_status) }}</span>
                  </div>
                </div>
                <v-chip 
                  :color="getStoreCategoryColor(store.store_category)" 
                  size="small"
                  class="text-white"
                >
                  {{ store.store_category?.name || 'General' }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Store Info Cards -->
        <div class="p-4">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <Package class="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-900">{{ store.product_count || 0 }}</div>
              <div class="text-xs text-gray-600">Products</div>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <Users class="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-900">{{ store.follower_count || 0 }}</div>
              <div class="text-xs text-gray-600">Followers</div>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <Clock class="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div class="text-lg font-bold text-gray-900">{{ getStoreAge() }}</div>
              <div class="text-xs text-gray-600">Active</div>
            </div>
          </div>

          <!-- Store Description -->
          <div v-if="store.description" class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">About This Store</h3>
            <p class="text-gray-600 leading-relaxed">{{ store.description }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <button 
              @click="followStore"
              :disabled="followLoading"
              class="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <UserPlus class="w-5 h-5 mr-2" />
              {{ isFollowing ? 'Following' : 'Follow Store' }}
            </button>
            <button 
              @click="contactStore"
              class="flex items-center justify-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-200"
            >
              <MessageCircle class="w-5 h-5 mr-2" />
              Contact
            </button>
          </div>
        </div>

        <!-- Product Categories in Store -->
        <div class="px-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          <div class="overflow-x-auto">
            <div class="flex space-x-3 pb-2">
              <button 
                @click="filterProducts(null)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap',
                  selectedProductCategory === null 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white'
                ]"
              >
                All Products
              </button>
              <button 
                v-for="category in productCategories" 
                :key="category.id"
                @click="filterProducts(category.id)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap',
                  selectedProductCategory === category.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white'
                ]"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="px-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ getProductsSectionTitle() }}
            </h3>
            <span class="text-sm text-gray-600">{{ filteredProducts.length }} products</span>
          </div>

          <!-- Products Loading -->
          <div v-if="productsLoading" class="flex justify-center my-8">
            <div class="relative">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-200"></div>
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="flex flex-col"
            >
              <!-- Product Card - Only contains image -->
              <div 
                @click="navigateToProduct(product.id)"
                class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square cursor-pointer"
              >
                <img 
                  :src="product.main_image || defaultProductImage" 
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <!-- Product Info - Outside the card -->
              <div class="space-y-1">
                <!-- Product Name -->
                <h4 
                  @click="navigateToProduct(product.id)"
                  class="font-bold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {{ product.name }}
                </h4>
                
                <!-- Local Names/Description with Flag -->
                <div v-if="product.local_name || product.description" class="flex items-start gap-1.5 mb-1">
                  <Flag class="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <p class="text-xs italic text-gray-600 line-clamp-1">
                    {{ product.local_name || (product.description ? product.description.substring(0, 50) + '...' : '') }}
                  </p>
                </div>
                
                <!-- Price and Quantity -->
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-blue-600">
                    {{ formatPrice(product.price) }}
                    <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                      / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- No Products -->
          <div v-else-if="!productsLoading" class="text-center py-12">
            <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p class="text-gray-600">This store doesn't have any products in this category yet.</p>
          </div>

          <!-- Load More Products -->
          <div v-if="hasMoreProducts && !productsLoading" class="text-center mt-6">
            <button 
              @click="loadMoreProducts"
              :disabled="loadingMoreProducts"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {{ loadingMoreProducts ? 'Loading...' : 'Load More Products' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import { useCartStore } from '@/stores/cart'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  ArrowLeft, Share2, Heart, Star, Package, Users, Clock, UserPlus, MessageCircle, ArrowRight, AlertCircle, Flag
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { formatPrice } = useCurrency()
const cart = useCartStore()

// State
const store = ref(null)
const products = ref([])
const productCategories = ref([])
const selectedProductCategory = ref(null)
const loading = ref(false)
const productsLoading = ref(false)
const loadingMoreProducts = ref(false)
const followLoading = ref(false)
const error = ref(null)
const hasMoreProducts = ref(true)
const currentProductPage = ref(1)
const isFollowing = ref(false)
const isFavorited = ref(false)

// Default images
const defaultStoreImage = '/public/afriqexpress.png'
const defaultProductImage = '/public/packaging_10471395.png'

// Computed
const storeId = computed(() => route.params.id)

const filteredProducts = computed(() => {
  if (!selectedProductCategory.value) return products.value
  
  return products.value.filter(product => 
    product.product_category?.id === selectedProductCategory.value
  )
})

const getProductsSectionTitle = () => {
  if (selectedProductCategory.value) {
    const category = productCategories.value.find(c => c.id === selectedProductCategory.value)
    return category?.name || 'Products'
  }
  return 'All Products'
}

// Methods
const fetchStore = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiService.getStore(storeId.value)
    store.value = response.data
    
    // Load store products and categories
    await Promise.all([
      fetchStoreProducts(),
      fetchProductCategories()
    ])
  } catch (err) {
    console.error('Failed to fetch store:', err)
    error.value = 'Failed to load store details. Please try again later.'
  } finally {
    loading.value = false
  }
}

const fetchStoreProducts = async (append = false) => {
  if (!append) {
    productsLoading.value = true
  } else {
    loadingMoreProducts.value = true
  }
  
  try {
    const params = {
      store_id: storeId.value,
      page: append ? currentProductPage.value + 1 : 1,
      page_size: 12
    }

    const response = await apiService.getProducts(params)
    const newProducts = response.data.results || response.data

    if (append) {
      products.value = [...products.value, ...newProducts]
      currentProductPage.value += 1
    } else {
      products.value = newProducts
      currentProductPage.value = 1
    }

    hasMoreProducts.value = newProducts.length === 12
  } catch (err) {
    console.error('Failed to fetch store products:', err)
  } finally {
    productsLoading.value = false
    loadingMoreProducts.value = false
  }
}

const fetchProductCategories = async () => {
  try {
    const response = await apiService.getProductCategories({ store_id: storeId.value })
    productCategories.value = response.data.results || response.data
  } catch (err) {
    console.error('Failed to fetch product categories:', err)
  }
}

const filterProducts = (categoryId) => {
  selectedProductCategory.value = categoryId
}

const loadMoreProducts = async () => {
  if (!hasMoreProducts.value || loadingMoreProducts.value) return
  await fetchStoreProducts(true)
}

const followStore = async () => {
  followLoading.value = true
  try {
    if (isFollowing.value) {
      await apiService.unfollowStore(storeId.value)
      isFollowing.value = false
    } else {
      await apiService.followStore(storeId.value)
      isFollowing.value = true
    }
  } catch (err) {
    console.error('Failed to follow/unfollow store:', err)
  } finally {
    followLoading.value = false
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  // TODO: Implement favorite store API call
}

const contactStore = () => {
  // TODO: Implement contact store functionality
  console.log('Contact store:', store.value?.business_name)
}

const shareStore = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: store.value?.business_name,
        text: `Check out ${store.value?.business_name} on AfriQExpress!`,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // Fallback: copy URL to clipboard
    await navigator.clipboard.writeText(window.location.href)
    // TODO: Show toast notification
  }
}

const navigateToProduct = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
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

const goBack = () => {
  router.back()
}

const getStoreAge = () => {
  if (!store.value?.created_at) return 'New'
  
  const createdDate = new Date(store.value.created_at)
  const now = new Date()
  const diffTime = Math.abs(now - createdDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`
  return `${Math.floor(diffDays / 365)}y`
}

const getStoreCategoryColor = (category) => {
  if (!category) return 'grey'
  
  const colorMap = {
    'beauty': 'pink',
    'fashion': 'purple',
    'electronics': 'blue',
    'home': 'green',
    'sports': 'orange',
    'books': 'indigo',
    'food': 'red'
  }
  
  const categoryName = category.name?.toLowerCase() || ''
  return colorMap[categoryName] || 'primary'
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
onMounted(() => {
  fetchStore()
})
</script>

<style scoped>
/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced hover effects */
.hover\:-translate-y-1:hover {
  transform: translateY(-0.25rem);
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

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>