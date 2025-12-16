<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
    <BackButtonHeader :title="$t('listings.create_listing')" />

    <div class="p-4">
      <form @submit.prevent="submit" class="space-y-4">
        <!-- Images -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">{{ $t('listings.photos_max') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="(img, i) in images" :key="i" class="aspect-square bg-gray-200 rounded-lg relative overflow-hidden">
              <img :src="img.preview" class="w-full h-full object-cover" />
              <button @click="removeImage(i)" type="button" class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>
            <label v-if="images.length < 2" class="aspect-square bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
              <input type="file" @change="addImage" accept="image/*" class="hidden" />
              <div class="text-center">
                <Plus class="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <span class="text-xs text-gray-500">{{ $t('listings.add_photo') }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Title -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model="form.title"
              type="text"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('listings.title_placeholder')"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute top-3 left-3 pointer-events-none">
              <FileText class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <textarea
              v-model="form.description"
              required
              rows="4"
              class="textarea pl-10 pr-3 py-3 h-24 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              :placeholder="$t('listings.description_placeholder')"
            ></textarea>
          </div>
        </div>

        <!-- Category -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <select
              v-model="form.category"
              class="select pl-10 pr-8 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ $t('listings.select_category') }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <!-- Price Type -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">{{ $t('listings.price_type') }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="form.price_type = 'fixed'"
              :class="form.price_type === 'fixed' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              {{ $t('listings.fixed') }}
            </button>
            <button
              type="button"
              @click="form.price_type = 'offer'"
              :class="form.price_type === 'offer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              {{ $t('listings.offer') }}
            </button>
            <button
              type="button"
              @click="form.price_type = 'free'"
              :class="form.price_type === 'free' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              {{ $t('listings.free') }}
            </button>
          </div>
        </div>

        <!-- Price -->
        <div v-if="form.price_type === 'fixed'" class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model.number="form.price"
              type="number"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('listings.price_placeholder')"
            />
          </div>
        </div>

        <!-- Min Offer Price -->
        <div v-if="form.price_type === 'offer'" class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model.number="form.min_offer_price"
              type="number"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('listings.min_offer_placeholder')"
            />
          </div>
        </div>

        <!-- City and Neighborhood -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">{{ $t('listings.location') }}</label>
          <div class="grid grid-cols-2 gap-2">
            <!-- City -->
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                v-model="form.city"
                type="text"
                required
                class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('listings.city_placeholder')"
              />
            </div>
            <!-- Neighborhood -->
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                v-model="form.neighborhood"
                type="text"
                class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="$t('listings.neighborhood_placeholder')"
              />
            </div>
          </div>
        </div>

        <!-- Contact Methods -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">Contact Methods *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="toggleContactMethod('in_app')"
              :class="form.contact_methods.includes('in_app') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-1"
            >
              <MessageCircle class="w-3.5 h-3.5" />
              <span>In-App</span>
            </button>
            <button
              type="button"
              @click="toggleContactMethod('whatsapp')"
              :class="form.contact_methods.includes('whatsapp') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-1"
            >
              <Phone class="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              @click="toggleContactMethod('email')"
              :class="form.contact_methods.includes('email') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'"
              class="px-2 py-3 border-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-1"
            >
              <Mail class="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>
        </div>

        <!-- WhatsApp Number -->
        <div v-if="form.contact_methods.includes('whatsapp')" class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model="form.whatsapp_number"
              type="tel"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('listings.whatsapp_placeholder')"
            />
          </div>
        </div>

        <!-- Contact Email -->
        <div v-if="form.contact_methods.includes('email')" class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              v-model="form.contact_email"
              type="email"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('listings.email_placeholder')"
            />
          </div>
        </div>
      </form>
    </div>

    <!-- Fixed Submit Button -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-4">
      <button
        type="button"
        @click="submit"
        :disabled="loading || !isFormValid"
        class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
        style="background: linear-gradient(to right, #2563eb, #9333ea);"
      >
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin mr-2" />
        <span>{{ loading ? 'Creating...' : 'Create Listing' }}</span>
      </button>
    </div>

    <!-- Dialog -->
    <Transition name="dialog">
      <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDialog"></div>
        <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-center justify-center mb-4">
              <div :class="dialogType === 'error' ? 'bg-red-100' : dialogType === 'success' ? 'bg-green-100' : 'bg-blue-100'" class="w-16 h-16 rounded-full flex items-center justify-center">
                <AlertCircle v-if="dialogType === 'error'" class="w-8 h-8 text-red-600" />
                <CheckCircle v-else-if="dialogType === 'success'" class="w-8 h-8 text-green-600" />
                <Info v-else class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-center text-slate-900 mb-2">{{ dialogTitle }}</h3>
            <p class="text-center text-slate-600 text-sm leading-relaxed">{{ dialogMessage }}</p>
            <div v-if="sellerPortalUrl" class="mt-4 text-center">
              <a 
                :href="sellerPortalUrl" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Visit Seller Platform →
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-4">
            <button
              @click="closeDialog"
              :class="dialogType === 'error' ? 'bg-red-600 hover:bg-red-700' : dialogType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'"
              class="w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {{ dialogType === 'success' ? 'OK' : 'Got it' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { Plus, X, Loader2, FileText, Tag, DollarSign, MapPin, MessageCircle, Phone, Mail, AlertCircle, CheckCircle, Info } from 'lucide-vue-next'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import apiService from '@/services/api'

const router = useRouter()
const listingStore = useListingStore()

const loading = ref(false)
const categories = ref([])
const images = ref([])
const showDialog = ref(false)
const dialogType = ref('info') // 'info', 'error', 'success'
const dialogTitle = ref('')
const dialogMessage = ref('')
const sellerPortalUrl = ref('')
const form = ref({
  title: '',
  description: '',
  category: '',
  price_type: 'fixed',
  price: null,
  min_offer_price: null,
  city: '',
  neighborhood: '',
  contact_methods: ['in_app'],
  whatsapp_number: '',
  contact_email: '',
  is_anonymous: false
})

onMounted(async () => {
  try {
    const response = await apiService.getCategories()
    categories.value = response.data.results || response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})

function addImage(e) {
  const file = e.target.files[0]
  if (file && images.value.length < 2) {
    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push({ file, preview: e.target.result })
    }
    reader.readAsDataURL(file)
  }
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function toggleContactMethod(method) {
  const index = form.value.contact_methods.indexOf(method)
  if (index > -1) {
    // Don't allow removing if it's the only method
    if (form.value.contact_methods.length > 1) {
      form.value.contact_methods.splice(index, 1)
    }
  } else {
    form.value.contact_methods.push(method)
  }
}

const isFormValid = computed(() => {
  // Check if images are added
  if (images.value.length === 0) return false
  
  // Check if at least one contact method is selected
  if (form.value.contact_methods.length === 0) return false
  
  // Check if WhatsApp is selected, then WhatsApp number is required
  if (form.value.contact_methods.includes('whatsapp') && !form.value.whatsapp_number?.trim()) {
    return false
  }
  
  // Check if Email is selected, then email is required
  if (form.value.contact_methods.includes('email') && !form.value.contact_email?.trim()) {
    return false
  }
  
  return true
})

function showErrorDialog(title, message, portalUrl = '') {
  dialogType.value = 'error'
  dialogTitle.value = title
  dialogMessage.value = message
  sellerPortalUrl.value = portalUrl
  showDialog.value = true
}

function showSuccessDialog(title, message) {
  dialogType.value = 'success'
  dialogTitle.value = title
  dialogMessage.value = message
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  sellerPortalUrl.value = ''
  if (dialogType.value === 'success') {
    router.push('/my-listings')
  }
}

async function submit() {
  // Check listing limit first before any other validation
  loading.value = true
  try {
    const stats = await listingStore.fetchListingStats()
    const maxListings = stats?.max_listings || 5
    // Count non-sold listings (active + inactive, but not sold)
    const nonSoldListings = (stats?.total_listings || 0) - (stats?.sold_listings || 0)
    
    if (nonSoldListings >= maxListings) {
      const sellerPortalUrl = 'https://seller.afriqxpress.com/' // Default URL
      const errorMessage = `You have reached the maximum limit of ${maxListings} listings. If you want to post more listings, please use our seller platform.`
      showErrorDialog('Listing Limit Reached', errorMessage, sellerPortalUrl)
      loading.value = false
      return
    }
  } catch (error) {
    console.error('Failed to check listing stats:', error)
    // Continue with form submission if stats check fails (backend will also validate)
  }
  loading.value = false

  if (images.value.length === 0) {
    showErrorDialog('Missing Photos', 'Please add at least one photo to your listing.')
    return
  }

  if (form.value.contact_methods.length === 0) {
    showErrorDialog('Contact Method Required', 'Please select at least one contact method.')
    return
  }

  // Validate WhatsApp number if WhatsApp is selected
  if (form.value.contact_methods.includes('whatsapp') && !form.value.whatsapp_number?.trim()) {
    showErrorDialog('WhatsApp Number Required', 'Please provide your WhatsApp number since you selected WhatsApp as a contact method.')
    return
  }

  // Validate email if Email is selected
  if (form.value.contact_methods.includes('email') && !form.value.contact_email?.trim()) {
    showErrorDialog('Contact Email Required', 'Please provide your contact email since you selected Email as a contact method.')
    return
  }

  loading.value = true
  try {
    const data = {
      ...form.value,
      images: images.value.map(img => img.file),
      image_orders: images.value.map((_, i) => i)
    }
    
    await listingStore.createListing(data)
    showSuccessDialog('Success!', 'Your listing has been created successfully.')
  } catch (error) {
    // Check if this is a limit reached error
    const errorData = error.response?.data
    if (errorData?.limit_reached || errorData?.non_field_errors) {
      const errorMessage = Array.isArray(errorData.non_field_errors) 
        ? errorData.non_field_errors[0] 
        : errorData.non_field_errors || 'You have reached the maximum limit of listings.'
      const portalUrl = errorData.seller_portal_url || ''
      showErrorDialog('Listing Limit Reached', errorMessage, portalUrl)
    } else {
      const errorMessage = errorData?.message || errorData?.detail || 'Failed to create listing. Please try again.'
      showErrorDialog('Error', errorMessage)
    }
  } finally {
    loading.value = false
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
