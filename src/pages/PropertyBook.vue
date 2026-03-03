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

      <!-- SHORT-TERM: Check-in / Check-out calendar range selection -->
      <div v-if="isShortTerm" class="card p-5 space-y-4">
        <h3 class="font-bold text-navy text-sm">{{ $t('product.booking_title') }}</h3>
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
              v-for="day in getCalendarDays(0)" :key="day.dateStr || day.key"
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

        <!-- Nombre de voyageurs (only when price is per person) -->
        <div v-if="pricePerPerson">
          <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.num_guests') }}</label>
          <div class="flex items-center bg-grey-50 rounded-2xl p-1 w-36">
            <button @click="decrementGuests" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">-</button>
            <span class="flex-1 text-center font-bold text-navy">{{ numGuests }}</span>
            <button @click="incrementGuests" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">+</button>
          </div>
          <p class="text-xs text-grey-600 mt-1">{{ $t('booking.price_updates_with_guests') }}</p>
        </div>
      </div>

      <!-- MID-TERM: Start date + Duration selector -->
      <div v-else-if="isMidTerm" class="card p-5 space-y-4">
        <h3 class="font-bold text-navy text-sm">{{ $t('booking.mid_term_title') }}</h3>
        <div>
          <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('booking.start_date') }}</label>
          <input
            ref="startDateInputRef"
            type="date"
            v-model="startDate"
            :min="checkInMin"
            :max="checkInMax"
            class="w-full px-4 py-3 border border-grey-200 rounded-2xl text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy"
            @click="openStartDatePicker"
            @change="onMidTermStartDateChange"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('booking.duration') }}</label>
          <select
            v-model="durationMonths"
            class="w-full px-4 py-3 border border-grey-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-navy/20 focus:border-navy"
            @change="calculateMidTermPrice"
          >
            <option v-for="m in 12" :key="m" :value="m" :disabled="m < minStayMonths">
              {{ m }} {{ m === 1 ? $t('booking.month') : $t('booking.months') }}
            </option>
          </select>
          <p class="text-xs text-grey-400 mt-1">{{ $t('booking.min_stay') }}: {{ minStayMonths }} {{ minStayMonths === 1 ? $t('booking.month') : $t('booking.months') }}</p>
        </div>
        <!-- Nombre de voyageurs (only when price is per person) -->
        <div v-if="pricePerPerson">
          <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.num_guests') }}</label>
          <div class="flex items-center bg-grey-50 rounded-2xl p-1 w-36">
            <button @click="decrementGuests" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">-</button>
            <span class="flex-1 text-center font-bold text-navy">{{ numGuests }}</span>
            <button @click="incrementGuests" type="button" class="w-10 h-10 flex items-center justify-center text-navy font-bold">+</button>
          </div>
          <p class="text-xs text-grey-600 mt-1">{{ $t('booking.price_updates_with_guests') }}</p>
        </div>
      </div>

      <!-- Special requests (Demandes spéciales) -->
      <div class="card p-5">
        <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.special_requests') }}</label>
        <textarea
          v-model="specialRequests"
          rows="3"
          class="textarea text-sm"
          :placeholder="$t('product.special_requests_placeholder')"
        ></textarea>
      </div>

      <!-- Consolidated cost summary: subtotal line, deposit, platform fee, reservation fee, rest to pay -->
      <div v-if="bookingPrice" class="card p-5 space-y-3">
        <h3 class="font-bold text-navy text-sm">{{ $t('booking.cost_summary') }}</h3>
        <div class="flex justify-between text-sm text-grey-600">
          <span v-if="isMidTerm">
            <template v-if="pricePerPerson">{{ bookingPrice.months }} {{ bookingPrice.months === 1 ? $t('booking.month') : $t('booking.months') }} × {{ formatCurrency(bookingPrice.price_per_month) }} × {{ numGuests }} {{ $t('booking.guests') }}</template>
            <template v-else>{{ bookingPrice.months }} {{ bookingPrice.months === 1 ? $t('booking.month') : $t('booking.months') }} × {{ formatCurrency(bookingPrice.price_per_month) }}</template>
          </span>
          <span v-else>
            <template v-if="pricePerPerson">{{ bookingPrice.nights }} {{ $t('product.nights') }} × {{ formatCurrency(bookingPrice.price_per_night) }} × {{ numGuests }} {{ $t('booking.guests') }}</template>
            <template v-else>{{ bookingPrice.nights }} {{ $t('product.nights') }} × {{ formatCurrency(bookingPrice.price_per_night) }}</template>
          </span>
          <span>{{ formatCurrency(bookingPrice.subtotal ?? bookingPrice.total) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('booking.deposit') }}</span>
          <span>{{ formatCurrency(summaryDeposit) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('product.platform_fee') }}</span>
          <span>{{ formatCurrency(bookingPrice.platform_fee) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm text-grey-600">
          <span>{{ $t('booking.reservation_fee') }}</span>
          <span>{{ formatCurrency(summaryReservationFee) }} {{ summaryCurrency }}</span>
        </div>
        <div class="border-t border-grey-200 pt-3 flex justify-between text-sm font-semibold text-navy">
          <span>{{ $t('booking.total') }}</span>
          <span>{{ formatCurrency(totalPriceAmount ?? 0) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm font-semibold text-navy">
          <span>{{ $t('booking.already_paid') }}</span>
          <span>{{ formatCurrency(summaryReservationFee ?? 0) }} {{ summaryCurrency }}</span>
        </div>
        <div class="flex justify-between text-sm font-semibold text-navy">
          <span>{{ $t('booking.pay_after_key_given') }}</span>
          <span>{{ formatCurrency(restToPayAmount ?? 0) }} {{ summaryCurrency }}</span>
        </div>
      </div>
      <div v-if="calculating" class="flex items-center justify-center py-4">
        <div class="animate-spin h-6 w-6 border-2 border-navy border-t-transparent rounded-full"></div>
      </div>

      <p class="text-xs text-grey-500 leading-relaxed">
        {{ reservationFeeExplanationText }}
      </p>
      <p class="text-xs text-amber-700 bg-amber-50/80 rounded-lg p-2.5 mt-2">
        {{ $t('booking.reservation_fee_no_refund_notice') }}
      </p>

      <!-- Terms and conditions -->
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="acceptTerms"
          type="checkbox"
          class="checkbox mt-0.5 flex-shrink-0"
        />
        <span class="text-sm text-grey-700">
          {{ $t('booking.accept_terms_before_booking') }}
          <a :href="termsUrl" target="_blank" rel="noopener noreferrer" class="text-navy font-medium underline">{{ $t('auth.terms_of_service') }}</a>.
        </span>
      </label>

      <!-- Spacer so fixed button does not overlap content -->
      <div class="h-28" />
    </div>

    <!-- Fixed bottom: Réserver maintenant -->
    <div
      v-if="product && !loading"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-100 px-5 py-4 z-30 safe-area-pb"
    >
      <button
        @click="showSummaryDialog = true"
        :disabled="!bookingPrice || !acceptTerms || (isMidTerm && !startDate)"
        class="btn-cta w-full bg-success-600 hover:bg-success-700 disabled:opacity-50 py-4"
      >
        {{ $t('product.book_now') }} — {{ (reservationFeeAmount ?? productReservationFee) != null ? formatCurrency(reservationFeeAmount ?? productReservationFee) : '—' }} {{ bookingPrice?.currency || product?.currency_info?.currency_code || 'XOF' }}
      </button>
    </div>

    <!-- Full-height reservation summary dialog -->
    <Teleport to="body">
      <div
        v-if="showSummaryDialog"
        class="fixed inset-0 z-[100] bg-grey-50 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-grey-100 px-4 py-4 flex items-center justify-between z-10 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-navy/10 flex items-center justify-center">
              <Receipt class="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-navy">{{ $t('booking.cost_summary') }}</h2>
              <p class="text-xs text-grey-500">{{ $t('booking.review_before_confirm') }}</p>
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
          <!-- Property card -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-grey-100">
            <div class="flex gap-4 p-4">
              <img
                :src="product?.main_image || product?.image_1"
                :alt="product?.name"
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-1 ring-grey-100"
              />
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-navy text-base leading-tight">{{ product?.name }}</h3>
                <div class="mt-3 space-y-2">
                  <div v-if="isShortTerm && checkIn && checkOut" class="flex items-center gap-2 text-sm text-grey-600">
                    <Calendar class="w-4 h-4 text-grey-400 flex-shrink-0" />
                    <span>{{ formatCalendarDate(checkIn) }} → {{ formatCalendarDate(checkOut) }}</span>
                  </div>
                  <div v-else-if="isMidTerm && startDate" class="flex items-center gap-2 text-sm text-grey-600">
                    <Calendar class="w-4 h-4 text-grey-400 flex-shrink-0" />
                    <span>{{ formatCalendarDate(startDate) }} · {{ durationMonths }} {{ durationMonths === 1 ? $t('booking.month') : $t('booking.months') }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-grey-600">
                    <Users class="w-4 h-4 text-grey-400 flex-shrink-0" />
                    <span>{{ numGuests }} {{ numGuests === 1 ? $t('booking.guest_label') : $t('booking.guests') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Price breakdown card -->
          <div v-if="bookingPrice" class="bg-white rounded-2xl border border-grey-100 shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-grey-100 flex items-center gap-2">
              <Receipt class="w-4 h-4 text-navy" />
              <span class="text-sm font-semibold text-navy uppercase tracking-wide">{{ $t('booking.price_breakdown') }}</span>
            </div>
            <div class="p-4 space-y-3">
              <!-- Subtotal line -->
              <div class="flex justify-between items-center text-sm">
                <span class="text-grey-600 flex items-center gap-2">
                  <Receipt class="w-3.5 h-3.5 text-grey-400" />
                  <span v-if="isMidTerm">
                    <template v-if="pricePerPerson">{{ bookingPrice.months }} {{ $t('booking.months') }} × {{ formatCurrency(bookingPrice.price_per_month) }} × {{ numGuests }}</template>
                    <template v-else>{{ bookingPrice.months }} {{ $t('booking.months') }} × {{ formatCurrency(bookingPrice.price_per_month) }}</template>
                  </span>
                  <span v-else>
                    <template v-if="pricePerPerson">{{ bookingPrice.nights }} {{ $t('product.nights') }} × {{ formatCurrency(bookingPrice.price_per_night) }} × {{ numGuests }}</template>
                    <template v-else>{{ bookingPrice.nights }} {{ $t('product.nights') }} × {{ formatCurrency(bookingPrice.price_per_night) }}</template>
                  </span>
                </span>
                <span class="font-medium text-navy">{{ formatCurrency(bookingPrice.subtotal ?? bookingPrice.total) }} {{ summaryCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-grey-600 flex items-center gap-2">
                  <Shield class="w-3.5 h-3.5 text-grey-400" />
                  {{ $t('booking.deposit') }}
                </span>
                <span class="font-medium text-navy">{{ formatCurrency(summaryDeposit) }} {{ summaryCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-grey-600 flex items-center gap-2">
                  <BadgePercent class="w-3.5 h-3.5 text-grey-400" />
                  {{ $t('product.platform_fee') }}
                </span>
                <span class="font-medium text-navy">{{ formatCurrency(bookingPrice.platform_fee) }} {{ summaryCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-grey-600 flex items-center gap-2">
                  <Wallet class="w-3.5 h-3.5 text-grey-400" />
                  {{ $t('booking.reservation_fee') }}
                </span>
                <span class="font-medium text-navy">{{ formatCurrency(summaryReservationFee) }} {{ summaryCurrency }}</span>
              </div>
            </div>
            <div class="px-4 py-3 bg-grey-50/80 border-t border-grey-100 space-y-2">
              <div class="flex justify-between items-center text-sm font-semibold text-navy">
                <span>{{ $t('booking.total') }}</span>
                <span>{{ formatCurrency(totalPriceAmount ?? 0) }} {{ summaryCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-semibold text-success-600">
                <span class="flex items-center gap-2">
                  <Wallet class="w-3.5 h-3.5" />
                  {{ $t('booking.already_paid') }}
                </span>
                <span>{{ formatCurrency(summaryReservationFee ?? 0) }} {{ summaryCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-sm font-semibold text-navy pt-1 border-t border-grey-200">
                <span class="flex items-center gap-2">
                  <KeyRound class="w-3.5 h-3.5 text-grey-500" />
                  {{ $t('booking.pay_after_key_given') }}
                </span>
                <span>{{ formatCurrency(restToPayAmount ?? 0) }} {{ summaryCurrency }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="sticky bottom-0 bg-white border-t border-grey-100 px-4 py-4 safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            @click="confirmAndSubmitBooking"
            :disabled="submitting"
            class="btn-cta w-full bg-success-600 hover:bg-success-700 disabled:opacity-50 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <span v-if="submitting" class="flex items-center gap-2">
              <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {{ $t('product.processing') }}
            </span>
            <span v-else class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              {{ $t('product.book_now') }} — {{ formatCurrency(summaryReservationFee ?? 0) }} {{ summaryCurrency }}
            </span>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProductStore } from '@/stores/product'
import { useCurrency } from '@/composables/useCurrency'
import apiService from '@/services/api'
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight, Calendar, Users, Receipt, Shield, BadgePercent, Wallet, KeyRound, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const productStore = useProductStore()
const { formatApiPrice } = useCurrency()

const loading = ref(true)
const error = ref(null)
const product = computed(() => productStore.currentProduct)
const todayStr = new Date().toISOString().slice(0, 10)

const checkIn = ref('')
const checkOut = ref('')
/** First day of the first calendar month displayed */
const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
/** Set of date strings (YYYY-MM-DD) that are unavailable (booked/blocked) from availability API */
const unavailableDates = ref(new Set())
const numGuests = ref(1)
const specialRequests = ref('')
const bookingPrice = ref(null)
const calculating = ref(false)
const submitting = ref(false)
const showSummaryDialog = ref(false)
const snackbar = ref('')
const snackbarError = ref(false)
const acceptTerms = ref(false)
const termsUrl = import.meta.env.VITE_TERMS_URL || 'https://afriqxpress.com/terms'

// Mid-term rental state
const startDate = ref('')
const durationMonths = ref(1)
const startDateInputRef = ref(null)

function openStartDatePicker () {
  nextTick(() => {
    const el = startDateInputRef.value
    if (el && typeof el.showPicker === 'function') {
      el.showPicker()
    }
  })
}

const locationType = computed(() => product.value?.property_meta?.location_type || 'short_term_stay')
const isShortTerm = computed(() => locationType.value === 'short_term_stay')
const isMidTerm = computed(() => locationType.value === 'mid_term_rental')
const isViewingOnly = computed(() => locationType.value === 'long_term_residential' || locationType.value === 'commercial_rental')

const minStayMonths = computed(() => {
  const n = product.value?.property_meta?.min_stay_months
  return n != null ? parseInt(n, 10) : 1
})

const maxGuests = computed(() => {
  const n = product.value?.property_meta?.max_guests
  return n != null ? parseInt(n, 10) : null
})

const pricePerPerson = computed(() => !!product.value?.property_meta?.price_per_person)

function incrementGuests () {
  const max = pricePerPerson.value ? 99 : (maxGuests.value ?? 99)
  numGuests.value = Math.min(max, numGuests.value + 1)
}
function decrementGuests () {
  numGuests.value = Math.max(1, numGuests.value - 1)
}

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
// Allow future bookings: only use available_to as max when it is today or in the future; if past or missing, no max
const checkInMax = computed(() => {
  const to = availableToStr.value
  if (!to) return null
  return to >= todayStr ? to : null
})
const checkOutMin = computed(() => {
  const ci = checkIn.value
  const from = availableFromStr.value
  if (ci) return ci
  if (from && from >= todayStr) return from
  return todayStr
})
const checkOutMax = computed(() => checkInMax.value)

// ─── Calendar (range selection) ─────────────────────────────────────────────
const WEEKDAY_KEYS = [0, 1, 2, 3, 4, 5, 6] // Sun=0
const weekdayShort = (i) => {
  const d = new Date(2024, 0, 7 + i) // 7 Jan 2024 = Sun
  return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace(/\.$/, '')
}

function formatCalendarDate (dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function calendarMonthLabel (offset) {
  const d = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + offset, 1)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function calendarPrevMonth () {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1, 1)
}

function calendarNextMonth () {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1, 1)
}

function getCalendarDays (monthOffset) {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth() + monthOffset
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const daysInMonth = last.getDate()
  const total = 42
  const days = []
  const minStr = checkInMin.value
  const maxStr = checkInMax.value
  const unavail = unavailableDates.value
  const ci = checkIn.value
  const co = checkOut.value
  for (let i = 0; i < total; i++) {
    const date = new Date(year, month, i - startPad + 1)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayNumber = date.getDate()
    const isCurrentMonth = date.getMonth() === month
    const isDisabled = !isCurrentMonth || (minStr && dateStr < minStr) || (maxStr && dateStr > maxStr) || unavail.has(dateStr)
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

function getCalendarDayClass (day) {
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

function selectCalendarDate (dateStr) {
  const ci = checkIn.value
  const co = checkOut.value
  if (!ci || (ci && co)) {
    if (isDateUnavailable(dateStr)) {
      snackbar.value = t('booking.date_not_available')
      snackbarError.value = true
      setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
      return
    }
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

// Reservation fee: from product API when > 0; when 0 or null, use 10% of subtotal only (not deposit)
const reservationFeeAmount = computed(() => {
  const productFee = productReservationFee.value
  if (productFee != null && Number(productFee) > 0) return Math.round(Number(productFee))
  const bp = bookingPrice.value
  if (!bp) return null
  const subtotal = Number(bp.subtotal) ?? Number(bp.total) ?? 0
  const safeSubtotal = Number.isNaN(subtotal) || subtotal < 0 ? 0 : subtotal
  return Math.round(safeSubtotal * 0.1)
})

// Rest to pay at handover = subtotal + deposit + platform fee (paid at key handover; reservation fee is paid now)
const restToPayAmount = computed(() => {
  const bp = bookingPrice.value
  if (!bp) return null
  const subtotal = Number(bp.subtotal) ?? Number(bp.total) ?? 0
  const deposit = Number(bp.deposit_amount) ?? 0
  const platformFee = Number(bp.platform_fee) ?? 0
  const s = Number.isNaN(subtotal) ? 0 : subtotal
  const d = Number.isNaN(deposit) ? 0 : deposit
  const p = Number.isNaN(platformFee) ? 0 : platformFee
  return Math.round(s + d + p)
})

// Total price = subtotal + deposit + platform fee + reservation fee
const totalPriceAmount = computed(() => {
  const bp = bookingPrice.value
  if (!bp) return null
  const subtotal = Number(bp.subtotal) ?? Number(bp.total) ?? 0
  const deposit = Number(bp.deposit_amount) ?? 0
  const platformFee = Number(bp.platform_fee) ?? 0
  const fee = summaryReservationFee.value ?? 0
  const s = Number.isNaN(subtotal) ? 0 : subtotal
  const d = Number.isNaN(deposit) ? 0 : deposit
  const p = Number.isNaN(platformFee) ? 0 : platformFee
  const f = Number.isNaN(Number(fee)) ? 0 : Number(fee)
  return Math.round(s + d + p + f)
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

// Explanation with effective amounts: total (subtotal+deposit) − reservation_fee = rest
const reservationFeeExplanationText = computed(() => {
  const rest = restToPayAmount.value
  const total = summaryTotal.value
  const fee = summaryReservationFee.value ?? 0
  const currency = summaryCurrency.value
  if (rest != null && total != null) {
    return t('booking.reservation_fee_explanation_with_amounts', {
      total: formatCurrency(total),
      deposit: formatCurrency(summaryDeposit.value),
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
    if (!productStore.currentProduct) { error.value = t('product.not_found') || 'Product not found'; return }

    // Redirect viewing-only types back to product details
    if (isViewingOnly.value) {
      router.replace({ name: 'ProductDetails', params: { id } })
      return
    }

    if (maxGuests.value) numGuests.value = Math.min(numGuests.value, maxGuests.value)
    if (isMidTerm.value) durationMonths.value = minStayMonths.value

    await nextTick()
    clampDatesToAvailability()
    await fetchAvailability()
    setCalendarMonthFromProduct()
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
  let end = toStr && toStr >= todayStr ? toStr : null
  if (!end) {
    const from = new Date(start + 'T12:00:00')
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

function setCalendarMonthFromProduct () {
  const min = checkInMin.value
  const d = min ? new Date(min + 'T12:00:00') : new Date()
  calendarMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
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
  if (isMidTerm.value) return calculateMidTermPrice()

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

/** True if the mid-term range [start, start + duration months) has any unavailable night */
function midTermRangeHasUnavailable (startStr, months) {
  if (!startStr || !months || !unavailableDates.value.size) return false
  const start = new Date(startStr + 'T12:00:00')
  const end = new Date(start)
  end.setMonth(end.getMonth() + months)
  const set = unavailableDates.value
  const d = new Date(start)
  while (d < end) {
    if (set.has(d.toISOString().slice(0, 10))) return true
    d.setDate(d.getDate() + 1)
  }
  return false
}

function onMidTermStartDateChange () {
  if (!startDate.value) {
    bookingPrice.value = null
    return
  }
  if (isDateUnavailable(startDate.value)) {
    startDate.value = ''
    bookingPrice.value = null
    snackbar.value = t('booking.date_not_available') || 'This date is not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    return
  }
  if (midTermRangeHasUnavailable(startDate.value, parseInt(durationMonths.value, 10))) {
    startDate.value = ''
    bookingPrice.value = null
    snackbar.value = t('booking.range_has_unavailable') || 'Some dates in this range are not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    return
  }
  calculateMidTermPrice()
}

const calculateMidTermPrice = async () => {
  if (!startDate.value || !durationMonths.value || !product.value?.id) { bookingPrice.value = null; return }
  if (isDateUnavailable(startDate.value) || midTermRangeHasUnavailable(startDate.value, parseInt(durationMonths.value, 10))) {
    bookingPrice.value = null
    snackbar.value = t('booking.range_has_unavailable') || 'Some dates in this range are not available'
    snackbarError.value = true
    setTimeout(() => { snackbar.value = ''; snackbarError.value = false }, 3000)
    return
  }
  calculating.value = true
  bookingPrice.value = null
  try {
    const monthlyRate = Number(product.value.price) || 0
    const months = parseInt(durationMonths.value, 10)
    const deposit = Number(product.value.property_meta?.deposit_amount) || 0
    const guests = pricePerPerson.value ? Math.max(1, numGuests.value) : 1
    let subtotal = monthlyRate * months * guests
    // Platform fee = 5% of total price to pay (subtotal + deposit)
    const platformFee = Math.round((subtotal + deposit) * 0.05)
    bookingPrice.value = {
      months,
      price_per_month: monthlyRate,
      subtotal,
      deposit_amount: deposit,
      platform_fee: platformFee,
      total: subtotal + deposit + platformFee,
      currency: product.value.currency_info?.currency_code || 'XOF',
    }
  } finally {
    calculating.value = false
  }
}

const submitBooking = async () => {
  if (!bookingPrice.value || !product.value?.id) return
  submitting.value = true
  snackbar.value = ''
  try {
    const payload = {
      product_id: product.value.id,
      num_guests: numGuests.value,
      special_requests: specialRequests.value,
    }
    if (isMidTerm.value) {
      payload.check_in = startDate.value
      payload.duration_months = parseInt(durationMonths.value, 10)
      // Compute check_out from start date + duration
      const sd = new Date(startDate.value + 'T12:00:00')
      sd.setMonth(sd.getMonth() + payload.duration_months)
      payload.check_out = sd.toISOString().slice(0, 10)
    } else {
      payload.check_in = checkIn.value
      payload.check_out = checkOut.value
    }
    const res = await apiService.createBooking(payload)
    const data = res.data
    if (data?.id) {
      showSummaryDialog.value = false
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

const confirmAndSubmitBooking = () => {
  submitBooking()
}

// When per-person pricing is on, recalculate price when number of guests changes
watch(numGuests, () => {
  if (!pricePerPerson.value) return
  if (isShortTerm.value && checkIn.value && checkOut.value) {
    calculatePrice()
  } else if (isMidTerm.value && startDate.value) {
    calculateMidTermPrice()
  }
})

onMounted(() => {
  loadProduct()
})
</script>
