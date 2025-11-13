<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <BackButtonHeader title="Inquiries" />

    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-8"><Loader2 class="w-8 h-8 animate-spin" /></div>
      <div v-else-if="inquiries.length === 0" class="text-center py-12">
        <MessageCircle class="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">No inquiries yet</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="inquiry in inquiries" :key="inquiry.id" @click="$router.push(`/listing-chat/${inquiry.id}`)"
          class="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition">
          <div class="flex gap-3">
            <img v-if="inquiry.listing_main_image" :src="inquiry.listing_main_image" class="w-16 h-16 object-cover rounded" />
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate">{{ inquiry.buyer_name }}</h3>
              <p class="text-sm text-gray-600">{{ inquiry.listing_title }}</p>
              <p v-if="inquiry.offer_price" class="text-sm text-blue-600 font-medium">Offer: {{ formatPrice(inquiry.offer_price) }}</p>
              <p v-if="inquiry.last_message" class="text-sm text-gray-500 truncate mt-1">{{ inquiry.last_message.content }}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span v-if="inquiry.unread_count > 0" class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {{ inquiry.unread_count }}
              </span>
              <span class="text-xs text-gray-400">{{ formatDate(inquiry.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { MessageCircle, Loader2 } from 'lucide-vue-next'
import BottomNavigation from '@/components/BottomNavigation.vue'
import BackButtonHeader from '@/components/BackButtonHeader.vue'

const listingStore = useListingStore()
const { formatPrice } = useCurrency()

const inquiries = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await listingStore.fetchSellerInquiries()
    inquiries.value = listingStore.inquiries
  } finally {
    loading.value = false
  }
})

function formatDate(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return d.toLocaleDateString()
}
</script>

