<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <BackButtonHeader :title="inquiry?.listing_title || $t('listings.chat')">
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
        <div v-if="isOfferMessage(msg)" :class="msg.is_own_message ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'" class="max-w-[75%] rounded-lg px-4 py-3 shadow-md">
          <div class="flex items-center gap-2 mb-2">
            <Gavel class="w-4 h-4" />
            <span class="text-xs font-semibold uppercase tracking-wide">{{ $t('listings.offer') }}</span>
          </div>
          <!-- Always show the offer price from inquiry if available -->
          <div v-if="offerPrice || inquiry?.offer_price" class="text-lg font-bold mb-2">
            {{ formattedOfferPrice || (inquiry?.offer_price ? formatPrice(inquiry.offer_price) : '') }}
          </div>
          <div v-else-if="extractOfferFromMessage(msg.content)" class="text-lg font-bold mb-2">{{ extractOfferFromMessage(msg.content) }}</div>
          <!-- Show message content with price replaced -->
          <p v-if="msg.content && msg.content !== getDefaultOfferMessage() && !isOnlyOfferPrice(msg.content)" class="text-sm opacity-90 mb-1">{{ formatMessageContent(msg.content) }}</p>
          <p v-else-if="msg.content" class="text-sm opacity-90 mb-1">{{ formatMessageContent(msg.content) }}</p>
          <p class="text-xs mt-2 opacity-70">{{ formatTime(msg.created_at) }}</p>
        </div>
        
        <!-- Regular Message Template -->
        <div v-else :class="msg.is_own_message ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'" class="max-w-[75%] rounded-lg px-4 py-2">
          <p>{{ formatMessageContent(msg.content) }}</p>
          <p class="text-xs mt-1 opacity-70">{{ formatTime(msg.created_at) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white border-t p-4">
      <div class="flex gap-2 max-w-4xl mx-auto">
        <input v-model="newMessage" @keyup.enter="sendMessage" :placeholder="$t('listings.type_message_placeholder')" class="flex-1 px-4 py-2 border rounded-lg max-w-md" />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex-shrink-0">
          <Send class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { Send, Gavel, RefreshCw } from 'lucide-vue-next'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import apiService from '@/services/api'

const { t } = useI18n()

const route = useRoute()
const listingStore = useListingStore()
const { formatPrice } = useCurrency()

const inquiry = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)
const refreshing = ref(false)
const pollInterval = ref(null)

// Computed property to ensure offer price is always available
const offerPrice = computed(() => {
  return inquiry.value?.offer_price || null
})

// Computed property for formatted offer price
const formattedOfferPrice = computed(() => {
  if (!offerPrice.value) return null
  return formatPrice(offerPrice.value)
})

// Watch for inquiry changes to ensure price is available
watch(() => inquiry.value?.offer_price, (newPrice) => {
  if (newPrice) {
    console.log('Offer price updated:', newPrice, 'Formatted:', formatPrice(newPrice))
  }
}, { immediate: true })

onMounted(async () => {
  await fetchInquiry()
  await fetchMessages()
  scrollToBottom()
  // Poll for new messages every minute (also refresh inquiry to get updated offer_price)
  pollInterval.value = setInterval(async () => {
    await fetchInquiry()
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
    // Debug: Log full inquiry data to understand structure
    console.log('Inquiry loaded:', {
      id: inquiry.value?.id,
      offer_price: inquiry.value?.offer_price,
      full_inquiry: inquiry.value
    })
    // Debug: Log offer price to ensure it's available
    if (inquiry.value?.offer_price) {
      console.log('✅ Offer price loaded:', inquiry.value.offer_price, 'Formatted:', formatPrice(inquiry.value.offer_price))
    } else {
      console.warn('⚠️ No offer_price found in inquiry. Available fields:', Object.keys(inquiry.value || {}))
    }
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
  return t('listings.like_to_buy_for', { price: formatPrice(inquiry.value.offer_price) })
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

function formatMessageContent(content) {
  if (!content) return content
  
  // Check if content contains price placeholders (both {{price}} and {price})
  const hasDoubleBrace = content.includes('{{price}}')
  const hasSingleBrace = content.includes('{price}')
  
  if (!hasDoubleBrace && !hasSingleBrace) return content
  
  // Priority 1: Use the computed formatted offer price (buyer's offer from inquiry)
  // This is reactive and will update when inquiry is loaded
  let formattedPrice = formattedOfferPrice.value
  
  // Priority 2: If computed price is not available, try to get from inquiry directly
  if (!formattedPrice && inquiry.value?.offer_price) {
    formattedPrice = formatPrice(inquiry.value.offer_price)
  }
  
  // Priority 3: If inquiry doesn't have offer_price, try to extract from message content
  if (!formattedPrice) {
    const extractedPrice = extractOfferFromMessage(content)
    if (extractedPrice) {
      formattedPrice = extractedPrice
    }
  }
  
  // Priority 4: Try to find any price number in the message content itself
  if (!formattedPrice) {
    const numberMatch = content.match(/(\d+(?:[.,]\d+)?)/)
    if (numberMatch && numberMatch[1]) {
      const price = parseFloat(numberMatch[1].replace(/,/g, '.'))
      if (price > 0) {
        formattedPrice = formatPrice(price)
      }
    }
  }
  
  // Debug log to help troubleshoot
  if ((hasDoubleBrace || hasSingleBrace)) {
    console.log('formatMessageContent:', {
      content,
      hasDoubleBrace,
      hasSingleBrace,
      formattedPrice,
      offerPriceValue: offerPrice.value,
      formattedOfferPriceValue: formattedOfferPrice.value,
      inquiryOfferPrice: inquiry.value?.offer_price,
      hasInquiry: !!inquiry.value
    })
  }
  
  // Replace both {price} and {{price}} patterns if we have a price
  if (formattedPrice) {
    // Replace {{price}} first (with double braces), then {price} (with single brace)
    let result = content
    if (hasDoubleBrace) {
      result = result.replace(/\{\{price\}\}/g, formattedPrice)
    }
    if (hasSingleBrace) {
      result = result.replace(/\{price\}/g, formattedPrice)
    }
    console.log('formatMessageContent: Replaced price placeholder. Original:', content, 'Result:', result)
    return result
  }
  
  // If still no price found, remove the placeholder to avoid showing {{price}}
  let result = content
  if (hasDoubleBrace) {
    result = result.replace(/\{\{price\}\}/g, '')
  }
  if (hasSingleBrace) {
    result = result.replace(/\{price\}/g, '')
  }
  return result
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  
  try {
    await listingStore.sendMessage(route.params.inquiryId, newMessage.value)
    newMessage.value = ''
    await fetchMessages()
    scrollToBottom()
  } catch (error) {
    alert(t('listings.failed_to_send_message'))
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
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

