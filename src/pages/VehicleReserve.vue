<template>
  <div class="page-container pb-28">
    <!-- Header (same style as /product/:id/book) -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md px-5 py-3 z-40">
      <div class="flex items-center gap-3">
        <button type="button" @click="goBack" class="w-10 h-10 rounded-2xl bg-grey-50 flex items-center justify-center hover:bg-grey-100 transition-colors">
          <ArrowLeft class="w-5 h-5 text-navy" />
        </button>
        <h1 class="text-base font-bold text-navy">{{ $t('vehicle_reserve.title') }}</h1>
      </div>
    </div>

    <div class="px-5 pt-4">

      <div v-if="loading && !product" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="error" class="rounded-2xl bg-red-50 border border-red-100 p-4">
        <p class="text-sm text-red-700">{{ error }}</p>
        <button type="button" @click="loadProduct" class="mt-3 text-sm font-semibold text-red-600">
          {{ $t('common.retry') }}
        </button>
      </div>

      <template v-else-if="product">
        <!-- Product summary -->
        <div class="rounded-2xl bg-grey-50 border border-grey-100 p-4 flex gap-4 mb-5">
          <img
            :src="product.main_image || product.image_1"
            :alt="product.name"
            class="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <h2 class="font-bold text-navy text-sm leading-tight capitalize">{{ product.name }}</h2>
            <p class="text-xs text-grey-500 mt-1">{{ product.seller_name || product.store?.name || '—' }}</p>
            <p class="text-sm font-semibold text-navy mt-1">
              {{ formatApiPrice({ price: price }) }}
              <span class="text-xs font-normal text-grey-500">{{ priceUnitLabel }}</span>
            </p>
          </div>
        </div>

        <!-- Date range: calendar (like PropertyBook) -->
        <div class="rounded-2xl border border-grey-200 bg-white p-5 space-y-4 mb-5">
          <h3 class="font-bold text-navy text-sm">{{ $t('vehicle_reserve.select_dates') }}</h3>
          <p v-if="checkIn && checkOut" class="text-sm text-grey-600">
            {{ $t('product.check_in') }}: {{ formatCalendarDate(checkIn) }} — {{ $t('product.check_out') }}: {{ formatCalendarDate(checkOut) }}
          </p>
          <p v-else class="text-sm text-grey-500">{{ $t('booking.select_dates') }}</p>

          <div class="flex flex-col items-center">
            <div class="flex items-center justify-center gap-2 w-full max-w-[280px] mb-2">
              <button type="button" @click="calendarPrevMonth" class="w-9 h-9 rounded-xl flex items-center justify-center text-navy hover:bg-grey-100 active:bg-grey-200 flex-shrink-0 transition-colors">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <span class="text-sm font-semibold text-navy capitalize flex-1 text-center">{{ calendarMonthLabel(0) }}</span>
              <button type="button" @click="calendarNextMonth" class="w-9 h-9 rounded-xl flex items-center justify-center text-navy hover:bg-grey-100 active:bg-grey-200 flex-shrink-0 transition-colors">
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
            <div class="w-full max-w-[280px] grid grid-cols-7 gap-0.5 text-center">
              <div v-for="w in 7" :key="'w' + w" class="text-[10px] font-medium text-grey-500 py-1">{{ weekdayShort(w - 1) }}</div>
              <button
                v-for="day in getCalendarDays(0)"
                :key="day.dateStr || day.key"
                type="button"
                class="h-9 rounded-xl text-sm transition-colors"
                :class="getCalendarDayClass(day)"
                :disabled="day.isDisabled"
                @click="day.isDisabled ? null : selectCalendarDate(day.dateStr)"
              >
                {{ day.dayNumber }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="calculating" class="flex items-center justify-center py-2">
          <div class="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Total & Pay now (10%) - only when price calculated -->
        <div v-if="bookingPrice" class="rounded-2xl border border-grey-200 bg-white p-5 space-y-4 mb-5">
          <div class="flex justify-between text-sm text-grey-600">
            <span>{{ $t('vehicle_reserve.rental_summary') }}</span>
            <span>{{ periodCount }} {{ billingPeriodLabel }} × {{ formatApiPrice({ price: pricePerPeriod }) }}</span>
          </div>
          <div class="flex justify-between text-sm text-grey-600">
            <span>{{ $t('vehicle_reserve.subtotal') }}</span>
            <span>{{ formatApiPrice({ price: rentalSubtotal }) }}</span>
          </div>
          <div class="flex justify-between text-sm text-grey-600">
            <span>{{ $t('vehicle_reserve.deposit_guarantee') }}</span>
            <span>{{ formatApiPrice({ price: cautionAmount }) }}</span>
          </div>
          <div class="flex justify-between text-sm text-grey-600">
            <span>{{ $t('vehicle_reserve.platform_fee') }}</span>
            <span>{{ formatApiPrice({ price: platformFeeAmount }) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm border-t border-grey-200 pt-3">
            <span class="font-semibold text-navy">{{ $t('vehicle_reserve.total_cost') }}</span>
            <span class="font-bold text-navy">{{ formatApiPrice({ price: grandTotal }) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-grey-600">{{ $t('vehicle_reserve.reservation_fee') }}</span>
            <span class="text-lg font-bold text-red-500">{{ formatApiPrice({ price: payNowAmount }) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-navy">
            <span>{{ $t('vehicle_reserve.rest_to_pay_after_handover') }}</span>
            <span>{{ formatApiPrice({ price: restToPayAfterHandover }) }}</span>
          </div>
          <p class="text-xs text-grey-500">{{ $t('vehicle_reserve.reservation_fee_note') }}</p>
        </div>

        <!-- Terms agreement -->
        <label class="flex items-start gap-3 cursor-pointer mb-5">
          <input
            v-model="acceptTerms"
            type="checkbox"
            class="mt-0.5 flex-shrink-0 rounded border-grey-300 text-navy focus:ring-navy"
          />
          <span class="text-sm text-grey-700">
            {{ $t('vehicle_reserve.accept_terms') }}
            <a :href="termsUrl" target="_blank" rel="noopener noreferrer" class="text-navy font-medium underline">{{ $t('auth.terms_of_service') }}</a>.
          </span>
        </label>

        <!-- Réserver maintenant: opens summary dialog -->
        <button
          type="button"
          :disabled="!canOpenSummary"
          @click="showSummaryDialog = true"
          class="w-full py-4 rounded-2xl font-semibold text-white bg-[#262A2E] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {{ $t('vehicle_reserve.reserve_now_btn') }} — {{ formatApiPrice({ price: payNowAmount }) }}
        </button>
      </template>
    </div>

    <!-- Full-height reservation summary dialog -->
    <Teleport to="body">
      <div
        v-if="showSummaryDialog"
        class="fixed inset-0 z-[100] bg-grey-50 flex flex-col overflow-hidden"
      >
        <div class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-grey-100 px-4 py-4 flex items-center justify-between z-10 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-navy/10 flex items-center justify-center">
              <Receipt class="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-navy">{{ $t('vehicle_reserve.cost_summary') }}</h2>
              <p class="text-xs text-grey-500">{{ $t('vehicle_reserve.review_before_confirm') }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="showSummaryDialog = false"
            class="w-10 h-10 rounded-xl bg-grey-100 flex items-center justify-center text-grey-600 hover:bg-grey-200 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-grey-100">
            <div class="flex gap-4 p-4">
              <img
                :src="product?.main_image || product?.image_1"
                :alt="product?.name"
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-1 ring-grey-100"
              />
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-navy text-base leading-tight">{{ product?.name }}</h3>
                <div v-if="checkIn && checkOut" class="mt-3 flex items-center gap-2 text-sm text-grey-600">
                  <Calendar class="w-4 h-4 text-grey-400 flex-shrink-0" />
                  <span>{{ formatCalendarDate(checkIn) }} → {{ formatCalendarDate(checkOut) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="bookingPrice" class="bg-white rounded-2xl border border-grey-100 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-grey-100 flex items-center gap-2">
              <Receipt class="w-4 h-4 text-navy" />
              <span class="text-sm font-semibold text-navy uppercase tracking-wide">{{ $t('vehicle_reserve.rental_summary') }}</span>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-grey-600">{{ periodCount }} {{ billingPeriodLabel }} × {{ formatApiPrice({ price: pricePerPeriod }) }}</span>
                <span class="font-medium text-navy">{{ formatApiPrice({ price: rentalSubtotal }) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-grey-600">{{ $t('vehicle_reserve.deposit_guarantee') }}</span>
                <span class="font-medium text-navy">{{ formatApiPrice({ price: cautionAmount }) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-grey-600">{{ $t('vehicle_reserve.platform_fee') }}</span>
                <span class="font-medium text-navy">{{ formatApiPrice({ price: platformFeeAmount }) }}</span>
              </div>
            </div>
            <div class="px-4 py-3 bg-grey-50/80 border-t border-grey-100 space-y-2">
              <div class="flex justify-between items-center text-sm font-semibold text-navy">
                <span>{{ $t('vehicle_reserve.total_cost') }}</span>
                <span>{{ formatApiPrice({ price: grandTotal }) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-semibold text-red-500">
                <span>{{ $t('vehicle_reserve.reservation_fee') }}</span>
                <span>{{ formatApiPrice({ price: payNowAmount }) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-semibold text-navy pt-1 border-t border-grey-200">
                <span>{{ $t('vehicle_reserve.rest_to_pay_after_handover') }}</span>
                <span>{{ formatApiPrice({ price: restToPayAfterHandover }) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white border-t border-grey-100 px-4 py-4 safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            :disabled="paying"
            @click="confirmAndPay"
            class="w-full py-4 rounded-2xl font-semibold text-white bg-[#262A2E] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="paying" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else>{{ $t('vehicle_reserve.confirm_and_pay') }} — {{ formatApiPrice({ price: payNowAmount }) }}</span>
          </button>
        </div>
      </div>
    </Teleport>

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
import apiService from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import { ArrowLeft, ChevronLeft, ChevronRight, Receipt, X, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { formatApiPrice } = useCurrency()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const paying = ref(false)
const snackbar = ref('')
const snackbarError = ref(false)
const calculating = ref(false)
const acceptTerms = ref(false)
const showSummaryDialog = ref(false)
const termsUrl = import.meta.env.VITE_TERMS_URL || 'https://afriqxpress.com/terms'

const todayStr = new Date().toISOString().slice(0, 10)
const checkIn = ref('')
const checkOut = ref('')
const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const unavailableDates = ref(new Set())
const bookingPrice = ref(null)

const productId = computed(() => route.params.id)
const autoMeta = computed(() => product.value?.automobile_meta || {})
const listingType = computed(() => autoMeta.value.listing_type || '')
const price = computed(() => {
  const p = product.value?.price
  if (p != null && p !== '' && !Number.isNaN(Number(p))) return Number(p)
  return 0
})

const priceUnitLabel = computed(() => {
  if (listingType.value === 'for_rent') {
    const unit = autoMeta.value.rental_price_unit || autoMeta.value.price_unit || 'day'
    if (unit === 'day') return t('product.per_day')
    if (unit === 'week') return t('product.per_week')
    if (unit === 'month') return t('product.per_month')
  }
  if (listingType.value === 'for_leasing') return t('product.per_month')
  return t('product.per_day')
})

// Rental unit selected by seller (day, week, month)
const rentalUnit = computed(() => {
  if (listingType.value === 'for_leasing') return 'month'
  const unit = (autoMeta.value.rental_price_unit || autoMeta.value.price_unit || 'day').toLowerCase()
  if (unit === 'week' || unit === 'semaine') return 'week'
  if (unit === 'month' || unit === 'mois') return 'month'
  return 'day'
})

// Number of periods (days, weeks, or months) from selected date range
const periodCount = computed(() => {
  if (bookingPrice.value?.nights == null && (!checkIn.value || !checkOut.value)) return 0
  const days = bookingPrice.value?.nights ?? Math.max(1, Math.ceil((new Date(checkOut.value) - new Date(checkIn.value)) / (24 * 60 * 60 * 1000)))
  const unit = rentalUnit.value
  if (unit === 'week') return Math.max(1, Math.ceil(days / 7))
  if (unit === 'month') {
    const start = new Date(checkIn.value + 'T12:00:00')
    const end = new Date(checkOut.value + 'T12:00:00')
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    const dayRatio = (end.getDate() - start.getDate()) / 30
    return Math.max(1, Math.round(months + dayRatio))
  }
  return days
})

// Billing period label (jours, semaine(s), mois) from seller's unit
const billingPeriodLabel = computed(() => {
  const count = periodCount.value
  const unit = rentalUnit.value
  if (unit === 'week') return count <= 1 ? t('vehicle_reserve.period_week') : t('vehicle_reserve.period_weeks')
  if (unit === 'month') return t('vehicle_reserve.period_months')
  return count <= 1 ? t('vehicle_reserve.period_day') : t('vehicle_reserve.period_days')
})

// Price per period (per day, per week, or per month) for display
const pricePerPeriod = computed(() => {
  const unit = rentalUnit.value
  const p = price.value
  if (unit === 'week') return p
  if (unit === 'month') return p
  return bookingPrice.value?.price_per_night ?? p
})

const rentalSubtotal = computed(() => {
  if (bookingPrice.value && (bookingPrice.value.subtotal != null || bookingPrice.value.total != null)) {
    return Number(bookingPrice.value.subtotal ?? bookingPrice.value.total ?? 0)
  }
  return 0
})

const cautionAmount = computed(() => {
  const fromMeta = autoMeta.value.deposit_amount
  if (fromMeta != null && fromMeta !== '' && !Number.isNaN(Number(fromMeta)))
    return Math.max(0, Number(fromMeta))
  const fromApi = bookingPrice.value?.deposit_amount
  if (fromApi != null && !Number.isNaN(Number(fromApi))) return Math.max(0, Number(fromApi))
  return 0
})

const platformFeeAmount = computed(() => {
  const sub = rentalSubtotal.value
  if (sub <= 0) return 0
  return Math.round(sub * 0.05 * 100) / 100
})

const grandTotal = computed(() => {
  return rentalSubtotal.value + cautionAmount.value + platformFeeAmount.value
})

// Reservation fee (frais de réservation): 10% of subtotal only, not of caution or platform fee
const payNowAmount = computed(() => {
  const sub = rentalSubtotal.value
  if (sub <= 0) return 0
  return Math.round(sub * 0.1 * 100) / 100
})

// Rest to pay after vehicle handover (total − reservation fee)
const restToPayAfterHandover = computed(() => {
  const total = grandTotal.value
  const paid = payNowAmount.value
  return Math.max(0, Math.round((total - paid) * 100) / 100)
})

const canPay = computed(() => {
  return payNowAmount.value > 0 && checkIn.value && checkOut.value && !paying.value
})

const canOpenSummary = computed(() => {
  return Boolean(bookingPrice.value && payNowAmount.value > 0 && checkIn.value && checkOut.value && acceptTerms.value && !paying.value)
})

// Calendar helpers (mirror PropertyBook)
const WEEKDAY_KEYS = [0, 1, 2, 3, 4, 5, 6]
function weekdayShort(i) {
  const d = new Date(2024, 0, 7 + i)
  return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace(/\.$/, '')
}
function formatCalendarDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function calendarMonthLabel(offset) {
  const d = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + offset, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}
function calendarPrevMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1, 1)
}
function calendarNextMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1, 1)
}

function getCalendarDays(monthOffset) {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth() + monthOffset
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const total = 42
  const days = []
  const minStr = todayStr
  const unavail = unavailableDates.value
  const ci = checkIn.value
  const co = checkOut.value
  for (let i = 0; i < total; i++) {
    const date = new Date(year, month, i - startPad + 1)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayNumber = date.getDate()
    const isCurrentMonth = date.getMonth() === month
    const isPast = dateStr < minStr
    const isDisabled = !isCurrentMonth || isPast || unavail.has(dateStr)
    const isCheckIn = dateStr === ci
    const isCheckOut = dateStr === co
    const isInRange = ci && co && dateStr > ci && dateStr < co
    days.push({
      key: `${year}-${month}-${i}`,
      dateStr,
      dayNumber: isCurrentMonth ? dayNumber : '',
      isCurrentMonth,
      isDisabled,
      isCheckIn,
      isCheckOut,
      isInRange,
    })
  }
  return days
}

function getCalendarDayClass(day) {
  if (day.isDisabled) return 'text-grey-300 bg-transparent cursor-not-allowed'
  const c = []
  if (day.isInRange) c.push('bg-navy/10 text-navy')
  if (day.isCheckIn || day.isCheckOut) c.push('bg-navy text-white font-semibold')
  if (!day.isCheckIn && !day.isCheckOut && !day.isInRange) {
    c.push(day.isCurrentMonth ? 'text-navy hover:bg-grey-100' : 'text-grey-400')
  }
  c.push('cursor-pointer')
  return c.join(' ') || 'text-navy'
}

function isDateUnavailable(dateStr) {
  return dateStr && unavailableDates.value.has(dateStr)
}
function rangeHasUnavailableNight(startStr, endStr) {
  if (!startStr || !endStr || endStr <= startStr) return false
  const set = unavailableDates.value
  if (set.size === 0) return false
  const start = new Date(startStr)
  const end = new Date(endStr)
  const d = new Date(start)
  while (d < end) {
    if (set.has(d.toISOString().slice(0, 10))) return true
    d.setDate(d.getDate() + 1)
  }
  return false
}

function selectCalendarDate(dateStr) {
  const ci = checkIn.value
  const co = checkOut.value
  if (!ci || (ci && co)) {
    if (isDateUnavailable(dateStr)) {
      snackbar.value = t('booking.date_not_available')
      snackbarError.value = true
      setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
      return
    }
    if (dateStr < todayStr) return
    checkIn.value = dateStr
    checkOut.value = ''
    bookingPrice.value = null
    return
  }
  if (ci && !co) {
    if (dateStr <= ci) {
      checkIn.value = dateStr
      checkOut.value = ''
      bookingPrice.value = null
      return
    }
    if (rangeHasUnavailableNight(ci, dateStr)) {
      snackbar.value = t('booking.range_has_unavailable')
      snackbarError.value = true
      setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
      return
    }
    checkOut.value = dateStr
    onCheckOutChange()
  }
}

function onCheckOutChange() {
  if (checkOut.value && checkIn.value && rangeHasUnavailableNight(checkIn.value, checkOut.value)) {
    checkOut.value = ''
    snackbar.value = t('booking.range_has_unavailable')
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    bookingPrice.value = null
    return
  }
  calculatePrice()
}

async function fetchAvailability() {
  const pid = product.value?.id
  if (!pid) return
  const start = todayStr
  const endDate = new Date()
  endDate.setFullYear(endDate.getFullYear() + 1)
  const end = endDate.toISOString().slice(0, 10)
  try {
    const res = await apiService.getBookingAvailability({ product_id: pid, start, end })
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
    console.warn('Vehicle availability fetch failed:', e)
    unavailableDates.value = new Set()
  }
}

async function calculatePrice() {
  if (!checkIn.value || !checkOut.value || !product.value?.id) {
    bookingPrice.value = null
    return
  }
  if (isDateUnavailable(checkIn.value) || rangeHasUnavailableNight(checkIn.value, checkOut.value)) {
    bookingPrice.value = null
    snackbar.value = t('booking.range_has_unavailable')
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
      num_guests: 1,
    })
    const payload = res?.data
    const priceData = payload && typeof payload === 'object' && ('nights' in payload || 'subtotal' in payload)
      ? payload
      : payload?.data
    if (priceData && typeof priceData === 'object' && (priceData.subtotal != null || priceData.total != null)) {
      bookingPrice.value = priceData
    } else {
      const nights = Math.max(1, Math.ceil((new Date(checkOut.value) - new Date(checkIn.value)) / (24 * 60 * 60 * 1000)))
      bookingPrice.value = {
        nights,
        price_per_night: price.value,
        subtotal: price.value * nights,
        total: price.value * nights,
      }
    }
  } catch (e) {
    console.error('Calculate price error:', e)
    const nights = Math.max(1, Math.ceil((new Date(checkOut.value) - new Date(checkIn.value)) / (24 * 60 * 60 * 1000)))
    bookingPrice.value = {
      nights,
      price_per_night: price.value,
      subtotal: price.value * nights,
      total: price.value * nights,
    }
  } finally {
    calculating.value = false
  }
}

async function loadProduct() {
  if (!productId.value) return
  loading.value = true
  error.value = null
  try {
    const res = await apiService.getProductDetails(productId.value)
    product.value = res.data
    await nextTick()
    await fetchAvailability()
    calendarMonth.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.detail || e.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId.value } })
  }
}

function getStandardDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().split('T')[0]
}

function confirmAndPay() {
  showSummaryDialog.value = false
  submitPayment()
}

function submitPayment() {
  if (!canPay.value || !product.value) return
  // Payment first: redirect to PayGate with reservation params. Booking + order are created only after payment.
  router.push({
    name: 'PayGate',
    query: {
      product_id: product.value.id,
      check_in: checkIn.value,
      check_out: checkOut.value,
      amount: payNowAmount.value.toFixed(2),
      context: 'vehicle',
    },
  })
}

onMounted(() => {
  loadProduct()
})
</script>
