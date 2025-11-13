<template>
  <div class="min-h-screen bg-gray-50 pb-20">
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
            class="w-12 h-12 rounded-lg overflow-hidden border-2 border-white transition-all hover:opacity-100"
          >
            <img :src="img.image_url" :alt="`Image ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
        <button @click="$router.back()" class="absolute top-4 left-4 p-2">
          <div class="gradient-arrow"></div>
        </button>
        <button 
          v-if="isOwnListing && listing.status !== 'sold'"
          @click="editListing"
          class="absolute top-4 right-4 p-2 transition-all hover:opacity-90"
        >
          <div class="gradient-edit"></div>
        </button>
      </div>

      <div class="p-4 space-y-4">
        <!-- Price -->
        <div>
          <p v-if="listing.price_type === 'fixed'" class="text-2xl font-bold text-blue-600">{{ formatPrice(listing.price) }}</p>
          <p v-else-if="listing.price_type === 'free'" class="text-2xl font-bold text-green-600">FREE</p>
          <p v-else class="text-lg font-bold text-blue-600">Best Offer (Min: {{ formatPrice(listing.min_offer_price) }})</p>
        </div>

        <!-- Title & Details -->
        <div>
          <h1 class="text-xl font-bold capitalize">{{ listing.title }}</h1>
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div class="flex items-center gap-1"><MapPin class="w-4 h-4" />{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</div>
            <div class="flex items-center gap-1"><Eye class="w-4 h-4" />{{ listing.views_count }} views</div>
            <div v-if="listing.category_name" class="flex items-center gap-1"><Tag class="w-4 h-4" />{{ listing.category_name }}</div>
          </div>
        </div>

        <!-- Status Badge -->
        <div v-if="isOwnListing" class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Status:</span>
          <span :class="getStatusClass(listing.status)" class="px-3 py-1 rounded-full text-xs font-medium">
            {{ listing.status }}
          </span>
        </div>

        <!-- Description -->
        <div>
          <h3 class="font-medium mb-2">Description</h3>
          <p class="text-gray-700 whitespace-pre-wrap">{{ listing.description }}</p>
        </div>

        <!-- Product Information -->
        <div class="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">Product Information</h3>
          
          <!-- Category -->
          <div v-if="listing.category_name" class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Category</span>
            <span class="text-sm font-medium text-gray-900">{{ listing.category_name }}</span>
          </div>

          <!-- Price Type -->
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Price Type</span>
            <span class="text-sm font-medium text-gray-900 capitalize">{{ listing.price_type }}</span>
          </div>

          <!-- Location -->
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Location</span>
            <span class="text-sm font-medium text-gray-900">{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</span>
          </div>

          <!-- Contact Methods -->
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Contact Methods</span>
            <div class="flex gap-2">
              <span v-for="method in listing.contact_methods" :key="method" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                {{ method === 'in_app' ? 'In-App' : method }}
              </span>
            </div>
          </div>

          <!-- Views & Inquiries -->
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-600">Views</span>
            <span class="text-sm font-medium text-gray-900">{{ listing.views_count || 0 }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-600">Inquiries</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-900">{{ listing.inquiry_count || 0 }}</span>
              <button 
                v-if="isOwnListing && (listing.inquiry_count || 0) > 0"
                @click="goToInquiries"
                class="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
              >
                View Chat
              </button>
            </div>
          </div>
        </div>

        <!-- Seller Info -->
        <div v-if="!listing.is_anonymous && !isOwnListing" class="p-3 bg-gray-100 rounded-lg">
          <p class="text-sm font-medium">Seller: {{ listing.seller_name }}</p>
        </div>

        <!-- Owner Actions -->
        <div v-if="isOwnListing" class="space-y-3">
          <!-- Status Toggle -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Listing Status</h3>
                <p class="text-sm text-gray-600">Toggle between active and inactive</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="listing.status === 'active'" 
                  @change="toggleStatus"
                  :disabled="listing.status === 'sold' || updatingStatus"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <!-- Mark as Sold and Delete Buttons -->
          <div class="flex items-center gap-2">
            <button 
              v-if="listing.status !== 'sold'"
              @click="showSoldDialog = true"
              :disabled="listing.status === 'inactive'"
              class="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle class="w-5 h-5" />
              Mark as Sold
            </button>
            <button 
              @click="showDeleteDialog = true"
              :disabled="deleting"
              class="p-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contact Buttons -->
        <div v-if="!isOwnListing" class="space-y-2">
          <button v-if="listing.contact_methods.includes('in_app')" @click="contactSeller" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
            <MessageCircle class="w-5 h-5 inline mr-2" />Contact Seller
          </button>
          <div class="grid grid-cols-2 gap-2">
            <a v-if="listing.contact_methods.includes('whatsapp')" :href="`https://wa.me/${listing.whatsapp_number}`" target="_blank" class="py-3 bg-green-600 text-white rounded-lg text-center font-medium">
              WhatsApp
            </a>
            <a v-if="listing.contact_methods.includes('email')" :href="`mailto:${listing.contact_email}`" class="py-3 bg-gray-600 text-white rounded-lg text-center font-medium">
              Email
            </a>
          </div>
        </div>
      </div>

      <!-- Offer Modal -->
      <div v-if="showOfferModal" class="fixed inset-0 bg-black/50 flex items-end z-50" @click.self="showOfferModal = false">
        <div class="bg-white rounded-t-2xl p-4 w-full">
          <h3 class="text-lg font-bold mb-4">Send Inquiry</h3>
          <div v-if="listing.price_type === 'offer'" class="mb-4">
            <label class="block text-sm font-medium mb-1">Your Offer</label>
            <input v-model.number="offerPrice" type="number" :min="listing.min_offer_price" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea v-model="offerMessage" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>
          <button @click="submitInquiry" :disabled="submitting" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
            {{ submitting ? 'Sending...' : 'Send Inquiry' }}
          </button>
        </div>
      </div>

      <!-- Mark as Sold Confirmation Dialog -->
      <Transition name="dialog">
        <div v-if="showSoldDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSoldDialog = false"></div>
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
            <!-- Header -->
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle class="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-slate-900 mb-2">Mark as Sold?</h3>
              <p class="text-center text-slate-600 text-sm leading-relaxed">Are you sure you want to mark this listing as sold? This action cannot be undone.</p>
            </div>

            <!-- Actions -->
            <div class="p-6 pt-4 space-y-2">
              <button
                @click="confirmMarkAsSold"
                :disabled="updatingStatus"
                class="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Loader2 v-if="updatingStatus" class="w-5 h-5 animate-spin" />
                <CheckCircle v-else class="w-5 h-5" />
                {{ updatingStatus ? 'Updating...' : 'Yes, Mark as Sold' }}
              </button>
              <button
                @click="showSoldDialog = false"
                :disabled="updatingStatus"
                class="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Delete Confirmation Dialog -->
      <Transition name="dialog">
        <div v-if="showDeleteDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteDialog = false"></div>
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
            <!-- Header -->
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 class="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-slate-900 mb-2">Delete Listing?</h3>
              <p class="text-center text-slate-600 text-sm leading-relaxed">Are you sure you want to delete this listing? This action cannot be undone and the listing will be permanently removed from the database.</p>
            </div>

            <!-- Actions -->
            <div class="p-6 pt-4 space-y-2">
              <button
                @click="confirmDelete"
                :disabled="deleting"
                class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Loader2 v-if="deleting" class="w-5 h-5 animate-spin" />
                <Trash2 v-else class="w-5 h-5" />
                {{ deleting ? 'Deleting...' : 'Yes, Delete Permanently' }}
              </button>
              <button
                @click="showDeleteDialog = false"
                :disabled="deleting"
                class="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200"
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
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
            <!-- Header -->
            <div class="p-6 pb-4">
              <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle class="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 class="text-xl font-bold text-center text-slate-900 mb-2">{{ errorDialogTitle }}</h3>
              <p class="text-center text-slate-600 text-sm leading-relaxed">{{ errorDialogMessage }}</p>
            </div>

            <!-- Actions -->
            <div class="p-6 pt-4">
              <button
                @click="closeErrorDialog"
                class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
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

.gradient-arrow {
  width: 20px;
  height: 20px;
  background: linear-gradient(to right, #8c36ea, #3060eb);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.gradient-edit {
  width: 20px;
  height: 20px;
  background: linear-gradient(to right, #8c36ea, #3060eb);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}
</style>

