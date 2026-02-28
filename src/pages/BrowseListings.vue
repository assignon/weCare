<template>
  <div class="page-container">
    <!-- Header with search -->
    <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-4 py-3 shadow-nav">
      <div class="flex items-center gap-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search listings..."
            class="input w-full pl-10 pr-4 py-2"
            @input="debouncedSearch"
          />
        </div>
        <button
          @click="showFilters = !showFilters"
          class="p-2 rounded-2xl bg-navy text-white"
        >
          <SlidersHorizontal class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Filters panel -->
      <div v-if="showFilters" class="mt-3 space-y-3 pb-3 border-t border-grey-200 pt-3">
        <!-- Category filter -->
        <div>
          <label class="text-sm font-semibold text-navy block mb-1">Category</label>
          <select v-model="filters.category" class="select w-full">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <!-- City filter -->
        <div>
          <label class="text-sm font-semibold text-navy block mb-1">City</label>
          <input
            v-model="filters.city"
            type="text"
            placeholder="Enter city..."
            class="input w-full"
          />
        </div>
        
        <!-- Price type filter -->
        <div>
          <label class="text-sm font-semibold text-navy block mb-1">Price Type</label>
          <select v-model="filters.price_type" class="select w-full">
            <option value="">All Types</option>
            <option value="fixed">Fixed Price</option>
            <option value="offer">{{ t('listings.best_offer') }}</option>
            <option value="free">{{ t('listings.free') }}</option>
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
    
    <!-- Listings grid -->
    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="w-8 h-8 animate-spin text-navy" />
      </div>
      
      <div v-else-if="listings.length === 0" class="text-center py-12">
        <Package class="w-16 h-16 text-grey-300 mx-auto mb-3" />
        <p class="text-grey-400">No listings found</p>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-4">
        <div
          v-for="listing in listings"
          :key="listing.id"
          @click="goToDetails(listing.id)"
          class="card overflow-hidden cursor-pointer"
        >
          <!-- Image -->
          <div class="aspect-square bg-grey-200 relative">
            <img
              v-if="listing.main_image"
              :src="listing.main_image"
              :alt="listing.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-12 h-12 text-grey-400" />
            </div>
            
            <!-- Price badge -->
            <div
              v-if="listing.price_type === 'fixed'"
              class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-bold"
            >
              {{ formatPrice(listing.price) }}
            </div>
            <div
              v-else-if="listing.price_type === 'free'"
              class="absolute top-2 right-2 bg-success-600 text-white px-2 py-1 rounded-full text-sm font-bold"
            >
              {{ t('listings.free') }}
            </div>
            <div
              v-else
              class="absolute top-2 right-2 bg-navy text-white px-2 py-1 rounded-full text-sm font-bold"
            >
              {{ t('listings.best_offer') }}
            </div>
          </div>
          
          <!-- Details -->
          <div class="p-3">
            <p class="text-xs text-grey-400">{{ listing.category_name || 'Uncategorized' }}</p>
            <h3 class="text-sm font-semibold text-navy capitalize line-clamp-2">
              {{ listing.title }}
            </h3>
            <div class="flex items-center gap-1 mt-1 text-xs text-grey-400">
              <MapPin class="w-3 h-3" />
              <span>{{ listing.city }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { Search, SlidersHorizontal, MapPin, Package, Loader2 } from 'lucide-vue-next'
import BottomNavigation from '@/components/BottomNavigation.vue'
import apiService from '@/services/api'

const router = useRouter()
const { t } = useI18n()
const listingStore = useListingStore()
const { formatPrice } = useCurrency()

const listings = ref([])
const categories = ref([])
const searchQuery = ref('')
const showFilters = ref(false)
const loading = ref(false)
const filters = ref({
  category: '',
  city: '',
  price_type: ''
})

let searchTimeout = null

onMounted(async () => {
  await fetchCategories()
  await fetchListings()
})

async function fetchCategories() {
  try {
    const response = await apiService.getCategories()
    categories.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

async function fetchListings() {
  loading.value = true
  try {
    const params = {
      search: searchQuery.value,
      ...filters.value
    }
    
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key]
    })
    
    const response = await listingStore.fetchAllListings(params)
    listings.value = response.results || response
  } catch (error) {
    console.error('Failed to fetch listings:', error)
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchListings()
  }, 300)
}

function applyFilters() {
  showFilters.value = false
  fetchListings()
}

function goToDetails(id) {
  router.push(`/listing/${id}`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
</style>
