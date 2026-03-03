<template>
  <div class="page-container pb-24">
    <!-- Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-3 z-40">
      <div class="flex items-center">
        <button @click="router.back()" class="w-10 h-10 rounded-2xl bg-grey-100 flex items-center justify-center mr-3">
          <ArrowLeft class="w-5 h-5 text-navy" />
        </button>
        <h1 class="text-xl font-bold text-navy">{{ $t('booking.confirmation_title') }}</h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-navy"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="px-4 pt-8">
      <div class="card bg-red-50 p-6 text-center">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-red-700 font-medium">{{ error }}</p>
        <button @click="fetchBooking" class="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-2xl text-sm font-medium">
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Booking Details -->
    <div v-else-if="booking" class="px-4 pt-6 space-y-6">
      <!-- Success Banner -->
      <div class="card p-6 text-center">
        <div class="w-20 h-20 bg-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-navy mb-2">{{ $t('booking.booking_submitted') }}</h2>
        <p class="text-grey-500">{{ $t('booking.confirmation_message') }}</p>
        <div class="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="statusClasses">
          {{ displayStatusLabel }}
        </div>
      </div>

      <!-- Booking Reference -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-3">{{ $t('booking.reference') }}</h3>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-navy">{{ booking.booking_reference || `#${booking.id}` }}</span>
          <span class="text-sm text-grey-500">{{ formatDate(booking.created_at) }}</span>
        </div>
      </div>

      <!-- Property Info -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-3">{{ $t('booking.property') }}</h3>
        <div class="flex items-start space-x-4">
          <img
            v-if="bookingPropertyImage"
            :src="bookingPropertyImage"
            :alt="bookingPropertyName"
            class="w-20 h-20 rounded-2xl object-cover"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-navy truncate">{{ bookingPropertyName }}</p>
            <p v-if="booking.product_details?.location || booking.product_details?.address" class="text-sm text-grey-500 mt-1 flex items-center">
              <MapPin class="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              {{ booking.product_details?.location || booking.product_details?.address }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stay Details -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-4">{{ $t('booking.stay_details') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-grey-500 font-medium">{{ $t('booking.check_in') }}</p>
            <p class="text-sm font-semibold text-navy mt-1">{{ formatDate(booking.check_in) }}</p>
          </div>
          <div>
            <p class="text-xs text-grey-500 font-medium">{{ $t('booking.check_out') }}</p>
            <p class="text-sm font-semibold text-navy mt-1">{{ formatDate(booking.check_out) }}</p>
          </div>
          <div>
            <p class="text-xs text-grey-500 font-medium">{{ $t('booking.duration') }}</p>
            <p class="text-sm font-semibold text-navy mt-1">{{ booking.total_nights || calculateNights() }} {{ $t('booking.nights') }}</p>
          </div>
          <div>
            <p class="text-xs text-grey-500 font-medium">{{ $t('booking.guests') }}</p>
            <p class="text-sm font-semibold text-navy mt-1">{{ booking.num_guests }} {{ $t('booking.guest_label') }}</p>
          </div>
        </div>
      </div>

      <!-- Récapitulatif des coûts (saved at booking creation) -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-4">{{ $t('booking.cost_summary') }}</h3>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-grey-500">{{ $t('booking.subtotal') }}</span>
            <span class="font-medium text-navy">{{ formatCurrency(booking.subtotal ?? 0) }} {{ bookingCurrency }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-grey-500">{{ $t('booking.deposit') }}</span>
            <span class="font-medium text-navy">{{ formatCurrency(booking.deposit_amount ?? 0) }} {{ bookingCurrency }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-grey-500">{{ $t('booking.platform_fee') }}</span>
            <span class="font-medium text-navy">{{ formatCurrency(booking.platform_fee ?? 0) }} {{ bookingCurrency }}</span>
          </div>
          <div class="border-t border-grey-200 pt-3 flex justify-between">
            <span class="font-semibold text-navy">{{ $t('booking.total') }}</span>
            <span class="font-bold text-lg text-navy">{{ formatCurrency(bookingTotal) }} {{ bookingCurrency }}</span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-navy">
            <span>{{ $t('booking.already_paid') }}</span>
            <span>{{ formatCurrency(bookingAlreadyPaid) }} {{ bookingCurrency }}</span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-navy">
            <span>{{ $t('booking.pay_after_key_given') }}</span>
            <span>{{ formatCurrency(bookingRestToPay) }} {{ bookingCurrency }}</span>
          </div>
        </div>
      </div>

      <!-- Special Requests -->
      <div v-if="booking.special_requests" class="card p-5">
        <h3 class="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-3">{{ $t('booking.special_requests') }}</h3>
        <p class="text-sm text-grey-400">{{ booking.special_requests }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3 pb-6">
        <button
          @click="router.push({ name: 'MyBookings' })"
          class="btn-cta"
        >
          {{ $t('booking.view_all_bookings') }}
        </button>
        <button
          v-if="bookingStatusForActions === 'pending_confirmation'"
          @click="showCancelDialog = true"
          class="w-full py-3.5 bg-white border border-red-200 text-red-600 rounded-2xl font-semibold text-base"
        >
          {{ $t('booking.cancel_booking') }}
        </button>
        <button
          @click="router.push({ name: 'Home' })"
          class="w-full py-3.5 bg-grey-100 text-grey-500 rounded-2xl font-semibold text-base"
        >
          {{ $t('booking.back_to_home') }}
        </button>
      </div>
    </div>

    <!-- Cancel Dialog -->
    <div v-if="showCancelDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-float">
        <h3 class="text-lg font-bold text-navy mb-2">{{ $t('booking.cancel_confirm_title') }}</h3>
        <p class="text-sm text-grey-500 mb-2">{{ $t('booking.cancel_confirm_message') }}</p>
        <p class="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
          {{ $t('booking.cancel_reservation_fee_no_refund') }}
        </p>
        <textarea
          v-model="cancelReason"
          :placeholder="$t('booking.cancel_reason_placeholder')"
          class="textarea w-full p-3 text-sm mb-4 resize-none"
          rows="3"
        ></textarea>
        <div class="flex space-x-3">
          <button
            @click="showCancelDialog = false"
            class="btn btn-outlined flex-1 py-2.5 text-sm"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="handleCancelBooking"
            :disabled="cancelling"
            class="flex-1 py-2.5 bg-error-600 text-white rounded-2xl font-medium text-sm disabled:opacity-50"
          >
            {{ cancelling ? $t('common.loading') : $t('booking.confirm_cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <div v-if="showSnackbar" class="fixed bottom-20 left-4 right-4 z-50">
      <div :class="['rounded-2xl p-4 shadow-float text-white text-sm font-medium text-center', snackbarColor === 'success' ? 'bg-success-600' : 'bg-error-600']">
        {{ snackbarText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, CheckCircle, AlertCircle, MapPin } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const booking = ref(null)
const loading = ref(true)
const error = ref(null)
const showCancelDialog = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Backend uses 'pending'; frontend i18n uses 'pending_confirmation'
const normalizedStatus = computed(() => {
  const s = booking.value?.status
  return s === 'pending' ? 'pending_confirmation' : s
})

const statusClasses = computed(() => {
  const map = {
    pending_confirmation: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    checked_in: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[normalizedStatus.value] || 'bg-gray-100 text-gray-800'
})

const displayStatusLabel = computed(() => {
  return t(`booking.status_${normalizedStatus.value}`) || booking.value?.status
})

const bookingStatusForActions = computed(() => normalizedStatus.value)

const bookingPropertyName = computed(() => {
  const b = booking.value
  return b?.property_name || b?.product_details?.name || b?.product_name || ''
})

const bookingPropertyImage = computed(() => {
  const b = booking.value
  return b?.property_image || b?.product_details?.primary_image || b?.product_details?.images?.[0] || null
})

const bookingRestToPay = computed(() => {
  const b = booking.value
  if (b == null) return 0
  const sub = Number(b.subtotal ?? 0)
  const dep = Number(b.deposit_amount ?? 0)
  const plat = Number(b.platform_fee ?? 0)
  return sub + dep + plat
})

const bookingAlreadyPaid = computed(() => {
  const b = booking.value
  return Number(b?.reservation_fee ?? 0)
})

const bookingTotal = computed(() => {
  return bookingRestToPay.value + bookingAlreadyPaid.value
})

const bookingCurrency = computed(() => {
  return booking.value?.currency || 'XOF'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('fr-FR').format(amount)
}

const calculateNights = () => {
  if (!booking.value?.check_in || !booking.value?.check_out) return 0
  const checkIn = new Date(booking.value.check_in)
  const checkOut = new Date(booking.value.check_out)
  return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
}

const fetchBooking = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiService.getBookingDetail(route.params.id)
    booking.value = response.data
  } catch (err) {
    console.error('Error fetching booking:', err)
    error.value = err.response?.data?.detail || t('booking.error_loading')
  } finally {
    loading.value = false
  }
}

const handleCancelBooking = async () => {
  cancelling.value = true
  try {
    await apiService.cancelBooking(booking.value.id, { reason: cancelReason.value })
    showCancelDialog.value = false
    booking.value.status = 'cancelled'
    snackbarText.value = t('booking.cancelled_success')
    snackbarColor.value = 'success'
    showSnackbar.value = true
    setTimeout(() => { showSnackbar.value = false }, 3000)
  } catch (err) {
    console.error('Error cancelling booking:', err)
    snackbarText.value = err.response?.data?.detail || t('booking.cancel_error')
    snackbarColor.value = 'error'
    showSnackbar.value = true
    setTimeout(() => { showSnackbar.value = false }, 3000)
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  fetchBooking()
})
</script>
