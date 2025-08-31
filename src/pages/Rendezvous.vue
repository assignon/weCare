<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-24">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 z-40">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Rendezvous</h1>
          <p class="text-sm text-gray-600">Your viewing appointments</p>
        </div>
        <button 
          @click="refreshRequests"
          :disabled="loading"
          class="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="['w-5 h-5 text-blue-600', { 'animate-spin': loading }]" />
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="px-4 pt-6 pb-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar class="w-5 h-5 text-blue-600" />
            </div>
            <div class="ml-3">
              <p class="text-xs text-gray-500 font-medium">Total Requests</p>
              <p class="text-lg font-bold text-gray-900">{{ stats.total_requests || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock class="w-5 h-5 text-orange-600" />
            </div>
            <div class="ml-3">
              <p class="text-xs text-gray-500 font-medium">Pending</p>
              <p class="text-lg font-bold text-gray-900">{{ stats.pending_requests || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 mb-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="filter in filterOptions"
            :key="filter.key"
            @click="activeFilter = filter.key"
            :class="[
              'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              activeFilter === filter.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !viewingRequests.length" class="px-4">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-200 rounded-xl"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="px-4">
      <div class="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
          <span class="text-red-700 font-medium">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredRequests.length === 0" class="px-4">
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
        <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No viewing requests</h3>
        <p class="text-gray-600 mb-6">
          {{ activeFilter === 'all' 
            ? "You haven't made any viewing requests yet. Browse our automobile and real estate sections to get started!" 
            : `No ${activeFilter} viewing requests found.`
          }}
        </p>
        <button 
          @click="$router.push({ name: 'Explore' })"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Explore Products
        </button>
      </div>
    </div>

    <!-- Viewing Requests List -->
    <div v-if="!loading && filteredRequests.length > 0" class="px-4 space-y-4">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      >
        <div class="p-4">
          <!-- Request Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <img 
                :src="request.product_main_image || '/placeholder.jpg'" 
                :alt="request.product_name"
                class="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 class="font-semibold text-gray-900">{{ request.product_name }}</h3>
                <p class="text-sm text-gray-500">{{ request.store_name }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(request.created_at) }}</p>
              </div>
            </div>
            <div 
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getStatusColor(request.status)
              ]"
            >
              {{ request.status_display }}
            </div>
          </div>

          <!-- Request Details -->
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Preferred Date</p>
                <p class="font-medium">{{ formatDate(request.preferred_date) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Preferred Time</p>
                <p class="font-medium">{{ formatTime(request.preferred_time) }}</p>
              </div>
            </div>

            <!-- Scheduled Details (if scheduled) -->
            <div v-if="request.status === 'SCHEDULED' && request.scheduled_date" class="bg-green-50 rounded-xl p-3">
              <div class="flex items-center mb-2">
                <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
                <span class="text-sm font-medium text-green-800">Viewing Scheduled</span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-green-600">Scheduled Date</p>
                  <p class="font-medium text-green-800">{{ formatDate(request.scheduled_date) }}</p>
                </div>
                <div>
                  <p class="text-green-600">Scheduled Time</p>
                  <p class="font-medium text-green-800">{{ formatTime(request.scheduled_time) }}</p>
                </div>
              </div>
              <div v-if="request.viewing_location" class="mt-2">
                <p class="text-green-600 text-sm">Location</p>
                <p class="text-green-800 text-sm">{{ request.viewing_location }}</p>
              </div>
            </div>

            <!-- Seller Notes -->
            <div v-if="request.seller_notes" class="bg-blue-50 rounded-xl p-3">
              <p class="text-blue-600 text-sm font-medium mb-1">Seller Notes</p>
              <p class="text-blue-800 text-sm">{{ request.seller_notes }}</p>
            </div>

            <!-- Your Message -->
            <div v-if="request.message" class="bg-gray-50 rounded-xl p-3">
              <p class="text-gray-600 text-sm font-medium mb-1">Your Message</p>
              <p class="text-gray-800 text-sm">{{ request.message }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button
              @click="viewRequestHistory(request)"
              class="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              <Eye class="w-4 h-4 mr-1" />
              View History
            </button>
            
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">
                {{ request.days_since_request }} day{{ request.days_since_request !== 1 ? 's' : '' }} ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request History Modal -->
    <div 
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="handleHistoryModalOverlayClick"
    >
      <div 
        class="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Request History</h3>
            <button 
              @click="showHistoryModal = false"
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="loadingHistory" class="space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          <div v-else-if="requestHistory.length === 0" class="text-center py-8">
            <p class="text-gray-500">No history available</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="history in requestHistory"
              :key="history.id"
              class="border-l-4 border-blue-200 pl-4 py-2"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-900">
                  {{ history.old_status_display ? `${history.old_status_display} → ` : '' }}
                  {{ history.new_status_display }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDateTime(history.changed_at) }}</span>
              </div>
              <p class="text-sm text-gray-600">by {{ history.changed_by_name }}</p>
              <p v-if="history.notes" class="text-sm text-gray-700 mt-1">{{ history.notes }}</p>
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
import { apiService } from '@/services/api'
import { 
  Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, Eye, X 
} from 'lucide-vue-next'

const router = useRouter()

const viewingRequests = ref([])
const stats = ref({})
const loading = ref(false)
const error = ref('')
const activeFilter = ref('all')

// History modal
const showHistoryModal = ref(false)
const selectedRequest = ref(null)
const requestHistory = ref([])
const loadingHistory = ref(false)

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'COMPLETED', label: 'Completed' }
]

const filteredRequests = computed(() => {
  if (activeFilter.value === 'all') {
    return viewingRequests.value
  }
  return viewingRequests.value.filter(request => request.status === activeFilter.value)
})

const fetchViewingRequests = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const [requestsResponse, statsResponse] = await Promise.all([
      apiService.getViewingRequests(),
      apiService.getViewingRequestStats()
    ])
    
    viewingRequests.value = requestsResponse.data.results || requestsResponse.data || []
    stats.value = statsResponse.data || {}
    
  } catch (err) {
    console.error('Failed to fetch viewing requests:', err)
    error.value = 'Failed to load viewing requests'
  } finally {
    loading.value = false
  }
}

const refreshRequests = () => {
  fetchViewingRequests()
}

const viewRequestHistory = async (request) => {
  try {
    selectedRequest.value = request
    showHistoryModal.value = true
    loadingHistory.value = true
    
    const response = await apiService.getViewingRequestHistory(request.id)
    requestHistory.value = response.data || []
    
  } catch (err) {
    console.error('Failed to fetch request history:', err)
    requestHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

const handleHistoryModalOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    showHistoryModal.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    'NEW': 'bg-blue-100 text-blue-700',
    'ACCEPTED': 'bg-yellow-100 text-yellow-700',
    'SCHEDULED': 'bg-green-100 text-green-700',
    'COMPLETED': 'bg-gray-100 text-gray-700',
    'REJECTED': 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  fetchViewingRequests()
})
</script>
