<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="p-4 pb-24">
      <!-- Enhanced Header -->
      <AppHeader />

      <!-- Select Default Store Category Dialog -->
      <Transition name="dialog">
        <div v-if="showStoreDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg transform transition-all duration-300">
            <!-- Header -->
            <div class="p-8 pb-6">
              <h3 class="text-2xl font-bold text-center text-slate-900 mb-2">Choose Your Store</h3>
              <p class="text-center text-slate-600 text-sm leading-relaxed">Select a store category to personalize your shopping experience</p>
              <div class="mt-3 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Required
                </span>
              </div>
            </div>

            <!-- Categories List -->
            <div class="px-8 pb-6">
              <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                <button v-for="cat in storeCategories" :key="cat.id"
                        @click="selectDefaultStore(cat.id)"
                        class="group w-full text-left p-4 rounded-2xl border border-slate-200/60 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                      <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">{{ cat.name }}</div>
                      <div class="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">{{ cat.description || 'Explore amazing products' }}</div>
                    </div>
                    <div class="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-8 pb-8">
              <div class="text-center">
                <div class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm text-blue-700 font-medium">Please select a store category to continue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Popular Products Section -->
      <div v-if="productStore.popularProducts.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">Popular Products</h2>
            <p class="text-sm text-slate-600">Trending items you'll love</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">🔥</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- Popular products with horizontal scroll -->
        <div v-else class="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div class="flex gap-4 pb-2">
            <div 
              v-for="product in productStore.popularProducts.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-44 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-40 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold text-slate-700">🔥</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-blue-600">
                    {{ formatApiPrice(product) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Arrivals Section -->
      <div v-if="productStore.newArrivals.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">New Arrivals</h2>
            <p class="text-sm text-slate-600">Fresh products just for you</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">✨</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- New arrivals with horizontal scroll -->
        <div v-else class="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div class="flex gap-4 pb-2">
            <div 
              v-for="product in productStore.newArrivals.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-72 h-40 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="flex h-full">
                <div class="relative w-32 h-full flex-shrink-0">
                  <img 
                    :src="product.main_image || packagingImage" 
                    class="w-full h-full object-cover" 
                    alt="Product"
                  />
                  <div class="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span class="text-xs font-bold text-slate-700">✨</span>
                  </div>
                </div>
                <div class="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 class="text-sm font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                    <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <span 
                        v-if="product.original_price && product.original_price > product.price"
                        class="text-xs line-through text-slate-500 mr-2"
                      >
                        {{ formatApiPrice({ price: product.original_price }) }}
                      </span>
                      <span class="text-sm font-semibold text-blue-600">
                        {{ formatApiPrice(product) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Products Section -->
      <div v-if="productStore.recommendedProducts.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">Recommended For You</h2>
            <p class="text-sm text-slate-600">Personalized picks just for you</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">💫</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- Recommended products in 2x2 grid -->
        <div v-else>
          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="product in productStore.recommendedProducts.slice(0, 4)" 
              :key="product.id"
              class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-32 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold text-slate-700">💫</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-xs font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-blue-600">
                    {{ formatApiPrice(product) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'
import packagingImage from '@/assets/packaging_10471395.png'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'
import apiService from '@/services/api'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()
const notification = useNotificationStore()
const auth = useAuthStore()
const { formatApiPrice } = useCurrency()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const showStoreDialog = ref(false)
const storeCategories = ref([])

const navigateToProfile = () => {
  router.push({ name: 'Profile' })
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

onMounted(async () => {
  console.log('Home page mounted - starting initialization')

  try {
    // Initialize cart state
    cart.initCartState()
    console.log('Cart state initialized')

    await Promise.all([
      cart.fetchCart().then(() => console.log('Cart fetched')).catch(err => {
        console.error('Cart fetch failed, continuing anyway:', err)
      })
    ])

    // init notification store
    await notification.init()

    console.log('Starting to fetch products...')

          // Ensure default store category is set in session
      try {
        const resp = await apiService.getStoreCategories({ is_active: true })
        storeCategories.value = resp.data?.results || resp.data || []
        const defaultStore = sessionStorage.getItem('defaultStore')
        if (!defaultStore) {
          showStoreDialog.value = true
        }
      } catch (e) {
        console.warn('Failed to load store categories on Home:', e)
      }

    // Fetch popular products, new arrivals, and store-filtered products
    const defaultStore = sessionStorage.getItem('defaultStore')
    const params = defaultStore ? { store_category: defaultStore } : {}
    await Promise.all([
      productStore.fetchPopularProducts(params),
      productStore.fetchNewArrivals(params),
    ])

    // Fetch products for selected store category (defaultStore) for home sections
    if (defaultStore && productStore.setStoreProducts) {
      try {
        const { data } = await apiService.getProducts({ store_category: defaultStore, page_size: 12 })
        productStore.setStoreProducts(data?.results || data || [])
      } catch (e) {
        console.warn('Failed to load products by store category for home:', e)
      }
    }
  } catch (error) {
    console.error('Error during Home page initialization:', error)
  }
})

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
}

function selectDefaultStore(id) {
  sessionStorage.setItem('defaultStore', String(id))
  showStoreDialog.value = false
  // Reload data with selected store
  location.reload()
}


</script>

<style scoped>
/* Hide scrollbar for webkit browsers */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

/* Custom width for bundle cards */
.w-70 {
  width: 17.5rem;
}

.h-30 {
  height: 7.5rem;
}

/* Enhanced hover effects */
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

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Line clamp utility for product names */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for category list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Dialog transitions */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.dialog-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(20px);
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
</style>