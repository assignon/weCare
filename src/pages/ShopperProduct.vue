<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 pb-24">
    <!-- Top navigation bar -->
    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <button 
          @click="$router.go(-1)" 
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div v-if="!isOwnListing" class="flex items-center space-x-2">
          <button 
            @click="toggleLike"
            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
            :class="isLiked ? 'bg-red-50 border-red-200' : ''"
          >
            <Heart 
              class="w-5 h-5 transition-colors" 
              :class="isLiked ? 'text-red-600 fill-current' : 'text-gray-600'"
            />
          </button>
          <button 
            @click="shareListing"
            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
          >
            <Share2 class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8 pt-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>
    <div v-else-if="listing" class="pt-16 pb-4">
      <!-- Product image carousel -->
      <div class="relative mb-6">
        <!-- Main image -->
        <div class="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            v-if="currentImage" 
            :src="currentImage" 
            :alt="listing.title"
            class="w-full h-full object-cover"
          />
          
          <!-- Thumbnail images overlay -->
          <div v-if="listing.images && listing.images.length > 1" class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <button 
              v-for="(img, index) in listing.images" 
              :key="index"
              @click="currentImageIndex = index"
              :class="[
                'w-10 h-10 rounded-md overflow-hidden border-2 transition-all duration-200',
                currentImageIndex === index 
                  ? 'border-white shadow-lg' 
                  : 'border-white/50 hover:border-white/75'
              ]"
            >
              <img 
                :src="img.image_url" 
                :alt="`${listing.title} - Image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-4">
        <!-- Title -->
        <div>
          <h1 class="text-lg font-bold capitalize text-gray-900">{{ listing.title }}</h1>
        </div>

        <!-- Price -->
        <div>
          <p v-if="listing.price_type === 'fixed'" class="text-xl font-bold text-gray-900">{{ formatPrice(listing.price) }}</p>
          <p v-else-if="listing.price_type === 'free'" class="text-xl font-bold text-green-600">FREE</p>
          <p v-else class="text-xl font-bold text-gray-900">Best Offer (Min: {{ formatPrice(listing.min_offer_price) }})</p>
        </div>

        <!-- Action Buttons -->
        <div v-if="!isOwnListing" class="space-y-2">
          <!-- Messages Button (if inquiry exists) -->
          <button
            v-if="existingInquiryId"
            @click="router.push({ name: 'ListingChat', params: { inquiryId: existingInquiryId } })"
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle class="w-5 h-5" />
            Messages
          </button>
          
          <!-- Send Message and Make Offer Buttons (if no inquiry exists) -->
          <template v-else>
            <button
              @click="showMessageSheet = true; customMessageMode = false"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle class="w-5 h-5" />
              Send Message
            </button>
            <button
              v-if="listing.price_type === 'offer'"
              @click="showOfferSheet = true"
              class="w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Gavel class="w-5 h-5" />
              Make an Offer
            </button>
          </template>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Seller Information -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-gray-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ listing.seller_name || 'Anonymous' }}</p>
              <p class="text-xs text-gray-500">{{ sellerActiveDuration }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Bids Section (for offer type) -->
        <div v-if="listing.price_type === 'offer' && !isOwnListing" class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-900">Bids (0)</h3>
          <button
            @click="showOfferSheet = true"
            class="text-blue-600 text-sm font-medium flex items-center gap-1"
          >
            Now make the first bid
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-900">Description</h3>
          <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ listing.description }}</p>
        </div>

        <!-- Product Details -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-900">Details</h3>
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-gray-500" />
              <span>{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4 text-gray-500" />
              <span>{{ listing.views_count }} views</span>
            </div>
            <div v-if="listing.category_name" class="flex items-center gap-2">
              <Tag class="w-4 h-4 text-gray-500" />
              <span>{{ listing.category_name }}</span>
            </div>
          </div>
        </div>

        <!-- Contact Methods Section -->
        <div v-if="listing.contact_methods && listing.contact_methods.length > 0" class="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 class="text-base font-bold text-gray-900">Contact Methods</h3>
          
          <div class="space-y-2">
            <!-- In-App Message -->
            <div v-if="listing.contact_methods.includes('in_app')" class="flex items-center gap-3">
              <MessageCircle class="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">In-App Message</p>
                <p class="text-xs text-gray-500">Send a message through the app</p>
              </div>
            </div>
            
            <!-- WhatsApp -->
            <div v-if="listing.contact_methods.includes('whatsapp') && listing.whatsapp_number" class="flex items-center gap-3">
              <Phone class="w-5 h-5 text-green-600 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">WhatsApp</p>
                <a 
                  :href="`https://wa.me/${listing.whatsapp_number.replace(/[^0-9]/g, '')}`" 
                  target="_blank"
                  class="text-xs text-green-600 hover:text-green-700"
                >
                  {{ listing.whatsapp_number }}
                </a>
              </div>
            </div>
            
            <!-- Email -->
            <div v-if="listing.contact_methods.includes('email') && listing.contact_email" class="flex items-center gap-3">
              <Mail class="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Email</p>
                <a 
                  :href="`mailto:${listing.contact_email}`" 
                  class="text-xs text-blue-600 hover:text-blue-700"
                >
                  {{ listing.contact_email }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- About the Seller Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h3 class="text-base font-bold text-gray-900">About the advertiser</h3>
          
          <!-- Seller Profile -->
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <User class="w-6 h-6 text-gray-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-blue-600">{{ listing.seller_name || 'Anonymous' }}</p>
              <p class="text-xs text-gray-500">{{ sellerActiveDuration }}</p>
            </div>
          </div>

          <!-- All Ads -->
          <div class="flex items-start gap-3">
            <FileText class="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">All ads</p>
              <button
                @click="viewSellerListings"
                class="text-xs text-blue-600 mt-1"
              >
                See all ads
              </button>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="pt-3 border-t border-gray-200">
            <p class="text-xs text-gray-600 leading-relaxed">
              <span class="font-semibold">⚠️ Important:</span> This seller is an anonymous seller and is not verified by AfriQExpress. 
              Never make any payment (online or cash) before seeing the product and confirming it yourself. 
              You are responsible for your own safety and transactions. AfriQExpress is not liable for any fraud.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Bottom Sheet -->
    <Transition name="slide-up">
      <div v-if="showMessageSheet" class="fixed inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/50" @click="showMessageSheet = false"></div>
        <div class="relative bg-white rounded-t-3xl w-full h-[500px] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-base font-bold text-gray-900">Send Message</h3>
            <button @click="showMessageSheet = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Template Messages -->
            <div v-if="!customMessageMode" class="space-y-4">
              <button
                v-for="(template, index) in messageTemplates"
                :key="index"
                @click="sendTemplateMessage(template)"
                class="w-full text-left py-3 text-sm text-gray-900 hover:text-blue-600 transition-colors"
              >
                {{ template }}
              </button>
              
              <!-- Custom Message Option -->
              <button
                @click="customMessageMode = true"
                class="w-full text-left py-3 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                ✏️ Write a message yourself
              </button>
            </div>

            <!-- Custom Message Form -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                <textarea
                  v-model="customMessage"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <button
                @click="sendCustomMessage"
                :disabled="!customMessage.trim() || sendingMessage"
                class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="sendingMessage">Sending...</span>
                <span v-else>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Make Offer Bottom Sheet -->
    <Transition name="slide-up">
      <div v-if="showOfferSheet" class="fixed inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/50" @click="showOfferSheet = false"></div>
        <div class="relative bg-white rounded-t-3xl w-full h-[500px] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="text-base font-bold text-gray-900">Make an Offer</h3>
            <button @click="showOfferSheet = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Price Field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Your Offer (FCA)</label>
              <input 
                v-model.number="offerPrice" 
                type="number" 
                :min="listing.min_offer_price" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your offer"
              />
              <p class="text-xs text-gray-500 mt-1">Minimum: {{ formatPrice(listing.min_offer_price) }}</p>
            </div>

            <!-- Message Textarea -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea
                v-model="offerMessage"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Add a message to your offer..."
              ></textarea>
            </div>

            <!-- Send Offer Button -->
            <button
              @click="sendOffer"
              :disabled="!offerPrice || offerPrice < listing.min_offer_price || sendingOffer"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              <span v-if="sendingOffer">Sending Offer...</span>
              <span v-else>Send Offer</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error Dialog -->
    <Transition name="fade">
      <div v-if="showErrorDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showErrorDialog = false"></div>
        <div class="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle class="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Error</h3>
              <p class="text-sm text-gray-700 mb-4">{{ errorMessage }}</p>
              <button
                @click="showErrorDialog = false"
                class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCurrency } from '@/composables/useCurrency'
import { MapPin, Eye, Tag, Loader2, X, MessageCircle, Gavel, User, ChevronRight, FileText, Phone, Mail, AlertCircle, ArrowLeft, Heart, Share2 } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const listingStore = useListingStore()
const authStore = useAuthStore()
const { formatPrice } = useCurrency()

const listing = ref(null)
const loading = ref(false)
const currentImageIndex = ref(0)
const showMessageSheet = ref(false)
const showOfferSheet = ref(false)
const customMessageMode = ref(false)
const customMessage = ref('')
const offerPrice = ref(null)
const offerMessage = ref('')
const sendingMessage = ref(false)
const sendingOffer = ref(false)
const sellerFirstListingDate = ref(null)
const showErrorDialog = ref(false)
const errorMessage = ref('')
const existingInquiryId = ref(null)
const isLiked = ref(false)

const isOwnListing = computed(() => {
  if (!listing.value || !authStore.user) return false
  const sellerId = typeof listing.value.seller === 'object' ? listing.value.seller?.id : listing.value.seller
  return sellerId === authStore.user.id
})

const messageTemplates = computed(() => {
  return [
    "Is it still for sale?",
    "I will like to buy it for the asking price"
  ]
})

const currentImage = computed(() => {
  if (!listing.value?.images || listing.value.images.length === 0) return listing.value?.main_image
  return listing.value.images[currentImageIndex.value]?.image_url
})

const sellerActiveDuration = computed(() => {
  if (!sellerFirstListingDate.value) return 'Recently active'
  
  const now = new Date()
  const firstDate = new Date(sellerFirstListingDate.value)
  const diffTime = Math.abs(now - firstDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day'
  if (diffDays < 30) return `${diffDays} days`
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} ${years === 1 ? 'year' : 'years'}`
})

function extractErrorMessage(err) {
  if (!err.response?.data) {
    return err.message || 'An unexpected error occurred. Please try again.'
  }
  
  const errorData = err.response.data
  
  // Handle validation errors (400 status) - extract all field errors
  if (err.response.status === 400 && errorData) {
    const errorMessages = []
    
    // Extract field-specific errors
    for (const [field, messages] of Object.entries(errorData)) {
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          if (typeof msg === 'string') {
            errorMessages.push(msg)
          }
        })
      } else if (typeof messages === 'string') {
        errorMessages.push(messages)
      } else if (typeof messages === 'object' && messages !== null) {
        // Handle nested error objects
        Object.values(messages).forEach(msg => {
          if (Array.isArray(msg)) {
            msg.forEach(m => errorMessages.push(m))
          } else if (typeof msg === 'string') {
            errorMessages.push(msg)
          }
        })
      }
    }
    
    if (errorMessages.length > 0) {
      return errorMessages.join('. ')
    }
  }
  
  // Handle other error formats
  if (errorData.detail) {
    return errorData.detail
  }
  if (errorData.message) {
    return errorData.message
  }
  if (errorData.error) {
    return errorData.error
  }
  if (typeof errorData === 'string') {
    return errorData
  }
  
  return 'An error occurred. Please try again.'
}

onMounted(async () => {
  loading.value = true
  try {
    listing.value = await listingStore.fetchListing(route.params.id)
    if (listing.value.price_type === 'offer') {
      offerPrice.value = listing.value.min_offer_price
    }
    
    // Check like status
    if (listing.value && !isOwnListing.value) {
      await checkLikeStatus(listing.value.id)
    }
    
    // Check if user has already made an inquiry for this listing
    // Fetch inquiries filtered by listing ID
    try {
      const response = await apiService.getMyInquiries({ listing: listing.value.id })
      const inquiries = response.data?.results || response.data || []
      
      // Check if results array is not empty and buyer ID matches current user
      if (inquiries.length > 0 && authStore.user?.id) {
        const existingInquiry = inquiries.find(i => {
          const buyerId = typeof i.buyer === 'object' ? i.buyer?.id : i.buyer
          return buyerId === authStore.user.id
        })
        if (existingInquiry) {
          existingInquiryId.value = existingInquiry.id
        }
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err)
    }
    
    // Fetch seller's first listing date
    try {
      const response = await apiService.getShopperListings()
      const allListings = response.data?.results || response.data || []
      const sellerListings = allListings.filter(l => l.seller === listing.value.seller)
      if (sellerListings.length > 0) {
        const sortedListings = sellerListings.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        sellerFirstListingDate.value = sortedListings[0].created_at
      }
    } catch (err) {
      console.error('Failed to fetch seller listings:', err)
    }
  } catch (err) {
    console.error('Failed to fetch listing:', err)
  } finally {
    loading.value = false
  }
})

async function sendTemplateMessage(template) {
  await sendMessage(template)
}

async function sendCustomMessage() {
  if (!customMessage.value.trim()) return
  await sendMessage(customMessage.value)
}

async function sendMessage(message) {
  sendingMessage.value = true
  try {
    // Create inquiry if it doesn't exist, or get existing one
    let inquiryId = null
    
    try {
      // Try to create inquiry
      const inquiryData = {
        listing: listing.value.id,
        message: message,
        offer_price: listing.value.price_type === 'offer' ? offerPrice.value : null
      }
      const inquiryResponse = await apiService.createInquiry(inquiryData)
      inquiryId = inquiryResponse.data.id
    } catch (err) {
      // Inquiry might already exist, try to get it
      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.message || ''
        if (errorMsg.includes('already created an inquiry')) {
          // Get existing inquiries for this listing
          const myInquiries = await listingStore.fetchMyInquiries()
          const existingInquiry = myInquiries.find(i => {
            const listingId = typeof i.listing === 'object' ? i.listing?.id : i.listing
            return listingId === listing.value.id
          })
          if (existingInquiry) {
            inquiryId = existingInquiry.id
            // Update the UI state
            existingInquiryId.value = existingInquiry.id
            // Send message to existing inquiry
            await listingStore.sendMessage(inquiryId, message)
            
            // Close sheet and navigate
            showMessageSheet.value = false
            customMessageMode.value = false
            customMessage.value = ''
            router.push({ name: 'ListingChat', params: { inquiryId } })
            return
          } else {
            // If we can't find it, just redirect to inquiries page
            throw err
          }
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
    
    if (inquiryId) {
      // Send message
      await listingStore.sendMessage(inquiryId, message)
      
      // Update existing inquiry ID
      existingInquiryId.value = inquiryId
      
      // Close sheet and show success
      showMessageSheet.value = false
      customMessageMode.value = false
      customMessage.value = ''
      
      // Navigate to chat
      router.push({ name: 'ListingChat', params: { inquiryId } })
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    errorMessage.value = extractErrorMessage(err)
    showErrorDialog.value = true
  } finally {
    sendingMessage.value = false
  }
}

async function sendOffer() {
  // Validate offer price on frontend
  if (!offerPrice.value) {
    errorMessage.value = 'Please enter an offer price'
    showErrorDialog.value = true
    return
  }
  
  if (offerPrice.value < listing.value.min_offer_price) {
    errorMessage.value = `Please enter an offer of at least ${formatPrice(listing.value.min_offer_price)}`
    showErrorDialog.value = true
    return
  }

  sendingOffer.value = true
  try {
    // Create inquiry with offer
    const inquiryData = {
      listing: listing.value.id,
      message: offerMessage.value || `I'd like to buy it for ${formatPrice(offerPrice.value)}`,
      offer_price: offerPrice.value
    }
    
    let inquiryId = null
    try {
      const inquiryResponse = await apiService.createInquiry(inquiryData)
      inquiryId = inquiryResponse.data.id
      
      // If inquiry was created successfully, send the message
      if (inquiryId && inquiryData.message) {
        await listingStore.sendMessage(inquiryId, inquiryData.message)
      }
    } catch (err) {
      // Check for offer price validation error from backend
      if (err.response?.status === 400) {
        const errorData = err.response.data
        // Check for offer_price validation error
        if (errorData.offer_price) {
          const offerError = Array.isArray(errorData.offer_price) ? errorData.offer_price[0] : errorData.offer_price
          errorMessage.value = offerError || `Offer price must be at least ${formatPrice(listing.value.min_offer_price)}`
          showErrorDialog.value = true
          sendingOffer.value = false
          return
        }
        
        // Inquiry might already exist, try to get it
        const errorMsg = errorData.non_field_errors?.[0] || errorData.message || ''
        if (errorMsg.includes('already created an inquiry')) {
          // Get existing inquiries for this listing
          const myInquiries = await listingStore.fetchMyInquiries()
          const existingInquiry = myInquiries.find(i => {
            const listingId = typeof i.listing === 'object' ? i.listing?.id : i.listing
            return listingId === listing.value.id
          })
          if (existingInquiry) {
            inquiryId = existingInquiry.id
            // Update the UI state
            existingInquiryId.value = existingInquiry.id
            // Send message with offer
            await listingStore.sendMessage(inquiryId, inquiryData.message)
          } else {
            // If we can't find it, just redirect to inquiries page
            throw err
          }
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
    
    if (inquiryId) {
      // Update existing inquiry ID
      existingInquiryId.value = inquiryId
      
      // Close sheet
      showOfferSheet.value = false
      offerPrice.value = listing.value.min_offer_price || 0
      offerMessage.value = ''
      
      // Navigate to chat
      router.push({ name: 'ListingChat', params: { inquiryId } })
    }
  } catch (err) {
    console.error('Failed to send offer:', err)
    errorMessage.value = extractErrorMessage(err)
    showErrorDialog.value = true
  } finally {
    sendingOffer.value = false
  }
}

function viewSellerListings() {
  // Store seller ID in sessionStorage to filter on Explore page
  sessionStorage.setItem('filterBySeller', listing.value.seller)
  router.push({ name: 'Explore' })
}

// Like functionality (Note: Shopper listings are not products, so we can't use product likes)
// If you want to add likes for listings, create a ShopperListingLike model and API
const checkLikeStatus = async (listingId) => {
  if (!listingId || !authStore.user) {
    isLiked.value = false
    return
  }
  
  try {
    const response = await apiService.checkShopperListingLike(listingId)
    isLiked.value = response.data.liked || false
  } catch (error) {
    console.error('Failed to check like status:', error)
    isLiked.value = false
  }
}

const toggleLike = async () => {
  if (!listing.value || !authStore.user || isOwnListing.value) return
  
  try {
    const response = await apiService.toggleShopperListingLike(listing.value.id)
    isLiked.value = response.data.liked || false
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

// Share listing via WhatsApp
const shareListing = () => {
  if (!listing.value) return
  
  const listingUrl = `${window.location.origin}/shopper-product/${listing.value.id}`
  const listingTitle = listing.value.title || 'Check out this listing'
  const shareText = `${listingTitle}\n\n${listingUrl}`
  
  // Encode the message for WhatsApp
  const encodedText = encodeURIComponent(shareText)
  const whatsappUrl = `https://wa.me/?text=${encodedText}`
  
  // Open WhatsApp in a new window/tab
  window.open(whatsappUrl, '_blank')
}
</script>

<style scoped>
.gradient-arrow {
  width: 24px;
  height: 24px;
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

