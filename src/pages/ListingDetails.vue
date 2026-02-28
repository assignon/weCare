<template>
  <div class="page-container pb-20">
    <div v-if="loading" class="flex justify-center py-8"><Loader2 class="w-8 h-8 animate-spin" /></div>
    <div v-else-if="listing">
      <!-- Images Carousel -->
      <div class="relative bg-black aspect-square">
        <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain" />
        <div v-if="listing.images && listing.images.length > 1" class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
          <button 
            v-for="(img, i) in listing.images" 
            :key="i" 
            @click="currentImageIndex = i"
            :class="i === currentImageIndex ? 'ring-2 ring-white' : 'opacity-60'"
            class="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white transition-all hover:opacity-100"
          >
            <img :src="img.image_url" :alt="`Image ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
        <button @click="$router.back()" class="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-sm rounded-full">
          <ArrowLeft class="w-5 h-5 text-white" />
        </button>
        <button 
          v-if="isOwnListing && listing.status !== 'sold'"
          @click="editListing"
          class="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full transition-all hover:opacity-90"
        >
          <Edit class="w-5 h-5 text-white" />
        </button>
      </div>

      <div class="p-4 space-y-4">
        <!-- Price -->
        <div>
          <p v-if="listing.price_type === 'fixed'" class="text-2xl font-bold text-navy">{{ formatPrice(listing.price) }}</p>
          <p v-else-if="listing.price_type === 'free'" class="text-2xl font-bold text-success-600">{{ $t('listings.free') }}</p>
          <p v-else class="text-lg font-bold text-navy">{{ $t('listings.best_offer') }} ({{ $t('listings.min') }}: {{ formatPrice(listing.min_offer_price) }})</p>
        </div>

        <!-- Title & Details -->
        <div>
          <h1 class="text-xl font-bold capitalize text-navy">{{ listing.title }}</h1>
          <div class="flex items-center gap-4 mt-2 text-sm text-grey-400">
            <div class="flex items-center gap-1"><MapPin class="w-4 h-4" />{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</div>
            <div class="flex items-center gap-1"><Eye class="w-4 h-4" />{{ listing.views_count }} {{ $t('listings.views') }}</div>
            <div v-if="listing.category_name" class="flex items-center gap-1"><Tag class="w-4 h-4" />{{ listing.category_name }}</div>
          </div>
        </div>

        <!-- Status Badge -->
        <div v-if="isOwnListing" class="flex items-center gap-2">
          <span class="text-sm font-semibold text-grey-500">{{ $t('listings.status') }}:</span>
          <span :class="getStatusClass(listing.status)" class="px-3 py-1 rounded-full text-xs font-medium">
            {{ listing.status }}
          </span>
        </div>

        <!-- Description -->
        <div>
          <h3 class="font-semibold text-navy mb-2">{{ $t('listings.description') }}</h3>
          <p class="text-grey-500 whitespace-pre-wrap">{{ listing.description }}</p>
        </div>

        <!-- Product Information -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-navy mb-3">{{ $t('listings.product_information') }}</h3>
          
          <!-- Category -->
          <div v-if="listing.category_name" class="flex items-center justify-between py-2 border-b border-grey-100">
            <span class="text-sm text-grey-400">{{ $t('listings.category') }}</span>
            <span class="text-sm font-medium text-navy">{{ listing.category_name }}</span>
          </div>

          <!-- Price Type -->
          <div class="flex items-center justify-between py-2 border-b border-grey-100">
            <span class="text-sm text-grey-400">{{ $t('listings.price_type') }}</span>
            <span class="text-sm font-medium text-navy capitalize">{{ listing.price_type === 'fixed' ? $t('listings.fixed') : listing.price_type === 'offer' ? $t('listings.offer') : $t('listings.free') }}</span>
          </div>

          <!-- Location -->
          <div class="flex items-center justify-between py-2 border-b border-grey-100">
            <span class="text-sm text-grey-400">{{ $t('listings.location') }}</span>
            <span class="text-sm font-medium text-navy">{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</span>
          </div>

          <!-- Contact Methods -->
          <div class="flex items-center justify-between py-2 border-b border-grey-100">
            <span class="text-sm text-grey-400">{{ $t('listings.contact_methods') }}</span>
            <div class="flex gap-2">
              <span v-for="method in listing.contact_methods" :key="method" class="px-2 py-1 bg-navy/10 text-navy rounded-full text-xs capitalize">
                {{ method === 'in_app' ? $t('listings.in_app') : method }}
              </span>
            </div>
          </div>

          <!-- Views & Inquiries -->
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-grey-400">{{ $t('listings.views') }}</span>
            <span class="text-sm font-medium text-navy">{{ listing.views_count || 0 }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-grey-400">{{ $t('listings.inquiries') }}</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-navy">{{ listing.inquiry_count || 0 }}</span>
              <button 
                v-if="isOwnListing && (listing.inquiry_count || 0) > 0"
                @click="goToInquiries"
                class="text-xs text-navy hover:text-navy/80 font-semibold underline"
              >
                {{ $t('listings.view_chat') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Seller Info -->
        <div v-if="!listing.is_anonymous && !isOwnListing" class="card-flat p-3">
          <p class="text-sm font-medium text-navy">{{ $t('listings.seller') }}: {{ listing.seller_name }}</p>
        </div>

        <!-- Owner Actions -->
        <div v-if="isOwnListing" class="space-y-3">
          <!-- Status Toggle -->
          <div class="card p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-navy mb-1">{{ $t('listings.listing_status') }}</h3>
                <p class="text-sm text-grey-400">{{ $t('listings.toggle_status') }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="listing.status === 'active'" 
                  @change="toggleStatus"
                  :disabled="listing.status === 'sold' || updatingStatus"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-grey-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
              </label>
            </div>
          </div>

          <!-- Mark as Sold and Delete Buttons -->
          <div class="flex items-center gap-2">
            <button 
              v-if="listing.status !== 'sold'"
              @click="showSoldDialog = true"
              :disabled="listing.status === 'inactive'"
              class="flex-1 py-3 bg-success-600 hover:bg-success-700 disabled:bg-grey-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle class="w-5 h-5" />
              {{ $t('listings.mark_as_sold') }}
            </button>
            <button 
              @click="showDeleteDialog = true"
              :disabled="deleting"
              class="p-3 bg-error-600 hover:bg-error-700 disabled:bg-grey-300 disabled:cursor-not-allowed text-white rounded-2xl transition-colors flex items-center justify-center"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contact Buttons -->
        <div v-if="!isOwnListing" class="space-y-2">
          <button v-if="listing.contact_methods.includes('in_app')" @click="contactSeller" class="btn-cta">
            <MessageCircle class="w-5 h-5 inline mr-2" />{{ $t('listings.contact_seller') }}
          </button>
          <div class="grid grid-cols-2 gap-2">
            <a v-if="listing.contact_methods.includes('whatsapp')" :href="`https://wa.me/${listing.whatsapp_number}`" target="_blank" class="py-3 bg-success-600 text-white rounded-2xl text-center font-semibold">
              WhatsApp
            </a>
            <a v-if="listing.contact_methods.includes('email')" :href="`mailto:${listing.contact_email}`" class="py-3 bg-grey-500 text-white rounded-2xl text-center font-semibold">
              Email
            </a>
          </div>
        </div>
      </div>

      <!-- Offer Modal -->
      <div v-if="showOfferModal" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="showOfferModal = false">
        <div class="bg-white rounded-t-3xl p-4 w-full">
          <h3 class="text-lg font-bold text-navy mb-4">Send Inquiry</h3>
          <div v-if="listing.price_type === 'offer'" class="mb-4">
            <label class="block text-sm font-semibold text-navy mb-1">Your Offer</label>
            <input v-model.number="offerPrice" type="number" :min="listing.min_offer_price" class="input" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold text-navy mb-1">Message (optional)</label>
            <textarea v-model="offerMessage" rows="3" class="textarea"></textarea>
          </div>
          <button @click="submitInquiry" :disabled="submitting" class="btn-cta">
            {{ submitting ? 'Sending...' : 'Send Inquiry' }}
          </button>
        </div>
      </div>

      <!-- Mark as Sold Confirmation Dialog -->
      <Transition name="dialog">
        <div v-if="showSoldDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSoldDialog = false"></div>
          <div class="relative bg-white rounded-3xl shadow-float w-full max-w-md transform transition-all duration-300">
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center">
                  <CheckCircle class="w-8 h-8 text-success-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-navy mb-2">{{ $t('listings.mark_as_sold_confirm') }}</h3>
              <p class="text-center text-grey-400 text-sm leading-relaxed">{{ $t('listings.mark_sold_message') }}</p>
            </div>
            <div class="p-6 pt-4 space-y-2">
              <button
                @click="confirmMarkAsSold"
                :disabled="updatingStatus"
                class="w-full py-3 bg-success-600 hover:bg-success-700 disabled:bg-grey-300 text-white font-semibold rounded-2xl transition-all duration-200 shadow-card flex items-center justify-center gap-2"
              >
                <Loader2 v-if="updatingStatus" class="w-5 h-5 animate-spin" />
                <CheckCircle v-else class="w-5 h-5" />
                {{ updatingStatus ? $t('listings.updating') : $t('listings.yes_mark_sold') }}
              </button>
              <button
                @click="showSoldDialog = false"
                :disabled="updatingStatus"
                class="w-full py-3 bg-grey-100 hover:bg-grey-200 text-grey-500 font-semibold rounded-2xl transition-all duration-200"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Delete Confirmation Dialog -->
      <Transition name="dialog">
        <div v-if="showDeleteDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteDialog = false"></div>
          <div class="relative bg-white rounded-3xl shadow-float w-full max-w-md transform transition-all duration-300">
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center">
                  <Trash2 class="w-8 h-8 text-error-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-navy mb-2">{{ $t('listings.delete_listing_confirm') }}</h3>
              <p class="text-center text-grey-400 text-sm leading-relaxed">{{ $t('listings.delete_listing_message') }}</p>
            </div>
            <div class="p-6 pt-4 space-y-2">
              <button
                @click="confirmDelete"
                :disabled="deleting"
                class="w-full py-3 bg-error-600 hover:bg-error-700 disabled:bg-grey-300 text-white font-semibold rounded-2xl transition-all duration-200 shadow-card flex items-center justify-center gap-2"
              >
                <Loader2 v-if="deleting" class="w-5 h-5 animate-spin" />
                <Trash2 v-else class="w-5 h-5" />
                {{ deleting ? 'Deleting...' : 'Yes, Delete Permanently' }}
              </button>
              <button
                @click="showDeleteDialog = false"
                :disabled="deleting"
                class="w-full py-3 bg-grey-100 hover:bg-grey-200 text-grey-500 font-semibold rounded-2xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Error Dialog -->
      <Transition name="dialog">
        <div v-if="showErrorDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeErrorDialog"></div>
          <div class="relative bg-white rounded-3xl shadow-float w-full max-w-md transform transition-all duration-300">
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center">
                  <AlertCircle class="w-8 h-8 text-error-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-navy mb-2">{{ errorDialogTitle }}</h3>
              <p class="text-center text-grey-400 text-sm leading-relaxed">{{ errorDialogMessage }}</p>
            </div>
            <div class="p-6 pt-4">
              <button
                @click="closeErrorDialog"
                class="w-full py-3 bg-error-600 hover:bg-error-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-card"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCurrency } from '@/composables/useCurrency'
import { ArrowLeft, MapPin, Eye, MessageCircle, Loader2, Tag, CheckCircle, Edit, AlertCircle, Info, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const listingStore = useListingStore()
const authStore = useAuthStore()
const { formatPrice } = useCurrency()

const listing = ref(null)
const loading = ref(false)
const currentImageIndex = ref(0)
const showOfferModal = ref(false)
const offerPrice = ref(null)
const offerMessage = ref('')
const submitting = ref(false)
const showSoldDialog = ref(false)
const updatingStatus = ref(false)
const showErrorDialog = ref(false)
const errorDialogTitle = ref('')
const errorDialogMessage = ref('')
const showDeleteDialog = ref(false)
const deleting = ref(false)

const currentImage = computed(() => {
  if (!listing.value?.images || listing.value.images.length === 0) return listing.value?.main_image
  return listing.value.images[currentImageIndex.value]?.image_url
})

const isOwnListing = computed(() => {
  return listing.value?.seller === authStore.user?.id
})

onMounted(async () => {
  loading.value = true
  try {
    listing.value = await listingStore.fetchListing(route.params.id)
    if (listing.value.price_type === 'offer') {
      offerPrice.value = listing.value.min_offer_price
    }
  } finally {
    loading.value = false
  }
})

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function showError(title, message) {
  errorDialogTitle.value = title
  errorDialogMessage.value = message
  showErrorDialog.value = true
}

function closeErrorDialog() {
  showErrorDialog.value = false
}

function editListing() {
  router.push(`/edit-listing/${listing.value.id}`)
}

function goToInquiries() {
  router.push({ name: 'ListingInquiries' })
}

async function toggleStatus() {
  if (listing.value.status === 'sold') return
  
  updatingStatus.value = true
  try {
    const newStatus = listing.value.status === 'active' ? 'inactive' : 'active'
    await listingStore.updateListingStatus(listing.value.id, newStatus)
    listing.value.status = newStatus
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || 'Failed to update status'
    showError('Error', errorMessage)
  } finally {
    updatingStatus.value = false
  }
}

async function confirmMarkAsSold() {
  updatingStatus.value = true
  try {
    await listingStore.markAsSold(listing.value.id)
    listing.value.status = 'sold'
    showSoldDialog.value = false
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || 'Failed to mark as sold'
    showError('Error', errorMessage)
  } finally {
    updatingStatus.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await listingStore.deleteListing(listing.value.id)
    showDeleteDialog.value = false
    router.push('/my-listings')
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || 'Failed to delete listing'
    showError('Error', errorMessage)
  } finally {
    deleting.value = false
  }
}

function contactSeller() {
  if (listing.value.contact_methods.includes('in_app')) {
    showOfferModal.value = true
  }
}

async function submitInquiry() {
  submitting.value = true
  try {
    const data = {
      listing: listing.value.id,
      message: offerMessage.value
    }
    if (listing.value.price_type === 'offer' && offerPrice.value) {
      data.offer_price = offerPrice.value
    }
    
    const inquiry = await listingStore.createInquiry(data)
    showOfferModal.value = false
    router.push(`/listing-chat/${inquiry.id}`)
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data?.detail || 'Failed to send inquiry'
    showError('Error', errorMessage)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
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
