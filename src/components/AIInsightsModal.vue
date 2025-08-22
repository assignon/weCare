<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-3">
                <Sparkles class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">AI Recommendation Insights</h3>
                <p class="text-purple-100 text-sm">Personalized suggestions based on your preferences</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-white hover:text-purple-100 transition-colors"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6 space-y-6">
          <!-- Product Summary -->
          <div v-if="product" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <img
              :src="product.images?.[0]?.image || '/placeholder-product.jpg'"
              :alt="product.name"
              class="w-16 h-16 object-cover rounded-xl"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ product.name }}</h4>
              <p class="text-sm text-gray-600">{{ product.store_name }}</p>
              <div class="flex items-center mt-1">
                <span class="font-bold text-lg text-gray-900">{{ formatPrice(product.price) }}</span>
                <span v-if="product.compare_at_price" class="ml-2 text-sm text-gray-500 line-through">
                  {{ formatPrice(product.compare_at_price) }}
                </span>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="space-y-4">
            <!-- Recommendation Score -->
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">Compatibility Score</h4>
                <div class="flex items-center">
                  <div class="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      class="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                      :style="{ width: `${(insights.compatibility_score || 0) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ Math.round((insights.compatibility_score || 0) * 100) }}%
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ insights.compatibility_explanation }}</p>
            </div>

            <!-- Preference Matches -->
            <div v-if="insights.preference_matches?.length > 0" class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="font-medium text-gray-900 mb-3">Why This Matches Your Preferences</h4>
              <div class="space-y-2">
                <div 
                  v-for="match in insights.preference_matches" 
                  :key="match.type"
                  class="flex items-center"
                >
                  <CheckCircle class="w-4 h-4 text-green-500 mr-2" />
                  <span class="text-sm text-gray-700">{{ match.description }}</span>
                  <span class="ml-auto text-xs text-gray-500">{{ match.confidence }}% match</span>
                </div>
              </div>
            </div>

            <!-- Similar Products You Liked -->
            <div v-if="insights.similar_products?.length > 0" class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="font-medium text-gray-900 mb-3">Based on Products You Liked</h4>
              <div class="grid grid-cols-3 gap-3">
                <div 
                  v-for="similarProduct in insights.similar_products.slice(0, 3)" 
                  :key="similarProduct.id"
                  class="text-center"
                >
                  <img
                    :src="similarProduct.image || '/placeholder-product.jpg'"
                    :alt="similarProduct.name"
                    class="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <p class="text-xs text-gray-600 line-clamp-2">{{ similarProduct.name }}</p>
                </div>
              </div>
            </div>

            <!-- Behavioral Insights -->
            <div v-if="insights.behavioral_insights" class="bg-white border border-gray-200 rounded-xl p-4">
              <h4 class="font-medium text-gray-900 mb-3">Your Shopping Behavior</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ insights.behavioral_insights.avg_price_range }}</div>
                  <div class="text-xs text-gray-500">Usual Price Range</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ insights.behavioral_insights.favorite_categories?.join(', ') }}</div>
                  <div class="text-xs text-gray-500">Favorite Categories</div>
                </div>
              </div>
            </div>

            <!-- Trending Insights -->
            <div v-if="insights.trending_context" class="bg-white border border-gray-200 rounded-xl p-4">
              <div class="flex items-center mb-3">
                <TrendingUp class="w-4 h-4 text-orange-500 mr-2" />
                <h4 class="font-medium text-gray-900">Trending Context</h4>
              </div>
              <p class="text-sm text-gray-600">{{ insights.trending_context.description }}</p>
              <div class="mt-2 flex items-center text-sm">
                <span class="text-gray-500">Popular in your area:</span>
                <span class="ml-1 font-medium text-orange-600">{{ insights.trending_context.popularity_rank }}% of users viewed this</span>
              </div>
            </div>

            <!-- Personalization Tips -->
            <div v-if="insights.personalization_tips?.length > 0" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="flex items-center mb-3">
                <Lightbulb class="w-4 h-4 text-blue-500 mr-2" />
                <h4 class="font-medium text-gray-900">Tips to Improve Your Recommendations</h4>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="tip in insights.personalization_tips" 
                  :key="tip.id"
                  class="flex items-start"
                >
                  <ArrowRight class="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span class="text-sm text-gray-700">{{ tip.suggestion }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                @click="provideFeedback('helpful')"
                :class="feedback === 'helpful' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'"
                class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ThumbsUp class="w-4 h-4 mr-1" />
                Helpful
              </button>
              <button
                @click="provideFeedback('not_helpful')"
                :class="feedback === 'not_helpful' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'"
                class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ThumbsDown class="w-4 h-4 mr-1" />
                Not Helpful
              </button>
            </div>
            
            <div class="flex space-x-3">
              <button
                @click="$emit('close')"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                @click="applyInsights"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCurrency } from '@/composables/useCurrency'
import { apiService } from '@/services/api'
import {
  X, Sparkles, CheckCircle, TrendingUp, Lightbulb, ArrowRight,
  ThumbsUp, ThumbsDown
} from 'lucide-vue-next'

const { formatPrice } = useCurrency()

// Props
const props = defineProps({
  product: {
    type: Object,
    default: null
  },
  insights: {
    type: Object,
    default: () => ({})
  }
})

// Emit
const emit = defineEmits(['close', 'apply-insights'])

// State
const feedback = ref(null)

// Methods
const provideFeedback = async (type) => {
  feedback.value = type
  
  try {
    await apiService.submitAIInsightsFeedback({
      product_id: props.product?.id,
      feedback_type: type,
      insights_shown: props.insights
    })
  } catch (error) {
    console.error('Error submitting insights feedback:', error)
  }
}

const applyInsights = () => {
  emit('apply-insights', {
    compatibility_score: props.insights.compatibility_score,
    preference_matches: props.insights.preference_matches,
    behavioral_insights: props.insights.behavioral_insights,
    personalization_tips: props.insights.personalization_tips
  })
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