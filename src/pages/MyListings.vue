<template>
  <div class="min-h-screen bg-gray-50">
    <BackButtonHeader :title="$t('listings.my_listings')">
      <template #right>
        <button @click="handleAddListing" class="p-2 text-white rounded-lg" style="background: linear-gradient(to right, #8c36ea, #3060eb);">
          <Plus class="w-5 h-5" />
        </button>
      </template>
    </BackButtonHeader>
    <div v-if="stats" class="px-4 py-3 bg-white border-b text-sm">
      <div class="flex gap-4">
        <div><span class="font-medium">{{ stats.active_listings }}</span>/{{ stats.max_listings }} Active</div>
        <div><span class="font-medium">{{ stats.sold_listings }}</span> Sold</div>
        <div><span class="font-medium">{{ stats.total_inquiries }}</span> Inquiries</div>
      </div>
    </div>

    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <div v-else-if="listings.length === 0" class="text-center py-12">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 mb-4">{{ $t('listings.no_listings') }}</p>
        <button 
          @click="handleAddListing"
          class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          {{ $t('listings.create_first') }}
        </button>
      </div>
      <div v-else class="grid grid-cols-2 gap-4">
        <div v-for="listing in listings" :key="listing.id" class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div @click="$router.push(`/listing/${listing.id}`)" class="cursor-pointer">
            <div class="aspect-square bg-gray-200 relative">
              <img v-if="listing.main_image" :src="listing.main_image" :alt="listing.title" class="w-full h-full object-cover" />
              <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium" :class="statusClass(listing.status)">
                {{ listing.status }}
              </div>
            </div>
            <div class="p-2">
              <h3 class="text-sm font-medium capitalize line-clamp-2">{{ listing.title }}</h3>
              <div class="flex items-center justify-between mt-1">
                <div>
                  <p v-if="listing.price_type === 'fixed'" class="text-blue-600 font-bold">{{ formatPrice(listing.price) }}</p>
                  <p v-else-if="listing.price_type === 'free'" class="text-green-600 font-bold">FREE</p>
                  <p v-else class="text-blue-600 font-bold">Best Offer</p>
                </div>
                <button 
                  v-if="listing.status !== 'sold'"
                  @click.stop="editListing(listing.id)" 
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit class="w-4 h-4" />
                </button>
              </div>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Eye class="w-3 h-3" /> {{ listing.views_count }}
                <MessageCircle class="w-3 h-3" /> {{ listing.inquiry_count }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Limit Reached Dialog -->
    <Transition name="dialog" appear>
      <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDialog"></div>
        <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle class="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-center text-slate-900 mb-2">{{ $t('listings.listing_limit_reached') }}</h3>
            <p class="text-center text-slate-600 text-sm leading-relaxed">{{ dialogMessage }}</p>
            <div v-if="sellerPortalUrl" class="mt-4 text-center">
              <a 
                :href="sellerPortalUrl" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                {{ $t('listings.visit_seller_platform') }}
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-4">
            <button
              @click="closeDialog"
              class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {{ $t('listings.got_it') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { Plus, Package, Loader2, Eye, MessageCircle, Edit, AlertCircle } from 'lucide-vue-next'
import BackButtonHeader from '@/components/BackButtonHeader.vue'

const router = useRouter()
const listingStore = useListingStore()
const { formatPrice } = useCurrency()

const listings = ref([])
const stats = ref(null)
const loading = ref(false)
const showDialog = ref(false)
const dialogMessage = ref('')
const sellerPortalUrl = ref('')

onMounted(async () => {
  await Promise.all([fetchListings(), fetchStats()])
})

async function fetchListings() {
  loading.value = true
  try {
    await listingStore.fetchMyListings()
    listings.value = listingStore.myListings
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    stats.value = await listingStore.fetchListingStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

function statusClass(status) {
  const classes = {
    active: 'bg-green-600 text-white',
    sold: 'bg-gray-600 text-white',
    inactive: 'bg-yellow-600 text-white'
  }
  return classes[status] || 'bg-gray-600 text-white'
}

function editListing(id) {
  router.push(`/edit-listing/${id}`)
}

async function handleAddListing() {
  // Check listing limit before navigating
  try {
    // Ensure stats are loaded
    if (!stats.value) {
      await fetchStats()
    }
    
    const maxListings = stats.value?.max_listings || 5
    // Count non-sold listings (active + inactive, but not sold)
    const nonSoldListings = (stats.value?.total_listings || 0) - (stats.value?.sold_listings || 0)
    
    if (nonSoldListings >= maxListings) {
      const portalUrl = 'https://seller.afriqxpress.com/'
      const message = `You have reached the maximum limit of ${maxListings} listings. If you want to post more listings, please use our seller platform.`
      dialogMessage.value = message
      sellerPortalUrl.value = portalUrl
      showDialog.value = true
      return
    }
    
    // If limit not reached, navigate to create listing page
    router.push('/create-listing')
  } catch (error) {
    console.error('Failed to check listing limit:', error)
    // If check fails, still allow navigation (backend will validate)
    router.push('/create-listing')
  }
}

function closeDialog() {
  showDialog.value = false
  dialogMessage.value = ''
  sellerPortalUrl.value = ''
}
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 2; }

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: transform 0.3s ease;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.9) translateY(20px);
}
</style>

