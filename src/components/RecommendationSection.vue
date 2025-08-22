<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
          <component :is="iconComponent" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-600">{{ subtitle }}</p>
        </div>
      </div>
      
      <button
        v-if="products.length > 0"
        @click="$emit('view-all')"
        class="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        View All
        <ArrowRight class="w-4 h-4 ml-1" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="animate-pulse">
        <div class="bg-gray-300 aspect-square rounded-xl mb-3"></div>
        <div class="h-4 bg-gray-300 rounded mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-8">
      <Package class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm">No recommendations available</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="product in displayProducts"
        :key="product.id"
        @click="$emit('product-click', product)"
        class="group cursor-pointer"
      >
        <!-- Product Card -->
        <div class="relative bg-gray-50 rounded-xl overflow-hidden aspect-square mb-3 group-hover:shadow-lg transition-all duration-200">
          <img
            :src="product.images?.[0]?.image || '/placeholder-product.jpg'"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          <!-- Badges -->
          <div class="absolute top-2 left-2 flex flex-col space-y-1">
            <span v-if="highlightType === 'deal' && product.discount_percentage" 
                  class="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
              -{{ product.discount_percentage }}%
            </span>
            <span v-if="product.is_new" 
                  class="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-lg">
              New
            </span>
            <span v-if="product.is_trending" 
                  class="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg">
              🔥 Trending
            </span>
            <span v-if="product.recommendation_score && product.recommendation_score > 0.8" 
                  class="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-lg">
              ✨ Perfect Match
            </span>
          </div>

          <!-- Wishlist Button -->
          <button
            @click.stop="$emit('toggle-wishlist', product)"
            class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart 
              :class="product.is_wishlisted ? 'text-red-500 fill-current' : 'text-gray-400'" 
              class="w-4 h-4" 
            />
          </button>

          <!-- Quick Add Button -->
          <div class="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              @click.stop="$emit('add-to-cart', product)"
              :disabled="!product.in_stock"
              class="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ product.in_stock ? 'Add to Cart' : 'Out of Stock' }}
            </button>
          </div>

          <!-- AI Confidence Score -->
          <div v-if="product.recommendation_score" 
               class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg">
            {{ Math.round(product.recommendation_score * 100) }}% match
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-1">
          <h4 class="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {{ product.name }}
          </h4>
          
          <!-- Rating -->
          <div v-if="product.rating" class="flex items-center">
            <div class="flex">
              <Star
                v-for="i in 5"
                :key="i"
                :class="i <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
                class="w-3 h-3 fill-current"
              />
            </div>
            <span class="ml-1 text-xs text-gray-500">({{ product.review_count || 0 }})</span>
          </div>

          <!-- Price -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900 text-sm">{{ formatPrice(product.price) }}</span>
              <span v-if="product.compare_at_price" class="text-xs text-gray-500 line-through">
                {{ formatPrice(product.compare_at_price) }}
              </span>
            </div>
            <span class="text-xs text-gray-500">{{ product.store_name }}</span>
          </div>

          <!-- AI Insight Tag -->
          <div v-if="product.ai_insight" class="flex items-center text-xs text-purple-600">
            <Sparkles class="w-3 h-3 mr-1" />
            {{ product.ai_insight }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendation Feedback -->
    <div v-if="products.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">How relevant are these recommendations?</span>
        <div class="flex space-x-2">
          <button
            @click="provideFeedback('helpful')"
            class="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            :class="{ 'bg-green-50': feedback === 'helpful' }"
          >
            <ThumbsUp class="w-4 h-4 mr-1" />
            Helpful
          </button>
          <button
            @click="provideFeedback('not_helpful')"
            class="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            :class="{ 'bg-red-50': feedback === 'not_helpful' }"
          >
            <ThumbsDown class="w-4 h-4 mr-1" />
            Not Helpful
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCurrency } from '@/composables/useCurrency'
import { apiService } from '@/services/api'
import {
  ArrowRight, Package, Heart, Star, Sparkles, ThumbsUp, ThumbsDown,
  TrendingUp, Eye, Tag, Grid, Zap
} from 'lucide-vue-next'

const { formatPrice } = useCurrency()

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'Package'
  },
  highlightType: {
    type: String,
    default: 'default' // 'deal', 'trending', 'personalized'
  },
  maxDisplay: {
    type: Number,
    default: 4
  }
})

// Emit
defineEmits([
  'view-all',
  'product-click',
  'add-to-cart',
  'toggle-wishlist'
])

// State
const feedback = ref(null)

// Computed
const iconComponent = computed(() => {
  const icons = {
    Package,
    Sparkles,
    TrendingUp,
    Eye,
    Tag,
    Grid,
    Zap
  }
  return icons[props.icon] || Package
})

const displayProducts = computed(() => {
  return props.products.slice(0, props.maxDisplay)
})

// Methods
const provideFeedback = async (type) => {
  feedback.value = type
  
  try {
    await apiService.submitRecommendationFeedback({
      section: props.title,
      feedback_type: type,
      products: props.products.map(p => p.id)
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
  }
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