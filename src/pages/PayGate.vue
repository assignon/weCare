<template>
  <div class="page-container min-h-screen flex flex-col items-center justify-center px-5">
    <div class="max-w-md w-full text-center">
      <div class="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center mx-auto mb-6">
        <CreditCard class="w-8 h-8 text-navy" />
      </div>

      <!-- Verifying payment after return from PayGate -->
      <template v-if="isReturning">
        <h1 class="text-xl font-bold text-navy mb-2">{{ $t('paygate.verifying_title') }}</h1>
        <p class="text-grey-600 text-sm mb-6">{{ $t('paygate.verifying_desc') }}</p>
        <div v-if="!verifyError" class="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p v-if="verifyError" class="text-sm text-red-600 mt-4">{{ verifyError }}</p>
        <button
          v-if="verifyError"
          type="button"
          @click="retryVerification"
          class="mt-3 px-6 py-3 rounded-2xl font-semibold text-white bg-[#262A2E] hover:opacity-90"
        >
          {{ $t('common.retry') }}
        </button>
      </template>

      <!-- Pre-redirect: show amount and redirect button -->
      <template v-else>
        <h1 class="text-xl font-bold text-navy mb-2">{{ $t('paygate.title') }}</h1>
        <p class="text-grey-600 text-sm mb-6">{{ $t('paygate.description') }}</p>
        <p class="text-lg font-semibold text-navy mb-8">{{ formatAmount }} FCFA</p>
        <button
          type="button"
          @click="redirectToPayGate"
          :disabled="redirecting"
          class="w-full py-4 rounded-2xl font-semibold text-white bg-[#262A2E] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="redirecting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span v-else>{{ $t('paygate.finalize_btn') }}</span>
        </button>
        <p class="text-xs text-grey-500 mt-4">{{ $t('paygate.secure_note') }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CreditCard } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const redirecting = ref(false)
const isReturning = ref(false)
const verifyError = ref('')

const STORAGE_KEY = 'paygate_reservation_params'

const productId = computed(() => route.query.product_id)
const checkIn = computed(() => route.query.check_in)
const checkOut = computed(() => route.query.check_out)
const amount = computed(() => route.query.amount || '0')
const context = computed(() => route.query.context || 'reservation')
const numGuests = computed(() => route.query.num_guests || '1')
const specialRequests = computed(() => route.query.special_requests || '')
const startDate = computed(() => route.query.start_date)
const durationMonths = computed(() => route.query.duration_months || '1')

const hasReservationParams = computed(
  () => productId.value && checkIn.value && checkOut.value && Number(amount.value) > 0,
)

const formatAmount = computed(() => {
  const n = Number(amount.value)
  if (Number.isNaN(n)) return '0'
  return new Intl.NumberFormat('fr-FR').format(n)
})

const PAYGATE_TOKEN = import.meta.env.VITE_PAYGATE_TOKEN || ''
const PAYGATE_PAGE_URL = import.meta.env.VITE_PAYGATE_PAGE_URL || 'https://paygateglobal.com/v1/page'

function generateIdentifier() {
  return 'AQ-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function saveReservationParams(identifier) {
  const params = {
    identifier,
    product_id: productId.value,
    check_in: checkIn.value,
    check_out: checkOut.value,
    amount: amount.value,
    context: context.value,
    num_guests: numGuests.value,
    special_requests: specialRequests.value,
    start_date: startDate.value,
    duration_months: durationMonths.value,
    saved_at: Date.now(),
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  return params
}

function loadReservationParams() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function clearReservationParams() {
  sessionStorage.removeItem(STORAGE_KEY)
}

function redirectToPayGate() {
  if (!hasReservationParams.value || !PAYGATE_TOKEN) {
    console.error('Missing reservation params or PayGate token')
    return
  }
  redirecting.value = true

  const identifier = generateIdentifier()
  saveReservationParams(identifier)

  const returnUrl = `${window.location.origin}/payment/paygate?pg_id=${encodeURIComponent(identifier)}`
  const description = context.value === 'vehicle'
    ? `Reservation vehicule - Produit #${productId.value}`
    : `Reservation immobilier - Produit #${productId.value}`

  const url = new URL(PAYGATE_PAGE_URL)
  url.searchParams.set('token', PAYGATE_TOKEN)
  url.searchParams.set('amount', Math.round(Number(amount.value)).toString())
  url.searchParams.set('description', description)
  url.searchParams.set('identifier', identifier)
  url.searchParams.set('url', returnUrl)

  window.location.href = url.toString()
}

function getStandardDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString().split('T')[0]
}

async function createReservation(params) {
  const pid = params.product_id
  const amt = Number(params.amount)
  if (!pid || amt <= 0) return null

  const bookingPayload = {
    product_id: Number(pid),
    check_in: params.check_in,
    check_out: params.check_out,
    num_guests: params.context === 'property' ? parseInt(params.num_guests, 10) || 1 : 1,
    special_requests: params.special_requests || undefined,
  }
  if (params.context === 'property' && params.start_date && params.duration_months) {
    bookingPayload.check_in = params.start_date
    bookingPayload.duration_months = parseInt(params.duration_months, 10) || 1
    const sd = new Date(params.start_date + 'T12:00:00')
    sd.setMonth(sd.getMonth() + bookingPayload.duration_months)
    bookingPayload.check_out = sd.toISOString().slice(0, 10)
  }

  const bookingRes = await apiService.createBooking(bookingPayload)
  const newBookingId = bookingRes.data?.id

  const notes = [
    params.context === 'vehicle' ? 'Vehicle reservation - 10% deposit' : 'Property reservation - reservation fee',
    params.check_in && params.check_out ? `${params.check_in} to ${params.check_out}` : '',
    newBookingId ? `Booking #${newBookingId}` : '',
    params.identifier ? `PayGate ref: ${params.identifier}` : '',
  ].filter(Boolean).join('. ')

  const orderData = {
    items: [{ product_id: Number(pid), product_variant_id: null, quantity: 1, price: amt }],
    shipping_address:
      params.context === 'vehicle'
        ? 'Vehicle reservation - contact at handover'
        : 'Property reservation - contact at handover',
    delivery_fee: 0,
    notes,
    express_item_product_ids: [],
    custom_item_dates: {},
    standard_item_dates: { [pid]: getStandardDeliveryDate() },
  }
  const orderRes = await apiService.createOrder(orderData)
  const orders = orderRes.data?.orders
  const order = orders && orders.length > 0 ? orders[0] : null
  return { bookingId: newBookingId, orderId: order?.id }
}

async function handleReturnFromPayGate(pgIdentifier) {
  isReturning.value = true
  verifyError.value = ''

  const params = loadReservationParams()
  if (!params || params.identifier !== pgIdentifier) {
    verifyError.value = t('paygate.no_reservation_data')
    return
  }

  try {
    const verifyRes = await apiService.verifyPaygatePayment(pgIdentifier)
    const { paid, paygate_status } = verifyRes.data || {}

    if (!paid) {
      const statusLabels = { 2: t('paygate.status_pending'), 4: t('paygate.status_expired'), 6: t('paygate.status_cancelled') }
      verifyError.value = statusLabels[paygate_status] || t('paygate.payment_not_confirmed')
      return
    }

    const result = await createReservation(params)
    clearReservationParams()

    if (result?.orderId) {
      router.replace({
        name: 'PaymentSuccess',
        query: {
          order_id: result.orderId,
          order_number: result.orderId,
          total_amount: params.amount,
          payment_method: 'paygate',
        },
      })
    } else if (result?.bookingId) {
      router.replace({ name: 'BookingConfirmation', params: { id: result.bookingId } })
    } else {
      router.replace({ name: 'Home' })
    }
  } catch (e) {
    console.error('PayGate verification / reservation error:', e)
    verifyError.value = e.response?.data?.error || e.message || t('paygate.verification_failed')
  }
}

function retryVerification() {
  const pgId = route.query.pg_id
  if (pgId) {
    verifyError.value = ''
    handleReturnFromPayGate(pgId)
  }
}

onMounted(() => {
  const pgId = route.query.pg_id
  if (pgId) {
    handleReturnFromPayGate(pgId)
  } else if (!hasReservationParams.value) {
    router.replace({ name: 'Home' })
  }
})
</script>
