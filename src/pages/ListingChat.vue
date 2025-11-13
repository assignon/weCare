<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <BackButtonHeader :title="inquiry?.listing_title || 'Chat'">
      <template #right>
        <button 
          @click="refreshMessages" 
          :disabled="refreshing"
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw :class="{ 'animate-spin': refreshing }" class="w-5 h-5 text-gray-700" />
        </button>
      </template>
    </BackButtonHeader>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-for="msg in messages" :key="msg.id" :class="msg.is_own_message ? 'flex justify-end' : 'flex justify-start'">
        <!-- Offer Message Template -->
        <div v-if="isOfferMessage(msg)" :class="msg.is_own_message ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'" class="max-w-[75%] rounded-lg px-4 py-3 shadow-md">
          <div class="flex items-center gap-2 mb-2">
            <Gavel class="w-4 h-4" />
            <span class="text-xs font-semibold uppercase tracking-wide">Offer</span>
          </div>
          <div v-if="inquiry?.offer_price" class="text-lg font-bold mb-2">{{ formatPrice(inquiry.offer_price) }}</div>
          <div v-else-if="extractOfferFromMessage(msg.content)" class="text-lg font-bold mb-2">{{ extractOfferFromMessage(msg.content) }}</div>
          <p v-if="msg.content && msg.content !== getDefaultOfferMessage() && !isOnlyOfferPrice(msg.content)" class="text-sm opacity-90 mb-1">{{ msg.content }}</p>
          <p class="text-xs mt-2 opacity-70">{{ formatTime(msg.created_at) }}</p>
        </div>
        
        <!-- Regular Message Template -->
        <div v-else :class="msg.is_own_message ? 'bg-blue-600 text-white' : 'bg-white'" class="max-w-[75%] rounded-lg px-4 py-2">
          <p>{{ msg.content }}</p>
          <p class="text-xs mt-1 opacity-70">{{ formatTime(msg.created_at) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white border-t p-4">
      <div class="flex gap-2">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." class="flex-1 px-4 py-2 border rounded-full" />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50">
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { Send, Gavel, RefreshCw } from 'lucide-vue-next'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import apiService from '@/services/api'

const route = useRoute()
const listingStore = useListingStore()
const { formatPrice } = useCurrency()

const inquiry = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)
const refreshing = ref(false)
const pollInterval = ref(null)

onMounted(async () => {
  await fetchInquiry()
  await fetchMessages()
  scrollToBottom()
  // Poll for new messages every minute
  pollInterval.value = setInterval(async () => {
    await fetchMessages()
  }, 60000) // 60 seconds = 1 minute
})

onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
})

async function fetchInquiry() {
  const inquiryId = route.params.inquiryId
  if (!inquiryId) {
    console.error('Inquiry ID is missing from route params')
    return
  }
  try {
    const response = await apiService.getInquiry(inquiryId)
    inquiry.value = response.data
  } catch (error) {
    console.error('Failed to fetch inquiry:', error)
  }
}

async function fetchMessages() {
  const inquiryId = route.params.inquiryId
  if (!inquiryId) {
    console.error('Inquiry ID is missing from route params')
    return
  }
  try {
    messages.value = await listingStore.fetchMessages(inquiryId)
    scrollToBottom()
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  }
}

async function refreshMessages() {
  refreshing.value = true
  try {
    await fetchMessages()
    await fetchInquiry()
  } finally {
    refreshing.value = false
  }
}

function isOfferMessage(msg) {
  // Check if inquiry has an offer_price - only show offer template if there's an actual offer
  if (!inquiry.value?.offer_price) return false
  
  // Sort messages by creation time to find the first message
  const sortedMessages = [...messages.value].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const firstMessage = sortedMessages[0]
  
  // Primary check: If this is the first message in the conversation and inquiry has offer_price, it's the offer message
  // This works for both buyer and seller since the first message is always the offer message when offer_price exists
  if (firstMessage && msg.id === firstMessage.id) {
    return true
  }
  
  // Secondary check: If message content matches the inquiry's initial message field
  // This is the message that was sent when the inquiry was created with the offer
  if (inquiry.value.message) {
    const inquiryMessage = inquiry.value.message.trim()
    const msgContent = msg.content.trim()
    if (inquiryMessage && msgContent === inquiryMessage) {
      return true
    }
  }
  
  return false
}

function getDefaultOfferMessage() {
  if (!inquiry.value?.offer_price) return ''
  return `I'd like to buy it for ${formatPrice(inquiry.value.offer_price)}`
}

function extractOfferFromMessage(content) {
  // Try to extract price from message content if inquiry.offer_price is not available
  if (!content) return null
  
  // Look for patterns like "I'd like to buy it for 50000 FCA" or just numbers
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:FCA|CFA|FCFA|XOF)/i,
    /for\s+(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)/
  ]
  
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      const price = parseFloat(match[1].replace(/,/g, '.'))
      if (price > 0) {
        return formatPrice(price)
      }
    }
  }
  
  return null
}

function isOnlyOfferPrice(content) {
  // Check if message is just the default offer message
  if (!content) return false
  const defaultMsg = getDefaultOfferMessage()
  return content.trim() === defaultMsg.trim()
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  
  try {
    await listingStore.sendMessage(route.params.inquiryId, newMessage.value)
    newMessage.value = ''
    await fetchMessages()
    scrollToBottom()
  } catch (error) {
    alert('Failed to send message')
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

