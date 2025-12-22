<template>
  <div class="min-h-screen bg-white">
    <div class="p-3 pb-24 pt-6">
      <!-- Header -->
      <AppHeader />

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg mb-3 flex items-center space-x-2">
        <AlertCircle class="w-4 h-4 text-red-600 flex-shrink-0" />
        <span class="text-xs">{{ error }}</span>
      </div>

      <!-- Search Results -->
      <div v-if="hasSearchQuery && !loadingProducts" class="mt-3">
        <div v-if="searchProducts.length > 0" class="grid grid-cols-2 gap-2">
          <div 
            v-for="product in searchProducts" 
            :key="product.id" 
            class="flex flex-col"
          >
            <!-- Product Card - Only contains image -->
            <div 
              @click="navigateToDetails(product.id, product.item_type)"
              class="group bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 overflow-hidden mb-1.5 aspect-square cursor-pointer"
            >
              <img 
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <!-- Product Info - Outside the card -->
            <div class="space-y-0.5">
              <!-- Store Name Caption (only for store products, not shopper listings) -->
              <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-400 mb-0.5">
                {{ product.seller_name || product.store_name || 'AfriQExpress Seller' }}
              </p>
              
              <!-- Product Name -->
              <h3 
                @click="navigateToDetails(product.id, product.item_type)"
                class="font-semibold text-xs text-gray-900 mb-0.5 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
              >
                {{ product.name }}
              </h3>
              
              <!-- Price and Quantity -->
              <div class="flex items-center justify-between">
                <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-xs text-orange-600' : 'font-bold text-xs text-blue-600'">
                  {{ formatApiPrice(product) }}
                  <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-500">
                    / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty search results -->
        <div v-else class="text-center py-12">
          <Package class="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p class="text-xs text-gray-500">No products found</p>
        </div>
      </div>

      <!-- Store Categories Grid -->
      <div v-else-if="storeCategories.length > 0 && !hasSearchQuery" class="grid grid-cols-2 gap-2 mt-16">
        <button
          v-for="category in storeCategories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="group rounded-lg transition-all duration-200 p-[1px] flex flex-col items-center justify-center relative overflow-hidden"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <!-- Inner content area -->
          <div class="w-full h-full rounded-lg p-3 flex flex-col items-center justify-center space-y-2"
               :class="isDefault(category.id) 
                 ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                 : 'bg-white'">
            <!-- Category Icon -->
            <div class="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                 :class="isDefault(category.id) ? 'bg-white/20' : 'bg-blue-50'">
              <component :is="getCategoryIcon(category.name)" 
                         class="w-5 h-5 transition-colors duration-200" :class="isDefault(category.id) ? 'text-white' : 'text-blue-600'" />
            </div>
            
            <!-- Category Name -->
            <h3 class="font-semibold text-xs text-center line-clamp-2" :class="isDefault(category.id) ? 'text-white' : 'text-gray-900'">
              {{ category.name }}
            </h3>
            
            <!-- Category Description -->
            <p v-if="category.description" 
               class="text-xs text-center line-clamp-2" :class="isDefault(category.id) ? 'text-white/90' : 'text-gray-500'">
              {{ category.description }}
            </p>
            
            <!-- Default Badge -->
            <span v-if="isDefault(category.id)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
              Selected
            </span>
          </div>
        </button>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <Package class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-xs text-gray-500">No store categories available</p>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCRMStore } from '@/stores/crm'
import { usePharmacyStore } from '@/stores/pharmacy'
import { useProductStore } from '@/stores/product'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import apiService from '@/services/api'
import packagingImage from '@/assets/packaging_10471395.png'
import { 
  Store, Sparkles, Shirt, Pill, Sofa, Monitor, Car, 
  Package, AlertCircle 
} from 'lucide-vue-next'

const router = useRouter()
const crmStore = useCRMStore()
const pharmacyStore = usePharmacyStore()
const productStore = useProductStore()
const { formatApiPrice } = useCurrency()

const storeCategories = ref([])
const loading = ref(true)
const error = ref(null)
const loadingProducts = ref(false)

// Check if there's a search query
const hasSearchQuery = computed(() => {
  return productStore.searchQuery && productStore.searchQuery.trim().length > 0
})

// Get search products
const searchProducts = computed(() => {
  return productStore.products || []
})

// Watch for search query changes to load products
watch(() => productStore.searchQuery, async (newQuery) => {
  if (newQuery && newQuery.trim().length > 0) {
    loadingProducts.value = true
    try {
      await productStore.searchProducts(newQuery, true) // true = skip store category filter
    } catch (e) {
      console.error('Failed to search products:', e)
    } finally {
      loadingProducts.value = false
    }
  } else {
    // Clear products when search is cleared
    productStore.products = []
  }
}, { immediate: true })

// Navigate to product details
const navigateToDetails = (productId, itemType) => {
  if (itemType === 'shopper_listing') {
    router.push({ name: 'ListingDetails', params: { id: productId } })
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId } })
  }
}

const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Beauty': Sparkles,
    'Fashion': Shirt,
    'Pharmacy': Pill,
    'Furniture': Sofa,
    'Electronics': Monitor,
    'Automobile': Car
  }
  return iconMap[categoryName] || Store
}

const isDefault = (id) => String(sessionStorage.getItem('defaultStore') || '') === String(id)

const selectCategory = async (id) => {
  console.log('🏪 StoreCategory: Category selected, ID:', id)
  
  sessionStorage.setItem('defaultStore', String(id))
  
  // Find the selected category name
  const selectedCategory = storeCategories.value.find(cat => String(cat.id) === String(id))
  console.log('🏪 StoreCategory: Selected category:', selectedCategory?.name)
  
  // Check CRM flow for new store
  console.log('🔄 StoreCategory: Calling CRM store checkCategoryFlow...')
  await crmStore.checkCategoryFlow(parseInt(id))
  
  // Check pharmacy category for new store
  console.log('🔄 StoreCategory: Calling Pharmacy store checkCategoryForPharmacy...')
  await pharmacyStore.checkCategoryForPharmacy(parseInt(id), selectedCategory?.name)
  
  console.log('🔄 StoreCategory: CRM and Pharmacy checks complete')
  
  // If category is Pharmacy, navigate to Home, otherwise navigate to Explore
  if (selectedCategory?.name?.toLowerCase() === 'pharmacy') {
    console.log('🏪 StoreCategory: Pharmacy category selected, navigating to Home...')
    router.push({ name: 'Home' })
  } else {
    console.log('🏪 StoreCategory: Non-Pharmacy category selected, navigating to Explore...')
    router.push({ name: 'Explore' })
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const resp = await apiService.getStoreCategories({ is_active: true })
    storeCategories.value = resp.data?.results || resp.data || []
  } catch (e) {
    console.error('Failed to load store categories:', e)
    error.value = 'Failed to load store categories. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

