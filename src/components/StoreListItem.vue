<template>
  <div 
    @click="$emit('click')"
    class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
  >
    <div class="flex items-start space-x-6">
      <!-- Store Image -->
      <div class="flex-shrink-0">
        <div class="relative">
          <img
            :src="store.logo || '/placeholder-store.jpg'"
            :alt="store.store_name"
            class="w-20 h-20 rounded-xl object-cover"
          />
          <!-- Verification Badge -->
          <div v-if="store.is_verified" class="absolute -top-1 -right-1">
            <CheckCircle class="w-6 h-6 text-green-500 bg-white rounded-full" />
          </div>
        </div>
      </div>

      <!-- Store Details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <!-- Store Name and Badges -->
            <div class="flex items-center mb-2">
              <h3 class="text-xl font-semibold text-gray-900 mr-3">{{ store.store_name }}</h3>
              <div class="flex space-x-2">
                <span v-if="store.is_featured" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Crown class="w-3 h-3 mr-1" />
                  Featured
                </span>
                <span v-if="store.free_shipping" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Truck class="w-3 h-3 mr-1" />
                  Free Shipping
                </span>
              </div>
            </div>

            <!-- Rating -->
            <div class="flex items-center mb-3">
              <div class="flex">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="i <= (store.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                  class="w-4 h-4 fill-current"
                />
              </div>
              <span class="ml-2 text-sm text-gray-600">
                {{ store.rating?.toFixed(1) || 0 }} ({{ store.review_count || 0 }} reviews)
              </span>
            </div>

            <!-- Description -->
            <p class="text-gray-600 mb-4 line-clamp-2">{{ store.description }}</p>

            <!-- Store Info -->
            <div class="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div v-if="store.location" class="flex items-center">
                <MapPin class="w-4 h-4 mr-1" />
                {{ store.location }}
              </div>
              <div class="flex items-center">
                <Package class="w-4 h-4 mr-1" />
                {{ formatNumber(store.product_count || 0) }} products
              </div>
              <div class="flex items-center">
                <Users class="w-4 h-4 mr-1" />
                {{ formatNumber(store.follower_count || 0) }} followers
              </div>
              <div class="flex items-center">
                <ShoppingBag class="w-4 h-4 mr-1" />
                {{ formatNumber(store.order_count || 0) }} orders
              </div>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in store.tags?.slice(0, 4)" 
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {{ tag }}
              </span>
              <span 
                v-if="store.tags?.length > 4"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                +{{ store.tags.length - 4 }} more
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col items-end space-y-3 ml-6">
            <!-- Follow Button -->
            <button
              @click.stop="$emit('toggle-follow', store)"
              :class="store.is_following 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              class="flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
            >
              <Heart 
                :class="store.is_following ? 'fill-current' : ''" 
                class="w-4 h-4 mr-2" 
              />
              {{ store.is_following ? 'Following' : 'Follow' }}
            </button>

            <!-- Store Rating Score -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ store.rating?.toFixed(1) || 0 }}</div>
              <div class="text-xs text-gray-500">Store Rating</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            @click.stop="$emit('view-products', store)"
            class="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Products
          </button>
          <button
            @click.stop="$emit('contact-store', store)"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageCircle class="w-4 h-4 mr-2 inline" />
            Contact
          </button>
          <button
            @click.stop="$emit('view-reviews', store)"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Star class="w-4 h-4 mr-2 inline" />
            Reviews
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Star, Heart, Crown, CheckCircle, Truck, MapPin, MessageCircle,
  Package, Users, ShoppingBag
} from 'lucide-vue-next'

// Props
defineProps({
  store: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['click', 'toggle-follow', 'view-products', 'contact-store', 'view-reviews'])

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>