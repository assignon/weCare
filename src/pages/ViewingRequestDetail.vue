<template>
  <div class="page-container pb-24">
    <!-- Header -->
    <BackButtonHeader :title="$t('rendezvous.viewing_request')">
      <template #right>
        <button
          v-if="request"
          @click="openChat"
          class="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center space-x-2 shadow-card"
        >
          <MessageCircle class="w-4 h-4" />
          <span>{{ $t('rendezvous.chat') }}</span>
        </button>
      </template>
    </BackButtonHeader>

    <!-- Loading State -->
    <div v-if="loading" class="px-4 py-8">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-navy/20 border-t-navy"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="px-4 py-8">
      <div class="bg-error-50 rounded-2xl p-4">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-error-600 mr-3" />
          <span class="text-error-600 font-medium">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Request Details -->
    <div v-if="!loading && request" class="px-4 py-4 space-y-4">
      <!-- Product Card -->
      <div class="card p-4">
        <div class="flex items-center space-x-4">
          <img 
            :src="request.product_main_image || '/placeholder.jpg'" 
            :alt="request.product_name"
            class="w-20 h-20 rounded-2xl object-cover"
          />
          <div class="flex-1">
            <h2 class="font-bold text-navy text-lg mb-1">{{ request.product_name }}</h2>
            <p class="text-sm text-grey-400 mb-2">{{ request.store_name }}</p>
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
      <div class="card p-4">
        <h3 class="font-semibold text-navy mb-4">{{ $t('rendezvous.request_information') }}</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-grey-400 mb-1">{{ $t('rendezvous.preferred_date') }}</p>
              <p class="text-sm font-medium text-navy">{{ formatDate(request.preferred_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-grey-400 mb-1">{{ $t('rendezvous.preferred_time') }}</p>
              <p class="text-sm font-medium text-navy">{{ formatTime(request.preferred_time) }}</p>
            </div>
          </div>
          <div>
            <p class="text-xs text-grey-400 mb-1">{{ $t('rendezvous.requested_on') }}</p>
            <p class="text-sm font-medium text-navy">{{ formatDateTime(request.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Scheduled Details (if scheduled) -->
      <div v-if="request.status === 'SCHEDULED' && request.scheduled_date" class="bg-success-50 rounded-2xl border border-success-200 p-4">
        <div class="flex items-center mb-3">
          <CheckCircle class="w-5 h-5 text-success-600 mr-2" />
          <h3 class="font-semibold text-success-800">{{ $t('rendezvous.viewing_scheduled') }}</h3>
        </div>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-success-600 mb-1">{{ $t('rendezvous.scheduled_date') }}</p>
              <p class="text-sm font-medium text-success-800">{{ formatDate(request.scheduled_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-success-600 mb-1">{{ $t('rendezvous.scheduled_time') }}</p>
              <p class="text-sm font-medium text-success-800">{{ formatTime(request.scheduled_time) }}</p>
            </div>
          </div>
          <div v-if="request.viewing_location">
            <p class="text-xs text-success-600 mb-1">{{ $t('rendezvous.location') }}</p>
            <p class="text-sm font-medium text-success-800">{{ request.viewing_location }}</p>
          </div>
        </div>
      </div>

      <!-- Seller Notes -->
      <div v-if="request.seller_notes" class="bg-navy/5 rounded-2xl p-4">
        <h3 class="font-semibold text-navy mb-2">{{ $t('rendezvous.seller_notes') }}</h3>
        <p class="text-sm text-navy/80">{{ request.seller_notes }}</p>
      </div>

      <!-- Your Message -->
      <div v-if="request.message" class="card-flat p-4">
        <h3 class="font-semibold text-navy mb-2">{{ $t('rendezvous.your_message') }}</h3>
        <p class="text-sm text-grey-500">{{ request.message }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3 pt-2">
        <button
          @click="viewRequestHistory"
          class="btn btn-outlined flex items-center justify-center space-x-2"
        >
          <Eye class="w-5 h-5" />
          <span>{{ $t('rendezvous.view_history') }}</span>
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
        class="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-float"
        @click.stop
      >
        <div class="sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl border-b border-grey-100 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-navy">{{ $t('rendezvous.request_history') }}</h3>
            <button 
              @click="showHistoryModal = false"
              class="w-8 h-8 rounded-full bg-grey-50 flex items-center justify-center hover:bg-grey-100 transition-colors"
            >
              <X class="w-5 h-5 text-grey-400" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="loadingHistory" class="space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="h-4 bg-grey-100 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-grey-100 rounded w-1/2"></div>
            </div>
          </div>
          
          <div v-else-if="requestHistory.length === 0" class="text-center py-8">
            <p class="text-grey-400">{{ $t('rendezvous.no_history_available') }}</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="history in requestHistory"
              :key="history.id"
              class="border-l-4 border-navy/20 pl-4 py-2"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-navy">
                  {{ history.old_status_display ? `${history.old_status_display} → ` : '' }}
                  {{ history.new_status_display }}
                </span>
                <span class="text-xs text-grey-400">{{ formatDateTime(history.changed_at) }}</span>
              </div>
              <p class="text-sm text-grey-400">{{ $t('rendezvous.by') }} {{ history.changed_by_name }}</p>
              <p v-if="history.notes" class="text-sm text-grey-500 mt-1">{{ history.notes }}</p>
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
          class="bg-white rounded-t-3xl w-full h-[80vh] flex flex-col shadow-float"
          @click.stop
          style="margin-bottom: 0;"
        >
          <!-- Chat Header -->
          <div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-grey-100 px-6 py-5 rounded-t-3xl shadow-nav">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <img 
                    :src="request?.product_main_image || '/placeholder.jpg'" 
                    :alt="request?.product_name"
                    class="w-12 h-12 rounded-2xl object-cover shadow-card ring-2 ring-white"
                  />
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 class="font-semibold text-navy text-lg">{{ request?.product_name }}</h3>
                  <p class="text-sm text-grey-400 flex items-center">
                    <span class="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
                    {{ request?.store_name }}
                  </p>
                </div>
              </div>
              <button 
                @click="closeChat"
                class="w-10 h-10 rounded-full bg-grey-50 hover:bg-grey-100 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <X class="w-5 h-5 text-grey-500" />
              </button>
            </div>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-grey-50/50 min-h-0">
            <div v-if="loadingChat" class="flex justify-center py-12">
              <div class="flex flex-col items-center space-y-3">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-navy/20 border-t-navy"></div>
                <p class="text-sm text-grey-400">{{ $t('rendezvous.loading_messages') }}</p>
              </div>
            </div>
            
            <div v-else-if="chatMessages.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle class="w-10 h-10 text-navy" />
              </div>
              <h3 class="text-lg font-semibold text-navy mb-2">{{ $t('rendezvous.start_conversation') }}</h3>
              <p class="text-grey-400">{{ $t('rendezvous.start_conversation_message') }}</p>
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
                    'max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-card',
                    message.sender_type === 'SELLER'
                      ? 'bg-navy text-white ml-12' 
                      : 'bg-navy/80 text-white mr-12'
                  ]"
                >
                  <p class="text-sm leading-relaxed">{{ message.content }}</p>
                  <p class="text-xs mt-2 opacity-70 text-white/70">
                    {{ formatDateTime(message.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="bg-white border-t border-grey-100 p-3 shadow-nav flex-shrink-0">
            <div class="flex items-end space-x-2">
              <div class="flex-1 relative">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  :placeholder="$t('rendezvous.type_your_message')"
                  class="input pr-10 text-sm"
                  :disabled="sendingMessage"
                />
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div v-if="sendingMessage" class="animate-spin rounded-full h-4 w-4 border-2 border-navy/20 border-t-navy"></div>
                </div>
              </div>
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || sendingMessage"
                class="w-10 h-10 bg-navy rounded-2xl flex items-center justify-center hover:bg-navy/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
              >
                <Send v-if="!sendingMessage" class="w-4 h-4 text-white" />
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
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  AlertCircle, CheckCircle, Eye, X, MessageCircle, Send
} from 'lucide-vue-next'

const { t } = useI18n()
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
    error.value = t('rendezvous.failed_to_load')
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
  return date.toLocaleDateString('fr-FR', { 
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
  return date.toLocaleTimeString('fr-FR', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: false 
  })
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
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
