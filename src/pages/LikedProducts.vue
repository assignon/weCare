<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader title="Liked Products" />
    
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>
    
    <div v-else-if="error" class="px-4 py-8">
      <div class="bg-white rounded-xl p-6 text-center">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="fetchLikedProducts"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
    
    <div v-else-if="products.length === 0" class="px-4 py-8">
      <div class="bg-white rounded-xl p-6 text-center">
        <Heart class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No Liked Products</h3>
        <p class="text-gray-600">Products and listings you like will appear here</p>
      </div>
    </div>
    
    <div v-else class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="flex flex-col"
        >
          <!-- Product Card - Only contains image -->
          <div class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square relative">
            <img 
              @click="navigateToProduct(product.id, product.item_type)"
              :src="product.main_image || packagingImage" 
              :alt="product.name || product.title"
              class="w-full h-full object-cover rounded-lg cursor-pointer"
            />
            <!-- Verified Badge (for all approved store products) -->
            <button
              v-if="product.item_type === 'store_product' && product.seller_account_status === 'APPROVED'"
              @click.stop="showVerificationDialog(product)"
              class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
            >
              <BadgeCheck class="w-4 h-4 text-blue-600" />
            </button>
          </div>
          
          <!-- Product Info - Outside the card -->
          <div class="space-y-1">
            <!-- Store Name Caption (only for store products, not shopper listings) -->
            <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-500 mb-0.5">
              {{ product.seller_name || product.store_name || 'weCare' }}
            </p>
            
            <!-- Product Name -->
            <h3 
              @click="navigateToProduct(product.id, product.item_type)"
              class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
            >
              {{ product.name || product.title }}
            </h3>
            
            <!-- Price and Quantity -->
            <div class="flex items-center justify-between">
              <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-blue-600'">
                {{ formatApiPrice(product) }}
                <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                  / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Verification Dialog -->
    <Transition name="fade">
      <div
        v-if="showVerificationDialogState"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="showVerificationDialogState = false"
      >
        <div
          class="bg-white rounded-2xl p-6 max-w-sm w-full"
          @click.stop
        >
          <div class="flex items-center justify-center mb-4">
            <div class="bg-blue-100 rounded-full p-3">
              <BadgeCheck class="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 text-center mb-2">
            Verified Product
          </h3>
          <p class="text-sm text-gray-600 text-center">
            This product and seller are verified by AfriQExpress
          </p>
          <button
            @click="showVerificationDialogState = false"
            class="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrency } from '@/composables/useCurrency'
import apiService from '@/services/api'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { Loader2, AlertCircle, Heart, BadgeCheck } from 'lucide-vue-next'
import packagingImage from '@/assets/packaging_10471395.png'

const router = useRouter()
const { formatPrice, formatApiPrice } = useCurrency()

const products = ref([])
const loading = ref(false)
const error = ref(null)
const showVerificationDialogState = ref(false)
const selectedProduct = ref(null)

const fetchLikedProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiService.getMyLikedProducts()
    products.value = response.data?.results || response.data || []
    
    // item_type is already set by the backend, no need to map
  } catch (err) {
    console.error('Failed to fetch liked products:', err)
    error.value = 'Failed to load liked products. Please try again.'
  } finally {
    loading.value = false
  }
}

const navigateToProduct = (productId, itemType = 'store_product') => {
  if (itemType === 'shopper_listing') {
    router.push({ name: 'ShopperProduct', params: { id: productId } })
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId } })
  }
}

const showVerificationDialog = (product) => {
  selectedProduct.value = product
  showVerificationDialogState.value = true
}

onMounted(() => {
  fetchLikedProducts()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

