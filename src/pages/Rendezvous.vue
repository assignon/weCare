<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-24">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 z-40">
      <div class="flex items-center justify-between">
        <button 
          @click="$router.go(-1)"
          class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>
        <button 
          @click="refreshRequests"
          :disabled="loading"
          class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm disabled:opacity-50"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <RefreshCw :class="['w-5 h-5 text-white', { 'animate-spin': loading }]" />
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
        <!-- Accordion Header -->
        <div 
          @click="toggleAccordion(request.id)"
          class="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        >
          <div class="flex items-start justify-between">
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
            <div class="flex items-center space-x-3">
              <div 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  getStatusColor(request.status)
                ]"
              >
                {{ request.status_display }}
              </div>
              <div class="w-6 h-6 flex items-center justify-center">
                <ChevronDown 
                  :class="[
                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                    expandedItems.includes(request.id) ? 'rotate-180' : ''
                  ]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Accordion Content -->
        <div 
          v-if="expandedItems.includes(request.id)"
          class="border-t border-gray-100"
        >
          <div class="p-4 space-y-3">
            <!-- Request Details -->
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

          <!-- Footer Actions -->
          <div class="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
            <div class="flex items-center space-x-4">
              <button
                @click="viewRequestHistory(request)"
                class="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                <Eye class="w-4 h-4 mr-1" />
                View History
              </button>
              
              <button
                v-if="['NEW', 'ACCEPTED', 'SCHEDULED'].includes(request.status)"
                @click="openChat(request)"
                class="flex items-center text-green-600 text-sm font-medium hover:text-green-700"
              >
                <MessageCircle class="w-4 h-4 mr-1" />
                Chat
              </button>
            </div>
            
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

    <!-- Chat Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div 
        v-if="showChatModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end"
        @click="closeChat"
      >
        <div 
          class="bg-white rounded-t-3xl w-full h-[95vh] flex flex-col shadow-2xl"
          @click.stop
        >
          <!-- Chat Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 rounded-t-3xl shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <img 
                    :src="selectedChatRequest?.product_main_image || '/placeholder.jpg'" 
                    :alt="selectedChatRequest?.product_name"
                    class="w-12 h-12 rounded-xl object-cover shadow-md ring-2 ring-white"
                  />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg">{{ selectedChatRequest?.product_name }}</h3>
                  <p class="text-sm text-gray-500 flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {{ selectedChatRequest?.store_name }}
                  </p>
                </div>
              </div>
              <button 
                @click="closeChat"
                class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <X class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
            <div v-if="loadingChat" class="flex justify-center py-12">
              <div class="flex flex-col items-center space-y-3">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                <p class="text-sm text-gray-500">Loading messages...</p>
              </div>
            </div>
            
            <div v-else-if="chatMessages.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle class="w-10 h-10 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Start the conversation!</h3>
              <p class="text-gray-500">Send a message to discuss this product with the seller.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="message in chatMessages"
                :key="message.id"
                :class="[
                  'flex',
                  message.sender_type === 'SELLER' ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-xs lg:max-w-md px-5 py-3 rounded-3xl shadow-sm',
                    message.sender_type === 'SELLER'
                      ? 'bg-purple-600 text-white ml-12' 
                      : 'bg-blue-600 text-white mr-12'
                  ]"
                >
                  <p class="text-sm leading-relaxed">{{ message.content }}</p>
                  <p 
                    :class="[
                      'text-xs mt-2 opacity-70',
                      message.sender_type === 'SELLER' ? 'text-purple-100' : 'text-blue-100'
                    ]"
                  >
                    {{ formatDateTime(message.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="sticky bottom-0 bg-white border-t border-gray-100 p-6 shadow-lg">
            <div class="flex items-end space-x-3">
              <div class="flex-1 relative">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="Type your message..."
                  class="w-full px-5 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  :disabled="sendingMessage"
                />
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div v-if="sendingMessage" class="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
                </div>
              </div>
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || sendingMessage"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
                class="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Send v-if="!sendingMessage" class="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { 
  Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, Eye, X, ArrowLeft, MessageCircle, ChevronDown, Send 
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

// Chat modal
const showChatModal = ref(false)
const selectedChatRequest = ref(null)
const chatMessages = ref([])
const loadingChat = ref(false)
const newMessage = ref('')
const sendingMessage = ref(false)

// Accordion state
const expandedItems = ref([])

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

const openChat = async (request) => {
  try {
    selectedChatRequest.value = request
    showChatModal.value = true
    loadingChat.value = true
    
    console.log('Opening chat for viewing request:', request.id)
    console.log('Request object:', request)
    
    // Fetch chat messages for this viewing request
    console.log('Making API call to get chat messages with params:', { viewing_request: request.id })
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
    })
    
    const response = await Promise.race([
      apiService.getChatMessages({
        viewing_request: request.id
      }),
      timeoutPromise
    ])
    
    console.log('Chat messages response:', response)
    console.log('Response data:', response.data)
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    // Handle different response formats
    let messages = []
    if (Array.isArray(response.data)) {
      messages = response.data
    } else if (response.data && Array.isArray(response.data.results)) {
      messages = response.data.results
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      messages = response.data.data
    } else {
      console.warn('Unexpected response format:', response.data)
      messages = []
    }
    
    chatMessages.value = messages
    console.log('Chat messages loaded:', chatMessages.value.length)
    console.log('Chat messages array:', chatMessages.value)
    
    // Mark all messages as read (optional - don't block chat loading)
    apiService.markAllMessagesAsRead(request.id)
      .then(() => console.log('Messages marked as read successfully'))
      .catch((readError) => console.error('Failed to mark messages as read:', readError))
    
  } catch (err) {
    console.error('Failed to open chat:', err)
    console.error('Error details:', err.response?.data)
    console.error('Error status:', err.response?.status)
    console.error('Error message:', err.message)
    
    // Set empty messages array and show error
    chatMessages.value = []
    
    // You could add a toast notification here if needed
    // toast.error('Failed to load chat messages')
  } finally {
    loadingChat.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChatRequest.value) return
  
  try {
    sendingMessage.value = true
    
    const response = await apiService.sendChatMessage({
      viewing_request: selectedChatRequest.value.id,
      content: newMessage.value.trim(),
      message_type: 'text',
      sender_type: 'SHOPPER'  // Explicitly set sender_type for shopper app
    })
    
    // Add the new message to the list
    chatMessages.value.push(response.data)
    newMessage.value = ''
    
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sendingMessage.value = false
  }
}

const closeChat = () => {
  showChatModal.value = false
  selectedChatRequest.value = null
  chatMessages.value = []
  newMessage.value = ''
}

const toggleAccordion = (requestId) => {
  const index = expandedItems.value.indexOf(requestId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(requestId)
  }
}

onMounted(() => {
  fetchViewingRequests()
})
</script>
