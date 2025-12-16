<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <BackButtonHeader :title="`Parcel #${parcelId}`">
      <template #right>
        <button 
          @click="refreshParcel"
          :disabled="loading"
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="['w-5 h-5 text-gray-700', { 'animate-spin': loading }]" />
        </button>
      </template>
    </BackButtonHeader>

    <!-- Loading State -->
    <div v-if="loading && !parcel" class="flex justify-center items-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-blue-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
          <span class="text-red-700">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Parcel Details -->
    <div v-else-if="parcel" class="p-4 space-y-4">
      <!-- Status Banner -->
      <div 
        :class="[
          'p-6 rounded-2xl shadow-lg',
          statusColors[parcel.status]
        ]"
        :style="{ background: statusColors[parcel.status] }"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <component :is="statusIcons[parcel.status]" class="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <p class="text-white text-sm opacity-90">{{ $t('parcels.status') }}</p>
              <p class="text-white text-xl font-bold">{{ parcel.status_display }}</p>
            </div>
          </div>
        </div>
        <p v-if="parcel.estimated_delivery_time" class="text-white text-sm opacity-90">
          {{ $t('parcels.est_delivery') }}: {{ parcel.estimated_delivery_time }} {{ $t('parcels.minutes') }}
        </p>
      </div>

      <!-- Status Timeline -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('parcels.delivery_timeline') }}</h2>
        <div class="space-y-4">
          <div 
            v-for="(step, index) in timelineSteps" 
            :key="index"
            class="flex items-start space-x-4"
          >
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center border-2',
                  step.completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                ]"
              >
                <component 
                  :is="step.icon" 
                  :class="['w-5 h-5', step.completed ? 'text-white' : 'text-gray-400']" 
                />
              </div>
              <div 
                v-if="index < timelineSteps.length - 1"
                :class="[
                  'w-0.5 h-12 mt-2',
                  step.completed ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              ></div>
            </div>
            <div class="flex-1 pt-2">
              <p :class="['font-semibold', step.completed ? 'text-gray-900' : 'text-gray-500']">
                {{ step.label }}
              </p>
              <p v-if="step.time" class="text-xs text-gray-500 mt-1">
                {{ formatDateTime(step.time) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Driver Info (if assigned) -->
      <div v-if="parcel.driver" class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('parcels.driver_information') }}</h2>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <User class="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ parcel.driver.full_name || $t('parcels.driver') }}</p>
              <p class="text-sm text-gray-600">{{ parcel.driver.phone_number || $t('parcels.no_phone') }}</p>
            </div>
          </div>
          <button
            v-if="parcel.driver.phone_number"
            @click="callDriver"
            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center space-x-2"
          >
            <Phone class="w-4 h-4" />
            <span>{{ $t('parcels.call') }}</span>
          </button>
        </div>
      </div>

      <!-- Location Details -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('parcels.delivery_details') }}</h2>
        <div class="space-y-4">
          <!-- Pickup -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ $t('parcels.pickup_location') }}</p>
              <p class="text-sm text-gray-600">
                {{ parcel.pickup_location.landmark || parcel.pickup_location.address || $t('parcels.no_landmark') }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ parcel.pickup_location.latitude }}, {{ parcel.pickup_location.longitude }}
              </p>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flex justify-center">
            <ArrowDown class="w-5 h-5 text-gray-400" />
          </div>

          <!-- Dropoff -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin class="w-5 h-5 text-red-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ $t('parcels.dropoff_location') }}</p>
              <p class="text-sm text-gray-600">
                {{ parcel.dropoff_location.landmark || parcel.dropoff_location.address || 'No landmark' }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ parcel.dropoff_location.latitude }}, {{ parcel.dropoff_location.longitude }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipient Details -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('parcels.recipient') }}</h2>
        <div class="space-y-4">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <div class="pl-10">
              <p class="text-xs text-gray-500 mb-1">Name</p>
              <p class="text-sm font-semibold text-gray-900">{{ parcel.recipient_name }}</p>
            </div>
          </div>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <div class="pl-10">
              <p class="text-xs text-gray-500 mb-1">Phone</p>
              <p class="text-sm font-semibold text-gray-900">{{ parcel.recipient_phone }}</p>
            </div>
          </div>
          <div v-if="parcel.package_description" class="relative group">
            <div class="absolute top-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
              <Package class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <div class="pl-10">
              <p class="text-xs text-gray-500 mb-1">{{ $t('parcels.package_description') }}</p>
              <p class="text-sm text-gray-700">{{ parcel.package_description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing Details -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Pricing</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-700">Distance</span>
            <span class="font-semibold">{{ parcel.distance_km }} km</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-700">Base Fee</span>
            <span class="font-semibold">{{ parcel.base_fee }} CFA</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-700">Distance Fee</span>
            <span class="font-semibold">{{ parcel.distance_fee }} CFA</span>
          </div>
          <div class="flex justify-between pt-2 border-t-2 border-gray-300">
            <span class="text-lg font-bold text-gray-900">Total</span>
            <span class="text-xl font-bold text-blue-600">{{ parcel.delivery_fee }} CFA</span>
          </div>
        </div>
      </div>

      <!-- Cancel Button (if applicable) -->
      <button
        v-if="parcel.can_be_cancelled"
        @click="showCancelDialog = true"
        class="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
      >
        Cancel Delivery
      </button>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <div 
      v-if="showCancelDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showCancelDialog = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Cancel Delivery?</h3>
        <p class="text-gray-600 mb-4">Are you sure you want to cancel this parcel delivery?</p>
        <textarea 
          v-model="cancelReason"
          rows="3"
          placeholder="Reason for cancellation (optional)"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none mb-4"
        ></textarea>
        <div class="flex space-x-3">
          <button
            @click="showCancelDialog = false"
            class="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300"
          >
            Keep Delivery
          </button>
          <button
            @click="confirmCancel"
            :disabled="cancelling"
            class="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {{ cancelling ? 'Cancelling...' : 'Confirm Cancel' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useParcelStore } from '@/stores/parcel'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { 
  RefreshCw, Loader2, AlertCircle, Clock, CheckCircle, 
  XCircle, User, Phone, MapPin, Package, ArrowDown, Truck, PackageCheck
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const parcelStore = useParcelStore()

const parcelId = computed(() => route.params.id)
const parcel = computed(() => parcelStore.currentParcel)
const loading = ref(false)
const error = ref(null)
const showCancelDialog = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)

const statusColors = {
  pending: 'linear-gradient(to right, #f59e42, #ffc107)',
  admin_assigned: 'linear-gradient(to right, #f59e42, #ffc107)',
  driver_assigned: 'linear-gradient(to right, #2563eb, #9333ea)',
  picked_up: 'linear-gradient(to right, #a21caf, #ec4899)',
  in_transit: 'linear-gradient(to right, #6366f1, #a21caf)',
  delivered: 'linear-gradient(to right, #22c55e, #10b981)',
  cancelled: 'linear-gradient(to right, #ef4444, #fb7185)',
  failed: 'linear-gradient(to right, #dc2626, #b91c1c)'
}

const statusIcons = {
  pending: Clock,
  driver_assigned: User,
  picked_up: PackageCheck,
  in_transit: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  failed: AlertCircle
}

const timelineSteps = computed(() => {
  if (!parcel.value) return []

  const status = parcel.value.status
  const steps = [
    {
      label: 'Parcel Requested',
      icon: Clock,
      completed: true,
      time: parcel.value.created_at
    },
    {
      label: 'Driver Assigned',
      icon: User,
      completed: ['driver_assigned', 'picked_up', 'in_transit', 'delivered'].includes(status),
      time: parcel.value.driver_assigned_at
    },
    {
      label: 'Picked Up',
      icon: PackageCheck,
      completed: ['picked_up', 'in_transit', 'delivered'].includes(status),
      time: parcel.value.picked_up_at
    },
    {
      label: 'In Transit',
      icon: Truck,
      completed: ['in_transit', 'delivered'].includes(status),
      time: null
    },
    {
      label: 'Delivered',
      icon: CheckCircle,
      completed: status === 'delivered',
      time: parcel.value.delivered_at
    }
  ]

  return steps
})

const fetchParcel = async () => {
  loading.value = true
  error.value = null

  try {
    await parcelStore.fetchParcelDetails(parcelId.value)
  } catch (err) {
    error.value = 'Failed to load parcel details'
    console.error('Error fetching parcel:', err)
  } finally {
    loading.value = false
  }
}

const refreshParcel = () => {
  fetchParcel()
}

const confirmCancel = async () => {
  cancelling.value = true

  try {
    await parcelStore.cancelParcel(parcelId.value, cancelReason.value)
    showCancelDialog.value = false
    cancelReason.value = ''
  } catch (err) {
    alert('Failed to cancel parcel. Please try again.')
  } finally {
    cancelling.value = false
  }
}

const callDriver = () => {
  if (parcel.value?.driver?.phone_number) {
    window.location.href = `tel:${parcel.value.driver.phone_number}`
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  fetchParcel()
  
  // Refresh every 30 seconds
  const interval = setInterval(() => {
    if (parcel.value && parcel.value.is_active) {
      fetchParcel()
    }
  }, 30000)

  // Cleanup
  return () => clearInterval(interval)
})
</script>

