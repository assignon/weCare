<template>
  <div class="product-details-page">
    <v-container class="pa-0 pb-24">
      <!-- Top navigation bar -->
      <div class="top-bar px-4 py-2 d-flex align-center">
        <v-btn icon @click="$router.go(-1)" class="mr-2" variant="text">
          <v-icon color="primary">mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" class="mr-2" @click="toggleWishlist">
          <v-icon :color="inWishlist ? 'error' : 'primary'">
            {{ inWishlist ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>
      </div>
      
      <!-- Loading skeleton -->
      <v-skeleton-loader v-if="loading" type="image, article" class="my-4" />
      
      <!-- Error alert -->
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      
      <!-- Product details -->
      <div v-if="product" class="product-details">
        <!-- Product image carousel -->
        <div class="product-image-container">
          <v-img
            :src="product.main_image || packagingImage"
            cover
            height="450"
            v-if="product.image_1==null && product.image_2==null"
          ></v-img>
          <v-carousel 
            :show-arrows="false"
            hide-delimiter-background 
            height="450"
            delimiter-icon="mdi-circle"
            cycle
            color="primary"
            interval="12000"
            v-else
          >
            <v-carousel-item
              v-for="(image, i) in [product.main_image, product.image_1, product.image_2, product.image_3] || []"
              :key="i"
              :src="image"
              cover
            ></v-carousel-item>
          </v-carousel>
        </div>
        
        <!-- Product info -->
        <div class="product-info pa-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="brand text-caption text-grey">{{ product.seller_name || 'weCare' }}</div>
            <v-chip color="success" size="x-small" class="text-caption" v-if="currentStock > 0">{{ currentStock }} In Stock</v-chip>
            <v-chip color="error" size="x-small" class="text-caption" v-else>Out of Stock</v-chip>
          </div>
          
          <h1 class="product-title text-h6 font-weight-bold mb-1 text-capitalize">{{ product.name }}</h1>
          
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="price text-h5 font-weight-bold primary-color">${{ currentPrice }}</div>
          </div>

          <!-- Size and Quantity - Only show if in stock -->
          <div class="mt-6" v-if="product.variants && product.variants.length > 0">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-subtitle-2 font-weight-medium">Size (ml)</h3>
            </div>
            
            <!-- Size options -->
            <div class="size-options d-flex mb-4">
              <v-btn 
                v-for="variant in product.variants" 
                :key="variant.id"
                :variant="selectedVariant?.id === variant.id ? 'flat' : 'outlined'" 
                class="size-btn mr-2" 
                :color="selectedVariant?.id === variant.id ? 'primary' : ''" 
                @click="selectVariant(variant)"
              >
                {{ variant.name }}
              </v-btn>
            </div>
          </div>
          
          <!-- Tab section -->
          <v-tabs v-model="activeTab" bg-color="transparent" color="primary" grow>
            <v-tab value="description" class="text-none">Description</v-tab>
            <v-tab value="reviews" class="text-none">Reviews ({{ product.review_stats.count }})</v-tab>
            <v-tab value="how-to-use" class="text-none">How to use</v-tab>
          </v-tabs>
          
          <v-window v-model="activeTab" class="mt-4">
            <v-window-item value="description">
              <p class="text-body-2">{{ product.description || "No description available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2">Ingredients</h6>
              <p class="text-body-2">{{ product.ingredients || "No ingredients available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2">Benefits</h6>
              <p class="text-body-2">{{ product.benefits || "No benefits available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2" v-if="product.suitable_for.length > 0">Skin Types</h6>
              <v-chip v-for="suitable in product.suitable_for" :key="suitable" class="text-body-2 mr-2 mb-2" variant="outlined" color="primary" size="small">{{ suitable.name }}</v-chip>
            </v-window-item>
            
            <v-window-item value="reviews">
              <div class="reviews-section">
                <div class="d-flex align-center mb-3">
                  <v-rating
                    :model-value="product.review_stats.avg_rating"
                    color="amber"
                    density="compact"
                    half-increments
                    readonly
                    size="small"
                  ></v-rating>
                  <span class="text-body-2 ml-2">({{ product.review_stats.count }} reviews)</span>
                </div>
                
                <!-- Sample reviews -->
                <div class="review-item pa-3 mb-3 rounded" v-if="product.review_stats.count > 0">
                  <div v-for="review in productStore.productReviews" :key="review.id">
                      <div class="d-flex justify-space-between">
                        <div class="font-weight-medium">{{ review.user_name }}</div>
                        <div class="text-caption text-grey">{{ review.created_at }}</div>
                      </div>
                      <v-rating
                        :model-value="review.rating"
                        color="amber"
                        density="compact"
                        readonly
                        size="x-small"
                        class="my-1"
                      ></v-rating>
                      <p class="text-caption">{{ review.comment }}</p>
                    </div>
                  </div>
                <div class="review-item pa-3 mb-3 rounded" v-else>
                  <v-icon size="x-large" color="primary" class="mb-2">mdi-comment-quote-outline</v-icon>
                  <p class="text-body-2">No reviews yet. Be the first to review this product.</p>
                </div>
              </div>
            </v-window-item>
            
            <v-window-item value="how-to-use">
              <p class="text-body-2">{{ product.how_to_use }}</p>
            </v-window-item>
          </v-window>
        </div>
      </div>
      
      <!-- Bottom fixed action buttons -->
      <div v-if="product" class="bottom-actions-container">
        <div class="bottom-actions-buttons">
          <!-- Out of stock notification button -->
          <v-btn
            v-if="currentStock <= 0"
            color="primary"
            class="text-none"
            block
            size="large"
            rounded
            @click="requestRestockNotification"
            :loading="notificationStatus === 'loading'"
          >
            Keep Me Updated
          </v-btn>
          
          <!-- In stock action buttons -->
          <div v-else class="d-flex align-center">
            <div class="d-flex align-center mr-4">
              <v-btn 
                variant="outlined" 
                icon="mdi-minus" 
                density="comfortable" 
                @click="decreaseQuantity"
                class="quantity-btn font-weight-bold"
                color="primary"
              ></v-btn>
              <div class="quantity-display mx-1 font-weight-bold text-primary">{{ quantity }}</div>
              <v-btn 
                variant="outlined" 
                icon="mdi-plus" 
                density="comfortable" 
                @click="increaseQuantity(currentStock)"
                class="quantity-btn font-weight-bold"
                color="primary"
              ></v-btn>
            </div>
            
            <v-btn 
              color="primary" 
              rounded
              variant="outlined"
              class="flex-grow-1 text-none"
              size="large"
              @click="addToCart"
            >
              <v-badge
                :content="cartItemsCount"
                color="error"
                class="mr-2"
              >
                <v-icon>mdi-cart</v-icon>
              </v-badge>
              Add to Cart
            </v-btn>
            
            <v-btn
              color="primary" 
              class="ml-4"
              icon
              @click="buyNow"
            >
              <v-icon>mdi-basket-check</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      
      <!-- Snackbar for notifications -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="3000"
        location="top"
        class="ml-4"
      >
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn
            variant="text"
            icon="mdi-close"
            @click="showSnackbar = false"
          ></v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useProductStore } from '@/stores/product'
import { apiService } from '@/services/api'
import packagingImage from '@/assets/packaging_10471395.png'

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const activeTab = ref('description')
const selectedVariant = ref(null)
const selectedSize = ref(null)
const cart = useCartStore()
const wishlist = useWishlistStore()
const productStore = useProductStore()
const notificationStatus = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)

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

const addToCart = () => {
  if (product.value && currentStock.value > 0) {
    const cartItem = {
      ...product.value,
      selectedVariant: selectedVariant.value,
      price: currentPrice.value,
      stock: currentStock.value,
      variantName: selectedVariant.value.name
    }
    
    cart.addToCart(cartItem, quantity.value)
    
    // Show success snackbar
    snackbarText.value = 'Product added to cart'
    snackbarColor.value = 'success'
    showSnackbar.value = true
  }
}

const buyNow = () => {
  addToCart()
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

const inWishlist = computed(() => wishlist.items.some(i => i.id === product.value?.id))

const toggleWishlist = () => {
  if (!product.value) return
  if (inWishlist.value) {
    wishlist.remove(product.value.id)
    // Show removed from wishlist notification
    snackbarText.value = 'Removed from wishlist'
    snackbarColor.value = 'info'
    showSnackbar.value = true
  } else {
    wishlist.add(product.value)
    // Show added to wishlist notification
    snackbarText.value = 'Added to wishlist'
    snackbarColor.value = 'success'
    showSnackbar.value = true
  }
}

// Add new computed property to get cart item quantity for current variant
const cartItemQuantity = computed(() => {
  if (!product.value || !selectedVariant.value) return 0
  
  const cartItem = cart.items.find(item => 
    item.id === product.value.id && 
    item.selectedVariant?.id === selectedVariant.value.id
  )
  
  return cartItem ? cartItem.quantity : 0
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
    
    // Set initial quantity based on cart
    quantity.value = cartItemQuantity.value || 1
  }
}, { immediate: true })

// Computed properties for current variant's price and stock
const currentPrice = computed(() => {
  return selectedVariant.value ? selectedVariant.value.price : product.value?.price
})

const currentStock = computed(() => {
  return selectedVariant.value ? selectedVariant.value.stock : product.value?.stock
})

// Update selectVariant method to set quantity from cart
const selectVariant = (variant) => {
  selectedVariant.value = variant
  selectedSize.value = variant.name
  
  // Update quantity based on cart
  const cartItem = cart.items.find(item => 
    item.id === product.value.id && 
    item.selectedVariant?.id === variant.id
  )
  
  quantity.value = cartItem ? cartItem.quantity : 1
}

const cartItemsCount = computed(() => cart.items.length)

onMounted(async () => {
  const productId = route.params.id
  
  try {
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
.product-details-page {
  background-color: white;
  min-height: 100vh;
  padding-bottom: 70px; /* Add extra space for fixed buttons */
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.product-image-container {
  position: relative;
  margin-bottom: 16px;
}

.product-title {
  text-transform: capitalize;
}

.primary-color {
  color: #6b3aa5;
}

.quantity-selector {
  display: flex;
  align-items: center;
}

.quantity-display {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
}

.size-btn {
  min-width: 70px;
  border-radius: 12px;
}

.review-item {
  background-color: #f8f9fa;
}

.bottom-actions-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  z-index: 100;
  border-top: 1px solid #f0f0f0;
}

.bottom-actions-buttons {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .product-details {
    display: flex;
  }
  
  .product-image-container {
    flex: 1;
    margin-bottom: 0;
  }
  
  .product-info {
    flex: 1;
  }
  
  .bottom-actions-buttons {
    max-width: 960px;
  }
}

.quantity-btn {
  min-width: 36px;
  height: 36px;
}

.quantity-display {
  min-width: 32px;
  text-align: center;
  font-weight: bold;
}
</style> 