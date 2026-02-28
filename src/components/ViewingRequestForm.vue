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
      <div class="sticky top-0 bg-white rounded-t-3xl border-b border-grey-100 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-grey-900">{{ $t('viewing_request_form.title') }}</h2>
          <button 
            @click="closeForm"
            class="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center hover:bg-grey-200 transition-colors"
          >
            <X class="w-5 h-5 text-grey-500" />
          </button>
        </div>
        <p class="text-sm text-grey-600 mt-1">{{ $t('viewing_request_form.schedule_for', { type: productType || $t('viewing_request_form.item') }) }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitRequest" class="p-6 space-y-6">
        <!-- Product Info -->
        <div class="bg-grey-50 rounded-2xl p-4">
          <div class="flex items-center space-x-3">
            <img 
              :src="product.main_image || '/placeholder.jpg'" 
              :alt="product.name"
              class="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 class="font-semibold text-grey-900">{{ product.name }}</h3>
              <p class="text-sm text-grey-500">{{ product.store_name }}</p>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="space-y-4">
          <h3 class="font-semibold text-grey-900">{{ $t('viewing_request_form.your_information') }}</h3>
          
          <div>
            <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.full_name') }}</label>
            <input
              v-model="form.customer_name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
              :placeholder="$t('viewing_request_form.full_name_placeholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.phone_number') }}</label>
            <input
              v-model="form.customer_phone"
              type="tel"
              required
              class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
              :placeholder="$t('viewing_request_form.phone_placeholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.email_address') }}</label>
            <input
              v-model="form.customer_email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
              :placeholder="$t('viewing_request_form.email_placeholder')"
            />
          </div>
        </div>

        <!-- Viewing Preferences -->
        <div class="space-y-4">
          <h3 class="font-semibold text-grey-900">{{ $t('viewing_request_form.viewing_preferences') }}</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.preferred_date') }}</label>
              <input
                ref="dateInputRef"
                v-model="form.preferred_date"
                type="date"
                :min="minDate"
                required
                class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
                @click="openDatePicker"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.preferred_time') }}</label>
              <select
                v-model="form.preferred_time"
                required
                class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
              >
                <option value="">{{ $t('viewing_request_form.select_time') }}</option>
                <option value="09:00">{{ $t('viewing_request_form.time_09') }}</option>
                <option value="10:00">{{ $t('viewing_request_form.time_10') }}</option>
                <option value="11:00">{{ $t('viewing_request_form.time_11') }}</option>
                <option value="12:00">{{ $t('viewing_request_form.time_12') }}</option>
                <option value="13:00">{{ $t('viewing_request_form.time_13') }}</option>
                <option value="14:00">{{ $t('viewing_request_form.time_14') }}</option>
                <option value="15:00">{{ $t('viewing_request_form.time_15') }}</option>
                <option value="16:00">{{ $t('viewing_request_form.time_16') }}</option>
                <option value="17:00">{{ $t('viewing_request_form.time_17') }}</option>
                <option value="18:00">{{ $t('viewing_request_form.time_18') }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-grey-700 mb-2">{{ $t('viewing_request_form.additional_message') }}</label>
            <textarea
              v-model="form.message"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-grey-200 focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all resize-none"
              :placeholder="$t('viewing_request_form.message_placeholder')"
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
          class="w-full py-4 bg-navy text-white font-semibold rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Calendar v-if="!submitting" class="w-5 h-5 mr-2" />
          <div v-else class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ submitting ? $t('viewing_request_form.submitting') : $t('viewing_request_form.submit_button') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, AlertCircle, Calendar } from 'lucide-vue-next'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()

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
const dateInputRef = ref(null)

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

const openDatePicker = () => {
  nextTick(() => {
    const el = dateInputRef.value
    if (el && typeof el.showPicker === 'function') {
      el.showPicker()
    }
  })
}

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
      message: t('viewing_request_form.success_message'),
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
      error.value = t('viewing_request_form.error_submit')
    }

    emit('error', error.value)
  } finally {
    submitting.value = false
  }
}
</script>
