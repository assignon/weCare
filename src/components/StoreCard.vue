<template>
  <div 
    @click="$emit('click')"
    class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
  >
    <!-- Store Banner -->
    <div class="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
      <img
        v-if="store.banner_image"
        :src="store.banner_image"
        :alt="store.store_name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div class="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col space-y-2">
        <span v-if="store.is_featured" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Crown class="w-3 h-3 mr-1" />
          Featured
        </span>
        <span v-if="store.is_verified" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle class="w-3 h-3 mr-1" />
          Verified
        </span>
        <span v-if="store.free_shipping" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Truck class="w-3 h-3 mr-1" />
          Free Shipping
        </span>
      </div>

      <!-- Follow Button -->
      <button
        @click.stop="$emit('toggle-follow', store)"
        class="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
      >
        <Heart 
          :class="store.is_following ? 'text-red-500 fill-current' : 'text-gray-600'" 
          class="w-4 h-4" 
        />
      </button>
    </div>

    <!-- Store Info -->
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center flex-1 min-w-0">
          <img
            :src="store.logo || '/placeholder-store.jpg'"
            :alt="store.store_name"
            class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
          />
          <div class="ml-3 min-w-0 flex-1">
            <h3 class="font-semibold text-gray-900 truncate">{{ store.store_name }}</h3>
            <div class="flex items-center mt-1">
              <div class="flex">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="i <= (store.rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                  class="w-4 h-4 fill-current"
                />
              </div>
              <span class="ml-1 text-sm text-gray-500">({{ store.review_count || 0 }})</span>
            </div>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ store.description }}</p>

      <!-- Store Stats -->
      <div class="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <div class="text-lg font-bold text-gray-900">{{ formatNumber(store.product_count || 0) }}</div>
          <div class="text-xs text-gray-500">Products</div>
        </div>
        <div>
          <div class="text-lg font-bold text-gray-900">{{ formatNumber(store.follower_count || 0) }}</div>
          <div class="text-xs text-gray-500">Followers</div>
        </div>
        <div>
          <div class="text-lg font-bold text-gray-900">{{ formatNumber(store.order_count || 0) }}</div>
          <div class="text-xs text-gray-500">Orders</div>
        </div>
      </div>

      <!-- Store Tags -->
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="tag in store.tags?.slice(0, 3)" 
          :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
        >
          {{ tag }}
        </span>
        <span 
          v-if="store.tags?.length > 3"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
        >
          +{{ store.tags.length - 3 }} more
        </span>
      </div>

      <!-- Location -->
      <div v-if="store.location" class="mt-3 flex items-center text-sm text-gray-500">
        <MapPin class="w-4 h-4 mr-1" />
        {{ store.location }}
      </div>
    </div>

    <!-- Store Actions -->
    <div class="px-6 pb-6">
      <div class="flex space-x-3">
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
          <MessageCircle class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Heart, Crown, CheckCircle, Truck, MapPin, MessageCircle } from 'lucide-vue-next'

// Props
defineProps({
  store: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['click', 'toggle-follow', 'view-products', 'contact-store'])

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