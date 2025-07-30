<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="p-4 pb-24">
      <!-- Enhanced Header -->
      <AppHeader />

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
              class="flex-shrink-0 w-44 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-white/30"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-40 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-slate-700">🔥</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-semibold mb-1 truncate capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
              class="flex-shrink-0 w-72 h-40 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-white/30"
              @click="navigateToDetails(product.id)"
            >
              <div class="flex h-full">
                <div class="relative w-32 h-full flex-shrink-0">
                  <img 
                    :src="product.main_image || packagingImage" 
                    class="w-full h-full object-cover" 
                    alt="Product"
                  />
                  <div class="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-slate-700">✨</span>
                  </div>
                </div>
                <div class="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 class="text-sm font-semibold mb-1 truncate capitalize text-slate-900">{{ product.name }}</h3>
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
                      <span class="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
              class="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-white/30"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-32 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-slate-700">💫</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-xs font-semibold mb-1 truncate capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
import { onMounted, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'
import packagingImage from '@/assets/packaging_10471395.png'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()
const notification = useNotificationStore()
const auth = useAuthStore()
const { formatApiPrice } = useCurrency()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

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

    // Fetch popular products, new arrivals, and recommended products for home page
    await Promise.all([
      productStore.fetchPopularProducts().then(() => {
        console.log('Popular products fetched:', productStore.popularProducts.length)
      }),
      productStore.fetchNewArrivals().then(() => {
        console.log('New arrivals fetched:', productStore.newArrivals.length)
      }),
      productStore.fetchRecommendedProducts().then(() => {
        console.log('Recommended products fetched:', productStore.recommendedProducts.length)
      }).catch(err => {
        console.error('Recommended products fetch failed, continuing anyway:', err)
      })
    ])
  } catch (error) {
    console.error('Error during Home page initialization:', error)
  }
})

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
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