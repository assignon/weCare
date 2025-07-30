<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-24">
    <!-- Top navigation bar -->
    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <button 
          @click="$router.go(-1)" 
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>
        <div class="flex items-center space-x-2">
          <button class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center">
            <Heart class="w-5 h-5 text-gray-700" />
          </button>
          <button class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center">
            <Share2 class="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="pt-20 px-4">
      <div class="animate-pulse">
        <div class="bg-gray-200 rounded-3xl h-96 mb-6"></div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="error" class="pt-20 px-4 mb-4">
      <div class="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
          <span class="text-red-700 font-medium">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Product details -->
    <div v-if="product" class="pt-20">
      <!-- Product image carousel -->
      <div class="relative mb-6">
        <div class="aspect-square overflow-hidden">
          <img 
            v-if="product.image_1 == null && product.image_2 == null"
            :src="product.main_image || packagingImage" 
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="relative">
            <img 
              :src="currentImage" 
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <!-- Image navigation dots -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button 
                v-for="(image, index) in productImages" 
                :key="index"
                @click="currentImageIndex = index"
                :class="[
                  'w-2 h-2 rounded-full transition-all duration-200',
                  currentImageIndex === index 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50 hover:bg-white/75'
                ]"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product info -->
      <div class="px-4 space-y-6">
        <!-- Brand and stock status -->
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500 font-medium">{{ product.seller_name || 'weCare' }}</div>
          <div 
            v-if="currentStock > 0" 
            class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
          >
            {{ currentStock }} In Stock
          </div>
          <div 
            v-else 
            class="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full"
          >
            Out of Stock
          </div>
        </div>

        <!-- Product title -->
        <h1 class="text-2xl font-bold text-gray-900 capitalize leading-tight">{{ product.name }}</h1>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            {{ formatApiPrice({ price: currentPrice }) }}
          </div>
        </div>

        <!-- Size and Quantity - Only show if in stock -->
        <div v-if="product.variants && product.variants.length > 0" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Size (ml)</h3>
          </div>

          <!-- Size options -->
          <div class="flex flex-wrap gap-3">
            <button 
              v-for="variant in product.variants" 
              :key="variant.id"
              @click="selectVariant(variant)"
              :class="[
                'px-4 py-3 rounded-2xl font-medium transition-all duration-200',
                selectedVariant?.id === variant.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white hover:shadow-md'
              ]"
              :style="selectedVariant?.id === variant.id ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
            >
              {{ variant.name }}
            </button>
          </div>
        </div>

        <!-- Tab section -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/20">
          <!-- Tab headers -->
          <div class="flex space-x-1 mb-6 bg-gray-100/50 rounded-2xl p-1">
            <button 
              @click="activeTab = 'description'"
              :class="[
                'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200',
                activeTab === 'description' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Description
            </button>
            <button 
              @click="activeTab = 'reviews'"
              :class="[
                'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200',
                activeTab === 'reviews' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Reviews ({{ product.review_stats.count }})
            </button>
            <button 
              @click="activeTab = 'how-to-use'"
              :class="[
                'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200',
                activeTab === 'how-to-use' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              How to use
            </button>
          </div>

          <!-- Tab content -->
          <div class="space-y-6">
            <!-- Description tab -->
            <div v-if="activeTab === 'description'" class="space-y-6">
              <p class="text-gray-700 leading-relaxed">{{ product.description || "No description available." }}</p>

              <div class="space-y-4">
                <div>
                  <h6 class="text-lg font-semibold text-gray-900 mb-2">Ingredients</h6>
                  <p class="text-gray-700 leading-relaxed">{{ product.ingredients || "No ingredients available." }}</p>
                </div>

                <div>
                  <h6 class="text-lg font-semibold text-gray-900 mb-2">Benefits</h6>
                  <p class="text-gray-700 leading-relaxed">{{ product.benefits || "No benefits available." }}</p>
                </div>
              </div>

              <!-- Skin Types Section -->
              <div v-if="product.suitable_for && product.suitable_for.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Suitable for Skin Types</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="skinType in product.suitable_for" 
                    :key="skinType.id"
                    class="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                  >
                    {{ skinType.name }}
                  </span>
                </div>
              </div>

              <!-- Skin Concerns Section -->
              <div v-if="product.skin_concerns && product.skin_concerns.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Addresses Skin Concerns</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="concern in product.skin_concerns" 
                    :key="concern.id"
                    class="px-3 py-2 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-200"
                  >
                    {{ concern.name }}
                  </span>
                </div>
              </div>

              <!-- Product Types Section -->
              <div v-if="product.product_types && product.product_types.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Product Types</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="type in product.product_types" 
                    :key="type.id"
                    class="px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-200"
                  >
                    {{ type.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Reviews tab -->
            <div v-if="activeTab === 'reviews'" class="space-y-4">
              <div class="flex items-center space-x-2 mb-4">
                <div class="flex items-center">
                  <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(product.review_stats.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'" />
                </div>
                <span class="text-gray-600 font-medium">({{ product.review_stats.count }} reviews)</span>
              </div>

              <!-- Sample reviews -->
              <div v-if="product.review_stats.count > 0" class="space-y-4">
                <div 
                  v-for="review in productStore.productReviews" 
                  :key="review.id"
                  class="p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-semibold text-gray-900">{{ review.user_name }}</div>
                    <div class="text-xs text-gray-500">{{ review.created_at }}</div>
                  </div>
                  <div class="flex items-center mb-2">
                    <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'" />
                  </div>
                  <p class="text-sm text-gray-700">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <MessageCircle class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-600 font-medium">No reviews yet. Be the first to review this product.</p>
              </div>
            </div>

            <!-- How to use tab -->
            <div v-if="activeTab === 'how-to-use'" class="space-y-4">
              <p class="text-gray-700 leading-relaxed">{{ product.how_to_use || "No usage instructions available." }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom fixed action buttons -->
    <div v-if="product" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
      <div class="p-4">
        <!-- Out of stock notification button -->
        <button 
          v-if="currentStock <= 0" 
          @click="requestRestockNotification"
          :disabled="notificationStatus === 'loading'"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <span v-if="notificationStatus === 'loading'" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Registering...
          </span>
          <span v-else>Keep Me Updated</span>
        </button>

        <!-- In stock action buttons -->
        <div v-else class="flex items-center space-x-3">
          <div class="flex items-center bg-gray-100 rounded-2xl p-1">
            <button 
              @click="decreaseQuantity"
              class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Minus class="w-5 h-5" />
            </button>
            <div class="w-12 text-center font-bold text-gray-900">{{ quantity }}</div>
            <button 
              @click="increaseQuantity(currentStock)"
              class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <button 
            @click="addToCart"
            class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <ShoppingBag class="w-5 h-5 mr-2" />
            Add to Cart
          </button>

          <button 
            @click="goToCart"
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors relative"
          >
            <ShoppingCart class="w-6 h-6 text-gray-700" />
            <span 
              v-if="cartItemsCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {{ cartItemsCount > 99 ? '99+' : cartItemsCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <div 
      v-if="showSnackbar" 
      class="fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-lg transition-all duration-300"
      :class="snackbarColor === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <CheckCircle v-if="snackbarColor === 'success'" class="w-5 h-5 text-green-500 mr-3" />
          <AlertCircle v-else class="w-5 h-5 text-red-500 mr-3" />
          <span :class="snackbarColor === 'success' ? 'text-green-700' : 'text-red-700'" class="font-medium">
            {{ snackbarText }}
          </span>
        </div>
        <button @click="showSnackbar = false" class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import packagingImage from '@/assets/packaging_10471395.png'
import { 
  ArrowLeft, Heart, Share2, AlertCircle, Star, MessageCircle, 
  Minus, Plus, ShoppingBag, ShoppingCart, CheckCircle, X 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const activeTab = ref('description')
const selectedVariant = ref(null)
const selectedSize = ref(null)
const cart = useCartStore()
const productStore = useProductStore()
const { formatApiPrice } = useCurrency()
const notificationStatus = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const currentImageIndex = ref(0)

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)

// Computed property for product images
const productImages = computed(() => {
  if (!product.value) return []
  return [product.value.main_image, product.value.image_1, product.value.image_2, product.value.image_3].filter(Boolean)
})

// Computed property for current image
const currentImage = computed(() => {
  return productImages.value[currentImageIndex.value] || packagingImage
})

const increaseQuantity = (productStock) => {
  if (quantity.value < productStock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (product.value && currentStock.value > 0) {
    try {
      // Only send the necessary data to create a new cart
      await cart.createNewCart(
        selectedVariant.value,
        quantity.value,
        product.value.id
      );

      // Reset quantity to 1 after successful addition
      quantity.value = 1;

      // Show success snackbar
      snackbarText.value = 'Product added to cart';
      snackbarColor.value = 'success';
      showSnackbar.value = true;
    } catch (error) {
      console.error('Failed to add product to cart:', error);

      // Show error snackbar
      snackbarText.value = 'Failed to add product to cart';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
    }
  }
}

const goToCart = () => {
  router.push({ name: 'Cart' })
}

const requestRestockNotification = async () => {
  if (!product.value) return

  try {
    notificationStatus.value = 'loading'
    await apiService.requestRestockNotification(product.value.id)
    notificationStatus.value = 'success'

    // Show success snackbar
    snackbarText.value = "We'll notify you when this product is back in stock"
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error) {
    console.error('Failed to request restock notification:', error)
    notificationStatus.value = 'error'

    // Show error snackbar
    snackbarText.value = "Couldn't register for notification. Please try again."
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Fix cart.items.find is not a function error
const cartItemQuantity = computed(() => {
  if (!product.value || !selectedVariant.value || !cart.items || !cart.items.items) return 0

  // Find the product in the cart items
  const cartProduct = cart.items.items.find(item => item.product_id === product.value.id);
  if (!cartProduct) return 0;

  // Find the variant in the product's variants
  const cartVariant = cartProduct.variants.find(v => v.id === selectedVariant.value.id);
  return cartVariant ? cartVariant.quantity : 0;
})

// Update watch for product to set initial quantity
watch(product, (newProduct) => {
  if (!newProduct) return

  // Check various conditions that would make product unavailable
  const isUnavailable = !newProduct.published

  if (isUnavailable) {
    // Show notification for unavailable product
    snackbarText.value = "This product is not available"
    snackbarColor.value = "error"
    showSnackbar.value = true

    // Redirect to home page
    router.push({ name: 'Home' })
  } else if (newProduct.variants && newProduct.variants.length > 0) {
    // Find the default variant or use the first one
    const defaultVariant = newProduct.variants.find(v => v.is_default) || newProduct.variants[0]
    selectedVariant.value = defaultVariant
    selectedSize.value = defaultVariant.name

    // Always set quantity to 1 when product loads
    quantity.value = 1
  }
}, { immediate: true })

// Computed properties for current variant's price and stock
const currentPrice = computed(() => {
  return selectedVariant.value ? selectedVariant.value.price : product.value?.price
})

const currentStock = computed(() => {
  return selectedVariant.value ? selectedVariant.value.stock : product.value?.stock
})

// Update selectVariant to always set quantity to 1
const selectVariant = (variant) => {
  selectedVariant.value = variant;
  selectedSize.value = variant.name;

  // Always set quantity to 1 when selecting a variant
  quantity.value = 1;
}

const cartItemsCount = computed(() => cart.cartItemCount)

onMounted(async () => {
  const productId = route.params.id

  try {
    // Fetch product data
    await productStore.fetchProductById(productId)

    // Fetch related data
    await Promise.all([
      productStore.fetchRelatedProducts(productId),
      productStore.fetchProductReviews(productId)
    ])
  } catch (error) {
    // Handle error and redirect to home page
    console.error('Error fetching product:', error)
    snackbarText.value = "Product not found"
    snackbarColor.value = "error"
    showSnackbar.value = true

    // Redirect to home page
    router.push({ name: 'Home' })
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>