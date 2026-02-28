<template>
  <div class="page-container pb-8">
    <!-- Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md px-5 py-3 z-40">
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="w-10 h-10 rounded-2xl bg-grey-50 flex items-center justify-center hover:bg-grey-100 transition-colors">
          <ArrowLeft class="w-5 h-5 text-navy" />
        </button>
        <h1 class="text-base font-bold text-navy">{{ $t('product.book_stay') }}</h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !product" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-navy border-t-transparent"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="px-5 pt-8">
      <div class="card p-6 text-center">
        <div class="w-14 h-14 rounded-3xl bg-error-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-6 h-6 text-error-500" />
        </div>
        <p class="text-error-700 font-medium text-sm mb-4">{{ error }}</p>
        <button @click="loadProduct" class="btn btn-outlined text-sm">
          {{ $t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Booking form -->
    <div v-else-if="product" class="px-5 pt-5 space-y-5">
      <!-- Property summary -->
      <div class="card p-4 flex gap-4">
        <img
          :src="product.main_image || product.image_1"
          :alt="product.name"
          class="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
        />
        <div class="min-w-0 flex-1">
          <h2 class="font-bold text-navy truncate text-sm capitalize">{{ product.name }}</h2>
          <p class="text-lg font-bold text-navy mt-1">
            {{ product.formatted_price || (product.price != null && product.price !== '' ? formatApiPrice(product) : '—') }}
          </p>
          <p v-if="product.property_meta?.price_unit" class="text-xs text-grey-400">
            {{ product.property_meta.price_unit === 'month' ? $t('product.per_month') : $t('product.per_night') }}
          </p>
        </div>
      </div>

      <!-- Check-in / Check-out -->
      <div class="card p-5 space-y-4">
        <h3 class="font-bold text-navy text-sm">{{ $t('product.booking_title') }}</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.check_in') }}</label>
            <input
              ref="checkInInputRef"
              v-model="checkIn"
              type="date"
              :min="checkInMin"
              :max="checkInMax"
              class="input text-sm w-full"
              @click="openDatePicker('checkIn')"
              @change="onCheckInChange"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.check_out') }}</label>
            <input
              ref="checkOutInputRef"
              v-model="checkOut"
              type="date"
              :min="checkOutMin"
              :max="checkOutMax"
              class="input text-sm w-full"
              @click="openDatePicker('checkOut')"
              @change="onCheckOutChange"
            />
          </div>
        </div>

        <!-- Guests -->
        <div>
          <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.num_guests') }}</label>
          <div class="flex items-center bg-grey-50 rounded-2xl p-1 w-36">
            <button @click="numGuests = Math.max(1, numGuests - 1)" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">-</button>
            <span class="flex-1 text-center font-bold text-navy">{{ numGuests }}</span>
            <button @click="numGuests = Math.min(maxGuests || 99, numGuests + 1)" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">+</button>
          </div>
          <p v-if="maxGuests" class="text-xs text-grey-400 mt-1">{{ $t('product.max_guests') }}: {{ maxGuests }}</p>
        </div>
      </div>

      <!-- Price breakdown -->
      <div v-if="bookingPrice" class="card p-5 space-y-3">
        <h3 class="font-bold text-navy text-sm">{{ $t('booking.price_breakdown') }}</h3>
        <div class="flex justify-between text-sm text-grey-500">
          <span>{{ bookingPrice.nights }} {{ $t('product.nights') }} x {{ formatCurrency(bookingPrice.price_per_night) }}</span>
          <span>{{ formatCurrency(bookingPrice.subtotal ?? bookingPrice.total) }}</span>
        </div>
        <div v-if="(Number(bookingPrice.deposit_amount) || 0) > 0" class="flex justify-between text-sm text-grey-500">
          <span>{{ $t('booking.deposit') }}</span>
          <span>{{ formatCurrency(bookingPrice.deposit_amount) }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-500">
          <span>{{ $t('product.platform_fee') }}</span>
          <span>{{ formatCurrency(bookingPrice.platform_fee) }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-500">
          <span>{{ $t('booking.reservation_fee') }}</span>
          <span>{{ formatCurrency(reservationFeeAmount ?? 0) }}</span>
        </div>
        <div class="border-t border-grey-100 pt-3 flex justify-between font-bold text-navy">
          <span>{{ $t('booking.total') }}</span>
          <span>{{ formatCurrency(bookingPrice.total) }} {{ bookingPrice.currency || 'XOF' }}</span>
        </div>
      </div>
      <div v-if="calculating" class="flex items-center justify-center py-4">
        <div class="animate-spin h-6 w-6 border-2 border-navy border-t-transparent rounded-full"></div>
      </div>

      <!-- Special requests -->
      <div class="card p-5">
        <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.special_requests') }}</label>
        <textarea
          v-model="specialRequests"
          rows="3"
          class="textarea text-sm"
          :placeholder="$t('product.special_requests_placeholder')"
        ></textarea>
      </div>

      <!-- Cost summary (caution, reservation fee, total, rest to pay) -->
      <div class="card p-5 space-y-3">
        <h3 class="font-bold text-navy text-sm">{{ $t('booking.cost_summary') }}</h3>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('booking.deposit') }}</span>
          <span>{{ formatCurrency(summaryDeposit) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('booking.reservation_fee') }}</span>
          <span>{{ formatCurrency(summaryReservationFee) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('booking.total') }}</span>
          <span>{{ formatCurrency(summaryTotal) }} {{ summaryCurrency }}</span>
        </div>
        <div class="border-t border-grey-200 pt-3 flex justify-between font-semibold text-navy">
          <span>{{ $t('booking.rest_to_pay_at_handover') }}</span>
          <span>{{ formatCurrency(restToPayAmount ?? 0) }} {{ summaryCurrency }}</span>
        </div>
      </div>

      <p class="text-xs text-grey-500 leading-relaxed">
        {{ reservationFeeExplanationText }}
      </p>

      <!-- Spacer so fixed button does not overlap content -->
      <div class="h-28" />
    </div>

    <!-- Fixed bottom: Réserver maintenant -->
    <div
      v-if="product && !loading"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-100 px-5 py-4 z-30 safe-area-pb"
    >
      <button
        @click="submitBooking"
        :disabled="!bookingPrice || submitting"
        class="btn-cta w-full bg-success-600 hover:bg-success-700 disabled:opacity-50 py-4"
      >
        <span v-if="submitting">{{ $t('product.processing') }}...</span>
        <span v-else>{{ $t('product.book_now') }} — {{ (reservationFeeAmount ?? productReservationFee) != null ? formatCurrency(reservationFeeAmount ?? productReservationFee) : '—' }} {{ bookingPrice?.currency || product?.currency_info?.currency_code || 'XOF' }}</span>
      </button>
    </div>

    <!-- Snackbar -->
    <Transition name="dialog">
      <div v-if="snackbar" class="fixed bottom-24 left-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-card-hover text-white text-sm font-medium text-center" :class="snackbarError ? 'bg-error-600' : 'bg-success-600'">
        {{ snackbar }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores/product'
import { useCurrency } from '@/composables/useCurrency'
import apiService from '@/services/api'
import { ArrowLeft, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const productStore = useProductStore()
const { formatApiPrice } = useCurrency()

const loading = ref(true)
const error = ref(null)
const product = computed(() => productStore.currentProduct)
const todayStr = new Date().toISOString().slice(0, 10)

const checkInInputRef = ref(null)
const checkOutInputRef = ref(null)
const checkIn = ref('')
const checkOut = ref('')
/** Set of date strings (YYYY-MM-DD) that are unavailable (booked/blocked) from availability API */
const unavailableDates = ref(new Set())
const numGuests = ref(1)
const specialRequests = ref('')
const bookingPrice = ref(null)
const calculating = ref(false)
const submitting = ref(false)
const snackbar = ref('')
const snackbarError = ref(false)

const maxGuests = computed(() => {
  const n = product.value?.property_meta?.max_guests
  return n != null ? parseInt(n, 10) : null
})

// Date range from product (property_meta.available_from / available_to) for date picker min/max
function toDateStr (raw) {
  if (raw == null) return null
  const s = typeof raw === 'string' ? raw : (raw?.date ? raw.date : String(raw))
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}
const availableFromStr = computed(() => toDateStr(product.value?.property_meta?.available_from))
const availableToStr = computed(() => toDateStr(product.value?.property_meta?.available_to))
const checkInMin = computed(() => {
  const from = availableFromStr.value
  if (!from) return todayStr
  return from >= todayStr ? from : todayStr
})
const checkInMax = computed(() => availableToStr.value)
const checkOutMin = computed(() => {
  const ci = checkIn.value
  const from = availableFromStr.value
  if (ci) return ci
  if (from && from >= todayStr) return from
  return todayStr
})
const checkOutMax = computed(() => availableToStr.value)

function openDatePicker (field) {
  const el = field === 'checkIn' ? checkInInputRef.value : checkOutInputRef.value
  if (el && typeof el.showPicker === 'function') {
    try {
      el.showPicker()
    } catch (_) { /* ignore NotAllowedError if not user gesture */ }
  }
}

// From product API (GET /api/products/products/:id/): price, deposit_amount, reservation_fee
const productPrice = computed(() => {
  const p = product.value
  if (!p) return null
  const raw = p.price
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) || n < 0 ? null : Math.round(n)
})

const productDepositAmount = computed(() => {
  const p = product.value
  if (!p?.property_meta) return null
  const raw = p.property_meta.deposit_amount
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) || n < 0 ? null : Math.round(n)
})

const productReservationFee = computed(() => {
  const p = product.value
  if (!p) return null
  const raw = p.reservation_fee
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) || n < 0 ? null : Math.round(n)
})

// Total rest to pay from product API: (price + deposit_amount) − reservation_fee
const restToPayFromProduct = computed(() => {
  const price = productPrice.value ?? 0
  const deposit = productDepositAmount.value ?? 0
  const fee = productReservationFee.value ?? 0
  const hasAny = productPrice.value != null || productDepositAmount.value != null || productReservationFee.value != null
  if (!hasAny) return null
  return Math.round(price + deposit - fee)
})

// Reservation fee for button/breakdown: from product API, or 10% of booking subtotal when no product fee
const reservationFeeAmount = computed(() => {
  if (productReservationFee.value != null) return productReservationFee.value
  const bp = bookingPrice.value
  if (!bp) return null
  const subtotal = Number(bp.subtotal) ?? Number(bp.total) ?? 0
  const safeSubtotal = Number.isNaN(subtotal) || subtotal < 0 ? 0 : subtotal
  return Math.round(safeSubtotal * 0.1)
})

// Rest to pay: from product API formula when product has data; else from booking breakdown
const restToPayAmount = computed(() => {
  if (restToPayFromProduct.value != null) return restToPayFromProduct.value
  const fee = reservationFeeAmount.value
  const bp = bookingPrice.value
  if (fee == null || !bp) return null
  const subtotal = Number(bp.subtotal) ?? Number(bp.total) ?? 0
  const deposit = Number(bp.deposit_amount) ?? 0
  const s = Number.isNaN(subtotal) ? 0 : subtotal
  const d = Number.isNaN(deposit) ? 0 : deposit
  return Math.round(s + d - fee)
})

// Cost summary (from product API or booking when available)
const summaryCurrency = computed(() => bookingPrice.value?.currency || 'XOF')
const summaryDeposit = computed(() => productDepositAmount.value ?? Number(bookingPrice.value?.deposit_amount) ?? 0)
const summaryReservationFee = computed(() => reservationFeeAmount.value ?? productReservationFee.value ?? 0)
const summaryTotal = computed(() => {
  const bp = bookingPrice.value
  if (bp) {
    const sub = Number(bp.subtotal) ?? 0
    const dep = Number(bp.deposit_amount) ?? 0
    return (Number.isNaN(sub) ? 0 : sub) + (Number.isNaN(dep) ? 0 : dep)
  }
  const price = productPrice.value ?? 0
  const deposit = productDepositAmount.value ?? 0
  return price + deposit
})

// Explanation with real amounts from product API: (price + deposit − reservation_fee) = rest
const reservationFeeExplanationText = computed(() => {
  const rest = restToPayFromProduct.value
  const currency = bookingPrice.value?.currency || 'XOF'
  if (rest != null) {
    const price = productPrice.value ?? 0
    const deposit = productDepositAmount.value ?? 0
    const fee = productReservationFee.value ?? 0
    return t('booking.reservation_fee_explanation_with_amounts', {
      total: formatCurrency(price),
      deposit: formatCurrency(deposit),
      reservation_fee: formatCurrency(fee),
      rest: formatCurrency(rest),
      currency,
    })
  }
  return t('booking.reservation_fee_explanation')
})

const formatCurrency = (amount) => {
  const n = amount == null || amount === '' ? NaN : Number(amount)
  if (Number.isNaN(n)) return '0'
  return new Intl.NumberFormat('fr-FR').format(n)
}

const loadProduct = async () => {
  const id = route.params.id
  if (!id) { error.value = 'Invalid product'; loading.value = false; return }
  loading.value = true
  error.value = null
  try {
    await productStore.fetchProductById(id)
    if (!productStore.currentProduct) error.value = t('product.not_found') || 'Product not found'
    else if (maxGuests.value) numGuests.value = Math.min(numGuests.value, maxGuests.value)
    await nextTick()
    clampDatesToAvailability()
    await fetchAvailability()
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.detail || t('common.error') || 'Error loading product'
  } finally {
    loading.value = false
  }
}

async function fetchAvailability () {
  const pid = product.value?.id
  const fromStr = availableFromStr.value
  const toStr = availableToStr.value
  if (!pid) return
  const start = fromStr && fromStr >= todayStr ? fromStr : todayStr
  let end = toStr
  if (!end) {
    const from = fromStr ? new Date(fromStr) : new Date()
    from.setFullYear(from.getFullYear() + 1)
    end = from.toISOString().slice(0, 10)
  }
  try {
    const res = await apiService.getBookingAvailability({
      product_id: pid,
      start,
      end,
    })
    const list = Array.isArray(res?.data) ? res.data : []
    const set = new Set()
    for (const row of list) {
      if (row.status !== 'available' && row.date) {
        const d = typeof row.date === 'string' ? row.date.slice(0, 10) : (row.date?.date ? row.date.date.slice(0, 10) : null)
        if (d) set.add(d)
      }
    }
    unavailableDates.value = set
  } catch (e) {
    console.warn('Availability fetch failed:', e)
    unavailableDates.value = new Set()
  }
}

function clampDatesToAvailability () {
  const minIn = checkInMin.value
  const maxIn = checkInMax.value
  const maxOut = checkOutMax.value
  if (checkIn.value && minIn && checkIn.value < minIn) checkIn.value = minIn
  if (checkIn.value && maxIn && checkIn.value > maxIn) checkIn.value = ''
  if (checkOut.value && checkIn.value && checkOut.value <= checkIn.value) checkOut.value = ''
  if (checkOut.value && maxOut && checkOut.value > maxOut) checkOut.value = maxOut
}

function isDateUnavailable (dateStr) {
  return dateStr && unavailableDates.value.has(dateStr)
}

function rangeHasUnavailableNight (checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr || checkOutStr <= checkInStr) return false
  const set = unavailableDates.value
  if (set.size === 0) return false
  const start = new Date(checkInStr)
  const end = new Date(checkOutStr)
  const d = new Date(start)
  while (d < end) {
    if (set.has(d.toISOString().slice(0, 10))) return true
    d.setDate(d.getDate() + 1)
  }
  return false
}

const onCheckInChange = () => {
  if (checkIn.value && isDateUnavailable(checkIn.value)) {
    checkIn.value = ''
    snackbar.value = t('booking.date_not_available') || 'This date is not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    return
  }
  if (checkOut.value && checkIn.value && checkOut.value <= checkIn.value) checkOut.value = ''
  if (checkOut.value && checkOutMax.value && checkOut.value > checkOutMax.value) checkOut.value = checkOutMax.value
  if (checkOut.value && checkIn.value && rangeHasUnavailableNight(checkIn.value, checkOut.value)) {
    checkOut.value = ''
    snackbar.value = t('booking.range_has_unavailable') || 'Some dates in this range are not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
  }
  calculatePrice()
}

const onCheckOutChange = () => {
  if (checkOut.value && checkIn.value && rangeHasUnavailableNight(checkIn.value, checkOut.value)) {
    checkOut.value = ''
    snackbar.value = t('booking.range_has_unavailable') || 'Some dates in this range are not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    bookingPrice.value = null
    return
  }
  calculatePrice()
}

const calculatePrice = async () => {
  if (!checkIn.value || !checkOut.value || !product.value?.id) { bookingPrice.value = null; return }
  if (isDateUnavailable(checkIn.value) || rangeHasUnavailableNight(checkIn.value, checkOut.value)) {
    bookingPrice.value = null
    snackbar.value = t('booking.range_has_unavailable') || 'Some dates in this range are not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    return
  }
  calculating.value = true
  bookingPrice.value = null
  try {
    const res = await apiService.calculateBookingPrice({
      product_id: product.value.id,
      check_in: checkIn.value,
      check_out: checkOut.value,
      num_guests: numGuests.value,
    })
    // Support both direct body (res.data) and wrapped (res.data.data)
    const payload = res?.data
    const priceData = payload && typeof payload === 'object' && 'nights' in payload
      ? payload
      : payload?.data
    if (priceData && typeof priceData === 'object' && (priceData.subtotal != null || priceData.total != null)) {
      bookingPrice.value = priceData
    } else {
      console.warn('Booking calculate-price unexpected response:', res?.data)
      snackbar.value = t('product.price_calc_error') || 'Could not calculate price'
      snackbarError.value = true
      setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    }
  } catch (e) {
    console.error('Booking calculate-price error:', e)
    snackbar.value = e.response?.data?.detail || e.response?.data?.message || t('product.price_calc_error') || 'Could not calculate price'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
  } finally {
    calculating.value = false
  }
}

const submitBooking = async () => {
  if (!bookingPrice.value || !product.value?.id) return
  submitting.value = true
  snackbar.value = ''
  try {
    const res = await apiService.createBooking({
      product_id: product.value.id,
      check_in: checkIn.value,
      check_out: checkOut.value,
      num_guests: numGuests.value,
      special_requests: specialRequests.value,
    })
    const data = res.data
    if (data?.id) {
      router.replace({ name: 'BookingConfirmation', params: { id: data.id } })
      return
    }
    snackbar.value = t('product.booking_created')
    snackbarError.value = false
    setTimeout(() => { snackbar.value = '' }, 2000)
  } catch (e) {
    console.error(e)
    snackbar.value = e.response?.data?.detail || t('product.booking_error') || 'Booking failed'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>
