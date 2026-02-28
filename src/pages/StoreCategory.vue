<template>
  <div class="page-container">
    <AppHeader />
    <div class="px-5 pb-28 pt-20">

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-error mb-4">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span class="text-sm">{{ error }}</span>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="hasSearchQuery && !loadingProducts">
        <p class="text-sm text-grey-400 mb-4">{{ $t('store_category.search_results') || 'Search results' }}</p>
        <div v-if="searchProducts.length > 0" class="grid grid-cols-2 gap-4">
          <div 
            v-for="product in searchProducts" 
            :key="product.id"
            class="rounded-3xl bg-grey-50 p-2"
          >
            <div 
              @click="navigateToDetails(product.id, product.item_type)"
              class="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group"
            >
              <img 
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="hero-overlay"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <p class="text-white text-xs leading-tight line-clamp-2 capitalize">{{ product.name }}</p>
              </div>
            </div>
            <div class="mt-2 px-1">
              <p v-if="product.item_type === 'store_product'" class="text-[11px] text-grey-400 mb-0.5 truncate">
                {{ product.seller_name || product.store_name || 'AfriQExpress Seller' }}
              </p>
              <span class="font-bold text-sm text-navy">
                {{ formatApiPrice(product) }}
              </span>
              <span v-if="product.quantity || product.weight" class="text-xs text-grey-400 ml-1">
                / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-20">
          <div class="w-16 h-16 rounded-3xl bg-grey-50 flex items-center justify-center mx-auto mb-4">
            <Package class="w-7 h-7 text-grey-300" />
          </div>
          <p class="text-sm text-grey-400">{{ $t('store_category.no_products') || 'No products found' }}</p>
        </div>
      </div>

      <!-- Store Categories Grid -->
      <div v-else-if="storeCategories.length > 0 && !hasSearchQuery">
        <h2 class="text-xl font-bold text-navy mb-1 mt-10">{{ $t('store_category.title') || 'Categories' }}</h2>
        <p class="text-sm text-grey-400 mb-5">{{ $t('store_category.subtitle') || 'Choose a category to explore' }}</p>
        
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="category in storeCategories"
            :key="category.id"
            @click="selectCategory(category.id)"
            class="group rounded-3xl p-5 text-left transition-all duration-200 relative overflow-hidden"
            :class="isDefault(category.id) 
              ? 'bg-navy text-white shadow-card' 
              : 'bg-grey-50 hover:bg-grey-100'"
          >
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all"
                 :class="isDefault(category.id) ? 'bg-white/20' : 'bg-white shadow-sm'">
              <component :is="getCategoryIcon(category.name)" 
                         class="w-6 h-6 transition-colors" 
                         :class="isDefault(category.id) ? 'text-white' : 'text-navy'" />
            </div>
            
            <h3 class="font-bold text-sm mb-1" :class="isDefault(category.id) ? 'text-white' : 'text-navy'">
              {{ category.name }}
            </h3>
            
            <p v-if="category.description" 
               class="text-xs line-clamp-2 leading-relaxed" 
               :class="isDefault(category.id) ? 'text-white/70' : 'text-grey-400'">
              {{ category.description }}
            </p>
            
            <span v-if="isDefault(category.id)" 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/20 text-white mt-3">
              {{ $t('store_category.selected') || 'Selected' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div class="w-16 h-16 rounded-3xl bg-grey-50 flex items-center justify-center mx-auto mb-4">
          <Package class="w-7 h-7 text-grey-300" />
        </div>
        <p class="text-sm text-grey-400">{{ $t('store_category.empty') || 'No store categories available' }}</p>
      </div>
    </div>

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
