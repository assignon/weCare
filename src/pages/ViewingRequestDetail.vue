<template>
  <div class="min-h-screen bg-white pb-24">
    <!-- Header -->
    <BackButtonHeader title="Viewing Request">
      <template #right>
        <button
          v-if="request"
          @click="openChat"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Chat</span>
        </button>
      </template>
    </BackButtonHeader>

    <!-- Loading State -->
    <div v-if="loading" class="px-4 py-8">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
          <span class="text-red-700 font-medium">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Request Details -->
    <div v-if="!loading && request" class="px-4 py-4 space-y-4">
      <!-- Product Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div class="flex items-center space-x-4">
          <img 
            :src="request.product_main_image || '/placeholder.jpg'" 
            :alt="request.product_name"
            class="w-20 h-20 rounded-lg object-cover"
          />
          <div class="flex-1">
            <h2 class="font-semibold text-gray-900 text-lg mb-1">{{ request.product_name }}</h2>
            <p class="text-sm text-gray-500 mb-2">{{ request.store_name }}</p>
            <div 
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                getStatusColor(request.status)
              ]"
            >
              {{ request.status_display }}
            </div>
          </div>
        </div>
      </div>

      <!-- Request Information -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Request Information</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">Preferred Date</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDate(request.preferred_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Preferred Time</p>
              <p class="text-sm font-medium text-gray-900">{{ formatTime(request.preferred_time) }}</p>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Requested On</p>
            <p class="text-sm font-medium text-gray-900">{{ formatDateTime(request.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Scheduled Details (if scheduled) -->
      <div v-if="request.status === 'SCHEDULED' && request.scheduled_date" class="bg-green-50 rounded-xl border border-green-200 p-4">
        <div class="flex items-center mb-3">
          <CheckCircle class="w-5 h-5 text-green-600 mr-2" />
          <h3 class="font-semibold text-green-800">Viewing Scheduled</h3>
        </div>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-green-600 mb-1">Scheduled Date</p>
              <p class="text-sm font-medium text-green-800">{{ formatDate(request.scheduled_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-green-600 mb-1">Scheduled Time</p>
              <p class="text-sm font-medium text-green-800">{{ formatTime(request.scheduled_time) }}</p>
            </div>
          </div>
          <div v-if="request.viewing_location">
            <p class="text-xs text-green-600 mb-1">Location</p>
            <p class="text-sm font-medium text-green-800">{{ request.viewing_location }}</p>
          </div>
        </div>
      </div>

      <!-- Seller Notes -->
      <div v-if="request.seller_notes" class="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <h3 class="font-semibold text-blue-800 mb-2">Seller Notes</h3>
        <p class="text-sm text-blue-900">{{ request.seller_notes }}</p>
      </div>

      <!-- Your Message -->
      <div v-if="request.message" class="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 class="font-semibold text-gray-800 mb-2">Your Message</h3>
        <p class="text-sm text-gray-900">{{ request.message }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3 pt-2">
        <button
          @click="viewRequestHistory"
          class="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Eye class="w-5 h-5" />
          <span>View History</span>
        </button>
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
        class="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end"
        @click="closeChat"
      >
        <div 
          class="bg-white rounded-t-3xl w-full h-[80vh] flex flex-col shadow-2xl"
          @click.stop
          style="margin-bottom: 0;"
        >
          <!-- Chat Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 rounded-t-3xl shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <img 
                    :src="request?.product_main_image || '/placeholder.jpg'" 
                    :alt="request?.product_name"
                    class="w-12 h-12 rounded-xl object-cover shadow-md ring-2 ring-white"
                  />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg">{{ request?.product_name }}</h3>
                  <p class="text-sm text-gray-500 flex items-center">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {{ request?.store_name }}
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
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white min-h-0">
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
                    'max-w-xs lg:max-w-md px-5 py-3 rounded-xl shadow-sm',
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
          <div class="bg-white border-t border-gray-100 p-6 shadow-lg flex-shrink-0">
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

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  AlertCircle, CheckCircle, Eye, X, MessageCircle, Send
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const request = ref(null)
const loading = ref(false)
const error = ref('')

// History modal
const showHistoryModal = ref(false)
const requestHistory = ref([])
const loadingHistory = ref(false)

// Chat modal
const showChatModal = ref(false)
const chatMessages = ref([])
const loadingChat = ref(false)
const newMessage = ref('')
const sendingMessage = ref(false)

const fetchRequest = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await apiService.getViewingRequest(route.params.id)
    request.value = response.data
    
  } catch (err) {
    console.error('Failed to fetch viewing request:', err)
    error.value = 'Failed to load viewing request'
  } finally {
    loading.value = false
  }
}

const viewRequestHistory = async () => {
  if (!request.value) return
  
  try {
    showHistoryModal.value = true
    loadingHistory.value = true
    
    const response = await apiService.getViewingRequestHistory(request.value.id)
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

const openChat = async () => {
  if (!request.value) return
  
  try {
    showChatModal.value = true
    loadingChat.value = true
    
    const response = await apiService.getChatMessages({
      viewing_request: request.value.id
    })
    
    let messages = []
    if (Array.isArray(response.data)) {
      messages = response.data
    } else if (response.data && Array.isArray(response.data.results)) {
      messages = response.data.results
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      messages = response.data.data
    }
    
    chatMessages.value = messages
    
    apiService.markAllMessagesAsRead(request.value.id)
      .then(() => console.log('Messages marked as read successfully'))
      .catch((readError) => console.error('Failed to mark messages as read:', readError))
    
  } catch (err) {
    console.error('Failed to open chat:', err)
    chatMessages.value = []
  } finally {
    loadingChat.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !request.value) return
  
  try {
    sendingMessage.value = true
    
    const response = await apiService.sendChatMessage({
      viewing_request: request.value.id,
      content: newMessage.value.trim(),
      message_type: 'text',
      sender_type: 'SHOPPER'
    })
    
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
  chatMessages.value = []
  newMessage.value = ''
}

onMounted(() => {
  fetchRequest()
})
</script>

