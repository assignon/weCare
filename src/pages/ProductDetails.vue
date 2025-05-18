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
            <!-- <v-chip color="error" size="x-small" class="text-caption" v-if="product.stock<product.low_stock_threshold">{{product.stock}} left</v-chip> -->
            <v-chip color="success" size="x-small" class="text-caption" v-if="product.stock > 0">{{ product.stock }} In Stock</v-chip>
            <v-chip color="error" size="x-small" class="text-caption" v-else>Out of Stock</v-chip>
          </div>
          
          <h1 class="product-title text-h6 font-weight-bold mb-1">{{ product.name }}</h1>
          
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="price text-h5 font-weight-bold primary-color">${{ product.price }}</div>
          </div>

          <!-- Quantity selector - Only show if in stock -->
          <div class="mb-6" v-if="product.stock > 0">
            <h3 class="text-subtitle-2 font-weight-medium mb-2">Quantity</h3>
            <div class="d-flex align-center quantity-selector">
              <v-btn variant="outlined" icon="mdi-minus" density="comfortable" @click="decreaseQuantity"></v-btn>
              <div class="quantity-display mx-4 font-weight-bold text-primary">{{ quantity }}</div>
              <v-btn variant="outlined" icon="mdi-plus" density="comfortable" @click="increaseQuantity(product.stock)"></v-btn>
            </div>
          </div>

          <!-- Size and Quantity - Only show if in stock -->
          <div class="mt-6" v-if="product.stock > 0">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-subtitle-2 font-weight-medium">Size</h3>
              <div class="text-caption">{{ product.size || '500 ml' }}</div>
            </div>
            
            <!-- Size options -->
            <div class="size-options d-flex mb-4">
              <v-btn 
                variant="outlined" 
                class="size-btn mr-2" 
                :color="selectedSize === '100ml' ? 'primary' : ''" 
                @click="selectedSize = '100ml'"
              >
                100ml
              </v-btn>
              <v-btn 
                variant="outlined" 
                class="size-btn mr-2" 
                :color="selectedSize === '250ml' ? 'primary' : ''" 
                @click="selectedSize = '250ml'"
              >
                250ml
              </v-btn>
              <v-btn 
                variant="outlined" 
                class="size-btn" 
                :color="selectedSize === '500ml' ? 'primary' : ''" 
                @click="selectedSize = '500ml'"
              >
                500ml
              </v-btn>
            </div>
          </div>
          
          <!-- Tab section -->
          <v-tabs v-model="activeTab" bg-color="transparent" color="primary" grow>
            <v-tab value="description" class="text-none">Description</v-tab>
            <v-tab value="reviews" class="text-none">Reviews</v-tab>
            <v-tab value="how-to-use" class="text-none">How to use</v-tab>
          </v-tabs>
          
          <v-window v-model="activeTab" class="mt-4">
            <v-window-item value="description">
              <p class="text-body-2">{{ product.description || "No description available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2">Ingredients</h6>
              <p class="text-body-2">{{ product.ingredients || "No ingredients available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2">Benefits</h6>
              <p class="text-body-2">{{ product.benefits || "No benefits available." }}</p>
              <h6 class="text-h6 font-weight-bold mb-1 mt-2" v-if="product.suitable_for.length > 0">Suitable for</h6>
              <v-chip v-for="suitable in product.suitable_for" :key="suitable" class="text-body-2" variant="outlined" color="primary" size="small">{{ suitable }}</v-chip>
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
            v-if="product.stock <= 0"
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
          <div v-else class="d-flex">
            <v-btn 
              color="primary" 
              rounded
              variant="outlined"
              class="mr-4 flex-grow-1 text-none"
              size="large"
              @click="addToCart"
            >
              <v-icon>mdi-cart-plus</v-icon>
              Add to Cart
            </v-btn>
            
            <v-btn
              color="primary" 
              class="flex-grow-1 text-none"
              rounded
              size="large"
              @click="buyNow"
            >
              Buy Now
            </v-btn>
          </div>
        </div>
      </div>
      
      <!-- Snackbar for notifications -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="3000"
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
const selectedSize = ref('500ml')
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
  if (product.value && product.value.stock > 0) {
    cart.addToCart({
      ...product.value,
      selectedSize: selectedSize.value
    }, quantity.value)
    
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

// Watch for product data and check if it's published
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
  }
}, { immediate: true })
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
</style> 