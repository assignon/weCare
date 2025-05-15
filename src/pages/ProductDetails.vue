<template>
  <div class="product-details-page">
    <v-container class="pa-0">
      <!-- Top navigation bar -->
      <div class="top-bar px-4 py-2 d-flex align-center">
        <v-btn icon @click="$router.go(-1)" class="mr-2" variant="text">
          <v-icon color="primary">mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" class="mr-2">
          <v-icon color="primary">mdi-heart</v-icon>
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
          <v-carousel 
            :show-arrows="false"
            hide-delimiter-background 
            height="450"
            delimiter-icon="mdi-circle"
            cycle
            color="primary"
            interval="12000"
          >
            <v-carousel-item
              :src="product.main_image || packagingImage"
              cover
            ></v-carousel-item>
            <v-carousel-item
              v-for="(image, i) in [product.image_1, product.image_2, product.image_3] || []"
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
            <v-chip color="success" size="x-small" class="text-caption">In Stock</v-chip>
          </div>
          
          <h1 class="product-title text-h6 font-weight-bold mb-1">{{ product.name }}</h1>
          
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="price text-h5 font-weight-bold primary-color">${{ product.price }}</div>
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
            </v-window-item>
            
            <v-window-item value="reviews">
              <div class="reviews-section">
                <div class="d-flex align-center mb-3">
                  <v-rating
                    :model-value="4.5"
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
                  <div class="d-flex justify-space-between">
                    <div class="font-weight-medium">John D.</div>
                    <div class="text-caption text-grey">2 days ago</div>
                  </div>
                  <v-rating
                    :model-value="product.review_stats.avg_rating"
                    color="amber"
                    density="compact"
                    readonly
                    size="x-small"
                    class="my-1"
                  ></v-rating>
                  <p class="text-caption">Great product! I love how it feels on my skin.</p>
                </div>
                <div class="review-item pa-3 mb-3 rounded" v-else>
                  <v-icon size="x-large" color="primary" class="mb-2">mdi-comment-quote-outline</v-icon>
                  <p class="text-body-2">No reviews yet. Be the first to review this product.</p>
                </div>
              </div>
            </v-window-item>
            
            <v-window-item value="how-to-use">
              <p class="text-body-2">{{ product.usage_instructions || "Apply a small amount to clean, damp skin. Massage gently in circular motions, then rinse thoroughly with water." }}</p>
            </v-window-item>
          </v-window>
          
          <!-- Size and Quantity -->
          <div class="mt-6">
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
            
            <!-- Quantity selector -->
            <div class="mb-6">
              <h3 class="text-subtitle-2 font-weight-medium mb-2">Quantity</h3>
              <div class="d-flex align-center quantity-selector">
                <v-btn variant="outlined" icon="mdi-minus" density="comfortable" @click="decreaseQuantity"></v-btn>
                <div class="quantity-display mx-4">{{ quantity }}</div>
                <v-btn variant="outlined" icon="mdi-plus" density="comfortable" @click="increaseQuantity"></v-btn>
              </div>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="action-buttons d-flex">
            <v-btn 
              color="secondary" 
              variant="outlined"
              class="mr-4 flex-grow-1"
              @click="addToCart"
            >
              Add to Cart
            </v-btn>
            
            <v-btn
              color="primary" 
              class="flex-grow-1"
              @click="buyNow"
            >
              Buy Now
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useProductStore } from '@/stores/product'
import packagingImage from '@/assets/packaging_10471395.png'

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const activeTab = ref('description')
const selectedSize = ref('500ml')
const cart = useCartStore()
const wishlist = useWishlistStore()
const productStore = useProductStore()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (product.value) {
    cart.addToCart({
      ...product.value,
      selectedSize: selectedSize.value
    }, quantity.value)
    // Show snackbar notification
  }
}

const buyNow = () => {
  addToCart()
  router.push({ name: 'Cart' })
}

const inWishlist = computed(() => wishlist.items.some(i => i.id === product.value?.id))

const toggleWishlist = () => {
  if (!product.value) return
  if (inWishlist.value) {
    wishlist.remove(product.value.id)
  } else {
    wishlist.add(product.value)
  }
}

onMounted(async () => {
  const productId = route.params.id
  await productStore.fetchProductById(productId)
  await productStore.fetchRelatedProducts(productId)
})
</script>

<style scoped>
.product-details-page {
  background-color: white;
  min-height: 100vh;
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

.action-buttons {
  margin-top: 24px;
  margin-bottom: 24px;
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
}
</style> 