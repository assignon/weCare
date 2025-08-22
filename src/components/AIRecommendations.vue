<template>
  <div class="space-y-8">
    <!-- Personalized Recommendations -->
    <RecommendationSection
      title="Recommended for You"
      subtitle="Based on your browsing history and preferences"
      :products="personalizedRecommendations"
      :loading="loading.personalized"
      icon="Sparkles"
      @view-all="viewAllRecommendations('personalized')"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
      @toggle-wishlist="handleToggleWishlist"
    />

    <!-- Trending Products -->
    <RecommendationSection
      title="Trending Now"
      subtitle="Popular products in your area"
      :products="trendingProducts"
      :loading="loading.trending"
      icon="TrendingUp"
      @view-all="viewAllRecommendations('trending')"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
      @toggle-wishlist="handleToggleWishlist"
    />

    <!-- Similar to Recently Viewed -->
    <RecommendationSection
      v-if="recentlyViewed.length > 0"
      title="More Like What You've Seen"
      subtitle="Similar to your recently viewed items"
      :products="similarProducts"
      :loading="loading.similar"
      icon="Eye"
      @view-all="viewAllRecommendations('similar')"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
      @toggle-wishlist="handleToggleWishlist"
    />

    <!-- Category-Based Recommendations -->
    <RecommendationSection
      v-for="category in categoryRecommendations"
      :key="category.id"
      :title="`Popular in ${category.name}`"
      :subtitle="`Top products in ${category.name.toLowerCase()}`"
      :products="category.products"
      :loading="loading.categories"
      icon="Package"
      @view-all="viewCategoryProducts(category.id)"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
      @toggle-wishlist="handleToggleWishlist"
    />

    <!-- Featured Deals -->
    <RecommendationSection
      title="Featured Deals"
      subtitle="Limited time offers you might love"
      :products="featuredDeals"
      :loading="loading.featured"
      icon="Tag"
      highlight-type="deal"
      @view-all="viewAllRecommendations('deals')"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
      @toggle-wishlist="handleToggleWishlist"
    />

    <!-- AI Insights Modal -->
    <AIInsightsModal
      v-if="showInsights"
      :product="selectedProduct"
      :insights="aiInsights"
      @close="showInsights = false"
      @apply-insights="applyRecommendationInsights"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import RecommendationSection from './RecommendationSection.vue'
import AIInsightsModal from './AIInsightsModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()

// Props
const props = defineProps({
  currentProduct: {
    type: Object,
    default: null
  },
  category: {
    type: Object,
    default: null
  },
  maxRecommendations: {
    type: Number,
    default: 8
  }
})

// Emit
const emit = defineEmits(['recommendation-click', 'category-browse'])

// State
const loading = reactive({
  personalized: false,
  trending: false,
  similar: false,
  categories: false,
  featured: false
})

const personalizedRecommendations = ref([])
const trendingProducts = ref([])
const similarProducts = ref([])
const categoryRecommendations = ref([])
const featuredDeals = ref([])
const recentlyViewed = ref([])
const aiInsights = ref({})
const selectedProduct = ref(null)
const showInsights = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Methods
const fetchPersonalizedRecommendations = async () => {
  if (!isAuthenticated.value) return
  
  loading.personalized = true
  try {
    const response = await apiService.getPersonalizedRecommendations({
      limit: props.maxRecommendations,
      category: props.category?.id,
      exclude: props.currentProduct?.id
    })
    personalizedRecommendations.value = response.data.results || response.data || []
    
    // Fetch AI insights for recommendations
    await fetchAIInsights(personalizedRecommendations.value)
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error)
  } finally {
    loading.personalized = false
  }
}

const fetchTrendingProducts = async () => {
  loading.trending = true
  try {
    const response = await apiService.getTrendingProducts({
      limit: props.maxRecommendations,
      category: props.category?.id,
      exclude: props.currentProduct?.id
    })
    trendingProducts.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching trending products:', error)
  } finally {
    loading.trending = false
  }
}

const fetchSimilarProducts = async () => {
  if (!props.currentProduct && recentlyViewed.value.length === 0) return
  
  loading.similar = true
  try {
    let response
    if (props.currentProduct) {
      response = await apiService.getSimilarProducts(props.currentProduct.id, {
        limit: props.maxRecommendations
      })
    } else {
      // Base on recently viewed
      const lastViewed = recentlyViewed.value[0]
      response = await apiService.getSimilarProducts(lastViewed.id, {
        limit: props.maxRecommendations
      })
    }
    similarProducts.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching similar products:', error)
  } finally {
    loading.similar = false
  }
}

const fetchCategoryRecommendations = async () => {
  loading.categories = true
  try {
    const response = await apiService.getCategories()
    const categories = response.data.results || response.data || []
    
    // Get top 3 categories for recommendations
    const topCategories = categories.slice(0, 3)
    
    const categoryPromises = topCategories.map(async (category) => {
      const productsResponse = await apiService.getProductsByCategory(category.id, {
        limit: props.maxRecommendations,
        exclude: props.currentProduct?.id
      })
      return {
        ...category,
        products: productsResponse.data.results || productsResponse.data || []
      }
    })
    
    categoryRecommendations.value = await Promise.all(categoryPromises)
  } catch (error) {
    console.error('Error fetching category recommendations:', error)
  } finally {
    loading.categories = false
  }
}

const fetchFeaturedDeals = async () => {
  loading.featured = true
  try {
    const response = await apiService.getFeaturedProducts({
      limit: props.maxRecommendations,
      deals_only: true,
      exclude: props.currentProduct?.id
    })
    featuredDeals.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching featured deals:', error)
  } finally {
    loading.featured = false
  }
}

const fetchRecentlyViewed = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const response = await apiService.getRecentlyViewedProducts({
      limit: 10
    })
    recentlyViewed.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error fetching recently viewed:', error)
  }
}

const fetchAIInsights = async (products) => {
  if (!isAuthenticated.value || products.length === 0) return
  
  try {
    const response = await apiService.getRecommendationInsights({
      products: products.map(p => p.id),
      user_preferences: authStore.user?.preferences || {}
    })
    aiInsights.value = response.data || {}
  } catch (error) {
    console.error('Error fetching AI insights:', error)
  }
}

const handleProductClick = (product) => {
  // Record product view
  if (isAuthenticated.value) {
    apiService.recordProductView(product.id).catch(console.error)
  }
  
  emit('recommendation-click', product)
  router.push(`/product/${product.id}`)
}

const handleAddToCart = async (product) => {
  try {
    await cartStore.addToCart({
      product_id: product.id,
      quantity: 1
    })
    
    // Track recommendation conversion
    if (isAuthenticated.value) {
      apiService.trackRecommendationConversion({
        product_id: product.id,
        recommendation_type: 'add_to_cart'
      }).catch(console.error)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

const handleToggleWishlist = async (product) => {
  try {
    if (product.is_wishlisted) {
      await wishlistStore.removeFromWishlist(product.id)
    } else {
      await wishlistStore.addToWishlist(product.id)
    }
    product.is_wishlisted = !product.is_wishlisted
    
    // Track wishlist interaction
    if (isAuthenticated.value) {
      apiService.trackRecommendationConversion({
        product_id: product.id,
        recommendation_type: product.is_wishlisted ? 'add_to_wishlist' : 'remove_from_wishlist'
      }).catch(console.error)
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
  }
}

const viewAllRecommendations = (type) => {
  const routes = {
    personalized: '/explore?section=recommended',
    trending: '/explore?section=trending',
    similar: '/explore?section=similar',
    deals: '/explore?section=deals'
  }
  
  router.push(routes[type] || '/explore')
}

const viewCategoryProducts = (categoryId) => {
  emit('category-browse', categoryId)
  router.push(`/explore?category=${categoryId}`)
}

const showProductInsights = (product) => {
  selectedProduct.value = product
  showInsights.value = true
}

const applyRecommendationInsights = (insights) => {
  // Apply AI insights to improve future recommendations
  if (isAuthenticated.value) {
    apiService.updateUserPreferences({
      insights_applied: insights,
      timestamp: new Date().toISOString()
    }).catch(console.error)
  }
  
  showInsights.value = false
}

// Lifecycle
onMounted(async () => {
  // Fetch all recommendation types in parallel
  await Promise.all([
    fetchRecentlyViewed(),
    fetchPersonalizedRecommendations(),
    fetchTrendingProducts(),
    fetchFeaturedDeals(),
    fetchCategoryRecommendations()
  ])
  
  // Fetch similar products after we have recently viewed data
  if (recentlyViewed.value.length > 0 || props.currentProduct) {
    await fetchSimilarProducts()
  }
})

// Expose methods for parent components
defineExpose({
  refreshRecommendations: async () => {
    await Promise.all([
      fetchPersonalizedRecommendations(),
      fetchTrendingProducts(),
      fetchSimilarProducts(),
      fetchFeaturedDeals()
    ])
  },
  showProductInsights
})
</script>