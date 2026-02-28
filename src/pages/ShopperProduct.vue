<template>
  <div class="page-container pb-24">
    <!-- Top navigation bar -->
    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/90 backdrop-blur-md">
      <div class="flex items-center justify-between">
        <button 
          @click="$router.go(-1)" 
          class="w-10 h-10 bg-white rounded-2xl shadow-card transition-all duration-200 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-grey-500" />
        </button>
        <div v-if="!isOwnListing" class="flex items-center space-x-2">
          <button 
            @click="toggleLike"
            class="w-10 h-10 bg-white rounded-2xl shadow-card transition-all duration-200 flex items-center justify-center"
            :class="isLiked ? 'bg-red-50' : ''"
          >
            <Heart 
              class="w-5 h-5 transition-colors" 
              :class="isLiked ? 'text-red-600 fill-current' : 'text-grey-500'"
            />
          </button>
          <button 
            @click="shareListing"
            class="w-10 h-10 bg-white rounded-2xl shadow-card transition-all duration-200 flex items-center justify-center"
          >
            <Share2 class="w-5 h-5 text-grey-500" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8 pt-20">
      <Loader2 class="w-8 h-8 animate-spin text-navy" />
    </div>
    <div v-else-if="listing" class="pt-16 pb-4">
      <!-- Product image carousel -->
      <div class="relative mb-6">
        <div class="aspect-square overflow-hidden bg-grey-50 relative">
          <img 
            v-if="currentImage" 
            :src="currentImage" 
            :alt="listing.title"
            class="w-full h-full object-cover"
          />
          
          <div v-if="listing.images && listing.images.length > 1" class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/20 backdrop-blur-sm rounded-2xl px-2 py-1">
            <button 
              v-for="(img, index) in listing.images" 
              :key="index"
              @click="currentImageIndex = index"
              :class="[
                'w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-200',
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
          <h1 class="text-lg font-bold capitalize text-navy">{{ listing.title }}</h1>
        </div>

        <!-- Price -->
        <div>
          <p v-if="listing.price_type === 'fixed'" class="text-xl font-bold text-navy">{{ formatPrice(listing.price) }}</p>
          <p v-else-if="listing.price_type === 'free'" class="text-xl font-bold text-success-600">{{ $t('listings.free') }}</p>
          <p v-else class="text-xl font-bold text-navy">{{ $t('listings.best_offer') }} ({{ $t('listings.min') }}: {{ formatPrice(listing.min_offer_price) }})</p>
        </div>

        <!-- Action Buttons -->
        <div v-if="!isOwnListing" class="space-y-2">
          <button
            v-if="existingInquiryId"
            @click="router.push({ name: 'ListingChat', params: { inquiryId: existingInquiryId } })"
            class="btn-cta flex items-center justify-center gap-2"
          >
            <MessageCircle class="w-5 h-5" />
            {{ $t('listings.messages') }}
          </button>
          
          <template v-else>
            <button
              @click="showMessageSheet = true; customMessageMode = false"
              class="btn-cta flex items-center justify-center gap-2"
            >
              <MessageCircle class="w-5 h-5" />
              {{ $t('listings.send_message') }}
            </button>
            <button
              v-if="listing.price_type === 'offer'"
              @click="showOfferSheet = true"
              class="btn btn-outlined flex items-center justify-center gap-2"
            >
              <Gavel class="w-5 h-5" />
              {{ $t('listings.make_offer') }}
            </button>
          </template>
        </div>

        <!-- Divider -->
        <div class="border-t border-grey-100"></div>

        <!-- Seller Information -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-grey-100 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-grey-400" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-navy">{{ listing.seller_name || $t('listings.anonymous') }}</p>
              <p class="text-xs text-grey-400">{{ sellerActiveDuration }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-grey-300" />
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-grey-100"></div>

        <!-- Bids Section (for offer type) -->
        <div v-if="listing.price_type === 'offer' && !isOwnListing" class="space-y-2">
          <h3 class="text-sm font-semibold text-navy">{{ $t('listings.bids') }} (0)</h3>
          <button
            @click="showOfferSheet = true"
            class="text-navy text-sm font-semibold flex items-center gap-1"
          >
            {{ $t('listings.make_first_bid') }}
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-navy">{{ $t('listings.description') }}</h3>
          <p class="text-sm text-grey-500 whitespace-pre-wrap leading-relaxed">{{ listing.description }}</p>
        </div>

        <!-- Product Details -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-navy">{{ $t('listings.details') }}</h3>
          <div class="space-y-2 text-sm text-grey-500">
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-grey-400" />
              <span>{{ listing.city }}{{ listing.neighborhood ? `, ${listing.neighborhood}` : '' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4 text-grey-400" />
              <span>{{ listing.views_count }} {{ $t('listings.views') }}</span>
            </div>
            <div v-if="listing.category_name" class="flex items-center gap-2">
              <Tag class="w-4 h-4 text-grey-400" />
              <span>{{ listing.category_name }}</span>
            </div>
          </div>
        </div>

        <!-- Contact Methods Section -->
        <div v-if="listing.contact_methods && listing.contact_methods.length > 0" class="card p-4 space-y-3">
          <h3 class="text-base font-bold text-navy">{{ $t('listings.contact_methods') }}</h3>
          
          <div class="space-y-2">
            <div v-if="listing.contact_methods.includes('in_app')" class="flex items-center gap-3">
              <MessageCircle class="w-5 h-5 text-navy flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-navy">{{ $t('listings.in_app') }}</p>
                <p class="text-xs text-grey-400">{{ $t('listings.send_message_through_app') }}</p>
              </div>
            </div>
            
            <div v-if="listing.contact_methods.includes('whatsapp') && listing.whatsapp_number" class="flex items-center gap-3">
              <Phone class="w-5 h-5 text-success-600 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-navy">WhatsApp</p>
                <a 
                  :href="`https://wa.me/${listing.whatsapp_number.replace(/[^0-9]/g, '')}`" 
                  target="_blank"
                  class="text-xs text-success-600 hover:text-success-700"
                >
                  {{ listing.whatsapp_number }}
                </a>
              </div>
            </div>
            
            <div v-if="listing.contact_methods.includes('email') && listing.contact_email" class="flex items-center gap-3">
              <Mail class="w-5 h-5 text-navy flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium text-navy">Email</p>
                <a 
                  :href="`mailto:${listing.contact_email}`" 
                  class="text-xs text-navy hover:text-navy/80"
                >
                  {{ listing.contact_email }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- About the Seller Section -->
        <div class="card p-4 space-y-4">
          <h3 class="text-base font-bold text-navy">{{ $t('listings.about_advertiser') }}</h3>
          
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-grey-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User class="w-6 h-6 text-grey-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-navy">{{ listing.seller_name || $t('listings.anonymous') }}</p>
              <p class="text-xs text-grey-400">{{ sellerActiveDuration }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <FileText class="w-5 h-5 text-grey-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-navy">{{ $t('listings.all_ads') }}</p>
              <button
                @click="viewSellerListings"
                class="text-xs text-navy font-semibold mt-1"
              >
                {{ $t('listings.see_all_ads') }}
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-grey-100">
            <p class="text-xs text-grey-400 leading-relaxed">
              <span class="font-semibold">{{ $t('listings.important') }}:</span> {{ $t('listings.disclaimer_text') }}
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
          <div class="flex items-center justify-between p-4 border-b border-grey-100">
            <h3 class="text-base font-bold text-navy">{{ $t('listings.send_message') }}</h3>
            <button @click="showMessageSheet = false" class="p-2 hover:bg-grey-50 rounded-full transition-colors">
              <X class="w-5 h-5 text-grey-500" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="!customMessageMode" class="space-y-4">
              <button
                v-for="(template, index) in messageTemplates"
                :key="index"
                @click="sendTemplateMessage(template)"
                class="w-full text-left py-3 text-sm text-navy hover:text-navy/70 transition-colors"
              >
                {{ template }}
              </button>
              
              <button
                @click="customMessageMode = true"
                class="w-full text-left py-3 text-sm text-navy font-semibold hover:text-navy/70 transition-colors"
              >
                ✏️ {{ $t('listings.write_message_yourself') }}
              </button>
            </div>

            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-navy mb-2">{{ $t('listings.your_message') }}</label>
                <textarea
                  v-model="customMessage"
                  rows="4"
                  class="textarea"
                  :placeholder="$t('listings.type_message_placeholder')"
                ></textarea>
              </div>
              <button
                @click="sendCustomMessage"
                :disabled="!customMessage.trim() || sendingMessage"
                class="btn-cta disabled:bg-grey-300 disabled:cursor-not-allowed"
              >
                <span v-if="sendingMessage">{{ $t('listings.sending') }}</span>
                <span v-else>{{ $t('listings.send_message') }}</span>
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
          <div class="flex items-center justify-between p-4 border-b border-grey-100">
            <h3 class="text-base font-bold text-navy">{{ $t('listings.make_offer') }}</h3>
            <button @click="showOfferSheet = false" class="p-2 hover:bg-grey-50 rounded-full transition-colors">
              <X class="w-5 h-5 text-grey-500" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-navy mb-1">{{ $t('listings.your_offer') }} (FCA)</label>
              <input 
                v-model.number="offerPrice" 
                type="number" 
                :min="listing.min_offer_price" 
                class="input"
                :placeholder="$t('listings.enter_offer_placeholder')"
              />
              <p class="text-xs text-grey-400 mt-1">{{ $t('listings.minimum') }}: {{ formatPrice(listing.min_offer_price) }}</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-navy mb-2">{{ $t('listings.message_optional') }}</label>
              <textarea
                v-model="offerMessage"
                rows="4"
                class="textarea"
                :placeholder="$t('listings.add_message_to_offer_placeholder')"
              ></textarea>
            </div>

            <button
              @click="sendOffer"
              :disabled="!offerPrice || offerPrice < listing.min_offer_price || sendingOffer"
              class="btn-cta disabled:bg-grey-300 disabled:cursor-not-allowed"
            >
              <span v-if="sendingOffer">{{ $t('listings.sending_offer') }}</span>
              <span v-else>{{ $t('listings.send_offer') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error Dialog -->
    <Transition name="fade">
      <div v-if="showErrorDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showErrorDialog = false"></div>
        <div class="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-float">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-error-50 rounded-full flex items-center justify-center">
                <AlertCircle class="w-6 h-6 text-error-600" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-navy mb-2">{{ $t('common.error') }}</h3>
              <p class="text-sm text-grey-500 mb-4">{{ errorMessage }}</p>
              <button
                @click="showErrorDialog = false"
                class="btn-cta"
              >
                {{ $t('common.ok') }}
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
import { useI18n } from 'vue-i18n'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'
import { useCurrency } from '@/composables/useCurrency'
import { MapPin, Eye, Tag, Loader2, X, MessageCircle, Gavel, User, ChevronRight, FileText, Phone, Mail, AlertCircle, ArrowLeft, Heart, Share2 } from 'lucide-vue-next'
import apiService from '@/services/api'

const { t } = useI18n()

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
    t('listings.message_template_still_for_sale'),
    t('listings.message_template_buy_asking_price')
  ]
})

const currentImage = computed(() => {
  if (!listing.value?.images || listing.value.images.length === 0) return listing.value?.main_image
  return listing.value.images[currentImageIndex.value]?.image_url
})

const sellerActiveDuration = computed(() => {
  if (!sellerFirstListingDate.value) return t('listings.recently_active')
  
  const now = new Date()
  const firstDate = new Date(sellerFirstListingDate.value)
  const diffTime = Math.abs(now - firstDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return t('listings.today')
  if (diffDays === 1) return t('listings.one_day')
  if (diffDays < 30) return t('listings.days_active', { count: diffDays })
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return t('listings.months_active', { count: months })
  }
  const years = Math.floor(diffDays / 365)
  return years === 1 
    ? t('listings.years_active', { count: years })
    : t('listings.years_active_plural', { count: years })
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
    errorMessage.value = t('listings.please_enter_offer_price')
    showErrorDialog.value = true
    return
  }
  
  if (offerPrice.value < listing.value.min_offer_price) {
    errorMessage.value = t('listings.offer_at_least', { price: formatPrice(listing.value.min_offer_price) })
    showErrorDialog.value = true
    return
  }

  sendingOffer.value = true
  try {
    // Create inquiry with offer
    const inquiryData = {
      listing: listing.value.id,
      message: offerMessage.value || t('listings.like_to_buy_for', { price: formatPrice(offerPrice.value) }),
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
  // Extract seller ID (can be object or ID)
  const sellerId = typeof listing.value.seller === 'object' 
    ? listing.value.seller?.id 
    : listing.value.seller
  
  if (!sellerId) {
    console.error('Cannot get seller ID from listing')
    return
  }
  
  // Store seller ID in sessionStorage to filter on Explore page
  sessionStorage.setItem('filterBySeller', sellerId)
  sessionStorage.setItem('filterBySellerType', 'shopper_listing') // Mark as shopper listing filter
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
  const listingTitle = listing.value.title || t('listings.check_out_listing')
  const shareText = `${listingTitle}\n\n${listingUrl}`
  
  // Encode the message for WhatsApp
  const encodedText = encodeURIComponent(shareText)
  const whatsappUrl = `https://wa.me/?text=${encodedText}`
  
  // Open WhatsApp in a new window/tab
  window.open(whatsappUrl, '_blank')
}
</script>

<style scoped>
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
