<template>
  <div 
    v-if="showForm" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="handleOverlayClick"
  >
    <div 
      class="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Request Viewing</h2>
          <button 
            @click="closeForm"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p class="text-sm text-gray-600 mt-1">Schedule a viewing for this {{ productType || 'item' }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitRequest" class="p-6 space-y-6">
        <!-- Product Info -->
        <div class="bg-gray-50 rounded-2xl p-4">
          <div class="flex items-center space-x-3">
            <img 
              :src="product.main_image || '/placeholder.jpg'" 
              :alt="product.name"
              class="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 class="font-semibold text-gray-900">{{ product.name }}</h3>
              <p class="text-sm text-gray-500">{{ product.store_name }}</p>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900">Your Information</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              v-model="form.customer_name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              v-model="form.customer_phone"
              type="tel"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="+229 XX XX XX XX"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              v-model="form.customer_email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <!-- Viewing Preferences -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900">Viewing Preferences</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
              <input
                v-model="form.preferred_date"
                type="date"
                :min="minDate"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
              <select
                v-model="form.preferred_time"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
            <textarea
              v-model="form.message"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              placeholder="Any specific requirements or questions about the viewing..."
            ></textarea>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-center">
            <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
            <span class="text-red-700 text-sm">{{ error }}</span>
          </div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <Calendar v-if="!submitting" class="w-5 h-5 mr-2" />
          <div v-else class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ submitting ? 'Submitting Request...' : 'Request Viewing' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { X, AlertCircle, Calendar } from 'lucide-vue-next'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  showForm: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    required: true
  },
  productType: {
    type: String,
    default: 'item'
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const authStore = useAuthStore()

const form = ref({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  preferred_date: '',
  preferred_time: '',
  message: ''
})

const submitting = ref(false)
const error = ref('')

// Computed minimum date (tomorrow)
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Initialize form with user data if available
onMounted(() => {
  if (authStore.user) {
    form.value.customer_name = `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim()
    form.value.customer_email = authStore.user.email || ''
    form.value.customer_phone = authStore.user.phone || ''
  }
})

const closeForm = () => {
  emit('close')
  resetForm()
}

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeForm()
  }
}

const resetForm = () => {
  error.value = ''
  submitting.value = false
  // Don't reset personal info as user might want to keep it
}

const submitRequest = async () => {
  if (submitting.value) return

  try {
    submitting.value = true
    error.value = ''

    const requestData = {
      product: props.product.id,
      customer_name: form.value.customer_name,
      customer_phone: form.value.customer_phone,
      customer_email: form.value.customer_email,
      preferred_date: form.value.preferred_date,
      preferred_time: form.value.preferred_time,
      message: form.value.message
    }

    await apiService.createViewingRequest(requestData)

    emit('success', {
      message: 'Your viewing request has been sent to the seller. They will contact you to confirm the details.',
      productName: props.product.name
    })

    closeForm()

  } catch (err) {
    console.error('Failed to submit viewing request:', err)
    
    if (err.response?.data) {
      // Handle validation errors
      const errorData = err.response.data
      if (typeof errorData === 'object') {
        const errorMessages = []
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages)
          } else {
            errorMessages.push(messages)
          }
        }
        error.value = errorMessages.join(', ')
      } else {
        error.value = errorData
      }
    } else {
      error.value = 'Failed to submit viewing request. Please try again.'
    }

    emit('error', error.value)
  } finally {
    submitting.value = false
  }
}
</script>
