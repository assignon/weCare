<template>
  <div class="min-h-screen bg-white pb-20">
    <BackButtonHeader :title="$t('listings.inquiries_title')" />

    <div class="p-3 pt-4">
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-gray-400" />
      </div>
      <div v-else-if="inquiries.length === 0" class="text-center py-12">
        <MessageCircle class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-xs text-gray-500">{{ $t('listings.no_inquiries_yet') }}</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="inquiry in inquiries" :key="inquiry.id" @click="$router.push(`/listing-chat/${inquiry.id}`)"
          class="bg-white rounded-lg border border-gray-200 p-2.5 cursor-pointer hover:bg-gray-50 transition">
          <div class="flex gap-2">
            <img v-if="inquiry.listing_main_image" :src="inquiry.listing_main_image" class="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-0.5">
                <h3 class="text-xs font-semibold text-gray-900 truncate">{{ inquiry.buyer_name }}</h3>
                <span v-if="inquiry.unread_count > 0" class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {{ inquiry.unread_count }}
                </span>
              </div>
              <p class="text-xs text-gray-600 truncate mb-0.5">{{ inquiry.listing_title }}</p>
              <p v-if="inquiry.offer_price" class="text-xs text-blue-600 font-medium mb-0.5">
                {{ $t('listings.offer') }}: {{ formatPrice(inquiry.offer_price) }}
              </p>
              <p v-if="inquiry.last_message" class="text-xs text-gray-500 truncate">{{ inquiry.last_message.content }}</p>
              <span class="text-xs text-gray-400 mt-0.5 block">{{ formatDate(inquiry.created_at) }}</span>
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
import { useI18n } from 'vue-i18n'
import { useListingStore } from '@/stores/listing'
import { useCurrency } from '@/composables/useCurrency'
import { MessageCircle, Loader2 } from 'lucide-vue-next'
import BottomNavigation from '@/components/BottomNavigation.vue'
import BackButtonHeader from '@/components/BackButtonHeader.vue'

const { t } = useI18n()
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
  if (days === 0) return t('listings.today')
  if (days === 1) return t('listings.yesterday')
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

