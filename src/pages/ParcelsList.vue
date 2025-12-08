<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <BackButtonHeader title="My Parcels" />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
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

    <!-- Empty State -->
    <div v-else-if="parcels.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
      <Package class="w-16 h-16 text-gray-300 mb-4" />
      <p class="text-gray-600 text-center mb-2">No parcels sent yet</p>
      <router-link 
        :to="{ name: 'SendParcel' }"
        class="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
      >
        Send Your First Parcel
      </router-link>
    </div>

    <!-- Parcels List -->
    <div v-else class="p-4 space-y-4">
      <div
        v-for="parcel in parcels"
        :key="parcel.id"
        @click="viewParcel(parcel.id)"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  statusColors[parcel.status]
                ]"
              >
                {{ parcel.status_display }}
              </span>
              <span class="text-xs text-gray-500">#{{ parcel.id }}</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">
              To: {{ parcel.recipient_name }}
            </p>
            <p class="text-xs text-gray-600 mb-2">
              {{ parcel.pickup_landmark || parcel.pickup_address || 'Pickup location' }} → 
              {{ parcel.dropoff_landmark || parcel.dropoff_address || 'Dropoff location' }}
            </p>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        
        <div class="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div class="flex items-center space-x-4">
            <span>{{ parcel.distance_km }} km</span>
            <span>{{ parcel.delivery_fee }} CFA</span>
          </div>
          <span>{{ formatDate(parcel.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useParcelStore } from '@/stores/parcel'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { Loader2, AlertCircle, Package, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const parcelStore = useParcelStore()

const parcels = ref([])
const loading = ref(false)
const error = ref(null)

const statusColors = {
  pending: 'bg-orange-100 text-orange-700',
  driver_assigned: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700'
}

const fetchParcels = async () => {
  loading.value = true
  error.value = null

  try {
    await parcelStore.fetchParcels()
    parcels.value = parcelStore.parcels
  } catch (err) {
    error.value = 'Failed to load parcels'
    console.error('Error fetching parcels:', err)
  } finally {
    loading.value = false
  }
}

const viewParcel = (id) => {
  router.push({ name: 'ParcelTracking', params: { id } })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchParcels()
})
</script>

