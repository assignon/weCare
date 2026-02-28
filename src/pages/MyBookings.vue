<template>
  <div class="page-container pb-24">
    <!-- Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-3 z-40">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <button @click="router.back()" class="w-10 h-10 rounded-2xl bg-grey-100 flex items-center justify-center mr-3">
            <ArrowLeft class="w-5 h-5 text-navy" />
          </button>
          <h1 class="text-xl font-bold text-navy">{{ $t('booking.my_bookings') }}</h1>
        </div>
        <button
          @click="fetchBookings"
          :disabled="loading"
          class="w-10 h-10 bg-navy rounded-2xl flex items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50"
        >
          <RefreshCw :class="['w-5 h-5 text-white', { 'animate-spin': loading }]" />
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="px-4 pt-4 pb-2">
      <div class="grid grid-cols-3 gap-3">
        <div class="card p-3 text-center">
          <div class="w-9 h-9 bg-navy/10 rounded-xl flex items-center justify-center mx-auto mb-1">
            <Calendar class="w-4.5 h-4.5 text-navy" />
          </div>
          <p class="text-lg font-bold text-navy">{{ stats.total }}</p>
          <p class="text-xs text-grey-500">{{ $t('booking.stats_total') }}</p>
        </div>
        <div class="card p-3 text-center">
          <div class="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-1">
            <Clock class="w-4.5 h-4.5 text-yellow-600" />
          </div>
          <p class="text-lg font-bold text-navy">{{ stats.pending }}</p>
          <p class="text-xs text-grey-500">{{ $t('booking.stats_pending') }}</p>
        </div>
        <div class="card p-3 text-center">
          <div class="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-1">
            <CheckCircle class="w-4.5 h-4.5 text-green-600" />
          </div>
          <p class="text-lg font-bold text-navy">{{ stats.confirmed }}</p>
          <p class="text-xs text-grey-500">{{ $t('booking.stats_confirmed') }}</p>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 py-3">
      <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="[
            'pill-filter',
            activeFilter === filter.value
              ? 'bg-navy text-white shadow-sm'
              : 'bg-grey-100 text-grey-500 hover:bg-grey-200'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !bookings.length" class="px-4">
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="card p-4 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 bg-grey-200 rounded-2xl"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-grey-200 rounded w-3/4"></div>
              <div class="h-3 bg-grey-200 rounded w-1/2"></div>
              <div class="h-3 bg-grey-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredBookings.length === 0" class="px-4 pt-4">
      <div class="card p-8 text-center">
        <div class="w-16 h-16 bg-grey-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar class="w-8 h-8 text-grey-400" />
        </div>
        <h3 class="text-lg font-bold text-navy mb-2">{{ $t('booking.no_bookings') }}</h3>
        <p class="text-grey-500 mb-6">{{ $t('booking.no_bookings_desc') }}</p>
        <button
          @click="router.push({ name: 'Explore' })"
          class="btn btn-primary px-6 py-2.5 text-sm"
        >
          {{ $t('booking.explore_properties') }}
        </button>
      </div>
    </div>

    <!-- Bookings List -->
    <div v-else class="px-4 space-y-3">
      <div
        v-for="b in filteredBookings"
        :key="b.id"
        @click="router.push({ name: 'BookingConfirmation', params: { id: b.id } })"
        class="card overflow-hidden active:scale-[0.98] transition-transform duration-150 cursor-pointer"
      >
        <div class="flex">
          <!-- Property Image -->
          <div class="w-28 h-28 flex-shrink-0">
            <img
              v-if="getBookingImage(b)"
              :src="getBookingImage(b)"
              :alt="getBookingPropertyName(b)"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-grey-100 flex items-center justify-center">
              <Home class="w-8 h-8 text-grey-300" />
            </div>
          </div>

          <!-- Details -->
          <div class="flex-1 p-3 min-w-0">
            <div class="flex items-start justify-between">
              <p class="font-semibold text-navy text-sm truncate pr-2">{{ getBookingPropertyName(b) }}</p>
              <span
                :class="['px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0', getStatusClasses(displayStatus(b))]"
              >
                {{ getStatusLabel(displayStatus(b)) }}
              </span>
            </div>

            <div class="mt-1.5 space-y-1">
              <div class="flex items-center text-xs text-grey-500">
                <Calendar class="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span>{{ formatDateShort(b.check_in) }} → {{ formatDateShort(b.check_out) }}</span>
              </div>
              <div class="flex items-center text-xs text-grey-500">
                <Users class="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span>{{ b.num_guests }} {{ $t('booking.guest_label') }}</span>
              </div>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm font-bold text-navy">{{ formatCurrency(b.total_amount ?? b.total_price) }} XOF</span>
              <ChevronRight class="w-4 h-4 text-grey-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, RefreshCw, Calendar, Clock, CheckCircle, Home, Users, ChevronRight } from 'lucide-vue-next'
import apiService from '@/services/api'

const router = useRouter()
const { t } = useI18n()

const bookings = ref([])
const loading = ref(true)
const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: t('booking.filter_all') },
  { value: 'pending_confirmation', label: t('booking.filter_pending') },
  { value: 'confirmed', label: t('booking.filter_confirmed') },
  { value: 'completed', label: t('booking.filter_completed') },
  { value: 'cancelled', label: t('booking.filter_cancelled') },
])

// Backend uses 'pending'; frontend filter uses 'pending_confirmation'
const displayStatus = (b) => (b?.status === 'pending' ? 'pending_confirmation' : b?.status)

const stats = computed(() => {
  const all = bookings.value
  return {
    total: all.length,
    pending: all.filter(b => b.status === 'pending' || b.status === 'pending_confirmation').length,
    confirmed: all.filter(b => ['confirmed', 'paid', 'checked_in'].includes(b.status)).length,
  }
})

const filteredBookings = computed(() => {
  if (activeFilter.value === 'all') return bookings.value
  if (activeFilter.value === 'pending_confirmation') {
    return bookings.value.filter(b => b.status === 'pending' || b.status === 'pending_confirmation')
  }
  if (activeFilter.value === 'confirmed') {
    return bookings.value.filter(b => ['confirmed', 'paid', 'checked_in'].includes(b.status))
  }
  return bookings.value.filter(b => b.status === activeFilter.value)
})

const getBookingPropertyName = (b) => {
  return b?.product_details?.name || b?.product_name || b?.property_name || ''
}

const getBookingImage = (b) => {
  return b?.product_details?.primary_image || b?.product_details?.images?.[0] || b?.property_image || null
}

const getStatusClasses = (status) => {
  const map = {
    pending_confirmation: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    checked_in: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status) => {
  return t(`booking.status_${status}`) || status
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('fr-FR').format(amount)
}

const fetchBookings = async () => {
  loading.value = true
  try {
    const response = await apiService.getMyBookings()
    bookings.value = response.data?.results || response.data || []
  } catch (err) {
    console.error('Error fetching bookings:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
