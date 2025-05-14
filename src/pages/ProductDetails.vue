<template>
  <div class="product-details-page">
    <v-container>
      <!-- Breadcrumbs and back button -->
      <div class="d-flex align-center mb-4">
        <v-btn icon @click="$router.back()" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-breadcrumbs :items="breadcrumbs" class="pa-0"></v-breadcrumbs>
      </div>
      
      <!-- Loading skeleton -->
      <v-skeleton-loader v-if="loading" type="image, heading, paragraph, actions" class="my-4" />
      
      <!-- Error alert -->
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      
      <!-- Product details -->
      <div v-if="product" class="product-details">
        <v-row>
          <!-- Product images -->
          <v-col cols="12" md="6">
            <v-card class="product-image-card" flat>
              <v-img 
                :src="product.image || 'https://via.placeholder.com/600'" 
                height="400" 
                cover
                class="main-image"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
              
              <!-- Thumbnail gallery -->
              <div class="thumbnail-gallery d-flex mt-3">
                <v-img 
                  v-for="n in 4" 
                  :key="n"
                  :src="product.image || `https://via.placeholder.com/100?text=Image ${n}`" 
                  width="80" 
                  height="80" 
                  cover
                  class="thumbnail-image ma-1"
                ></v-img>
              </div>
            </v-card>
          </v-col>
          
          <!-- Product info -->
          <v-col cols="12" md="6">
            <div class="product-info pa-2">
              <h1 class="text-h4 font-weight-bold mb-1">{{ product.name }}</h1>
              
              <!-- Rating -->
              <div class="d-flex align-center mb-3">
                <v-rating
                  :model-value="4.5"
                  color="amber"
                  density="compact"
                  half-increments
                  readonly
                  size="small"
                ></v-rating>
                <span class="text-body-2 ml-2">(24 reviews)</span>
              </div>
              
              <!-- Price -->
              <div class="text-h5 font-weight-bold primary-color mb-4">${{ product.price }}</div>
              
              <!-- Description -->
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Description</h3>
              <p class="text-body-1 mb-4">{{ product.description || "No description available." }}</p>
              
              <!-- Quantity selector -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">Quantity</h3>
                <div class="d-flex align-center quantity-selector">
                  <v-btn variant="outlined" icon="mdi-minus" @click="decreaseQuantity"></v-btn>
                  <div class="quantity-display mx-4">{{ quantity }}</div>
                  <v-btn variant="outlined" icon="mdi-plus" @click="increaseQuantity"></v-btn>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="action-buttons">
                <v-btn 
                  color="primary" 
                  size="large" 
                  block 
                  class="mb-3"
                  prepend-icon="mdi-cart"
                  @click="addToCart"
                >
                  Add to Cart
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  class="mb-3"
                  :color="inWishlist ? 'error' : 'primary'"
                  :prepend-icon="inWishlist ? 'mdi-heart' : 'mdi-heart-outline'"
                  @click="toggleWishlist"
                >
                  {{ inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
                </v-btn>
              </div>
              
              <!-- Delivery info -->
              <v-card class="delivery-info mt-4 pa-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-truck-delivery</v-icon>
                  <span class="text-subtitle-2 font-weight-medium">Fast Delivery</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-cash-multiple</v-icon>
                  <span class="text-subtitle-2 font-weight-medium">Secure Payment</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-refresh</v-icon>
                  <span class="text-subtitle-2 font-weight-medium">30 Days Return Policy</span>
                </div>
              </v-card>
            </div>
          </v-col>
        </v-row>
        
        <!-- Related products -->
        <div class="related-products mt-10">
          <h2 class="text-h5 font-weight-medium mb-4">You May Also Like</h2>
          <v-row>
            <v-col 
              v-for="related in productStore.relatedProducts.slice(0, 4)" 
              :key="related.id" 
              cols="6" sm="3"
            >
              <v-card 
                class="related-product-card" 
                flat 
                hover
                @click="$router.push({ name: 'ProductDetails', params: { id: related.id }})"
              >
                <v-img 
                  :src="related.image || `https://via.placeholder.com/300?text=${related.name}`" 
                  height="160" 
                  cover
                ></v-img>
                <v-card-text class="pa-3">
                  <div class="text-subtitle-2 font-weight-medium text-truncate">{{ related.name }}</div>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <div class="text-subtitle-1 font-weight-bold primary-color">${{ related.price.toFixed(2) }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <!-- Fallback placeholders if not enough related products -->
            <v-col 
              v-for="i in Math.max(0, 4 - productStore.relatedProducts.length)"
              :key="`placeholder-${i}`" 
              cols="6" sm="3"
            >
              <v-card class="related-product-card" flat hover>
                <v-img 
                  :src="`https://via.placeholder.com/300?text=Related ${i}`" 
                  height="160" 
                  cover
                ></v-img>
                <v-card-text class="pa-3">
                  <div class="text-subtitle-2 font-weight-medium text-truncate">Similar Product {{ i }}</div>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <div class="text-subtitle-1 font-weight-bold primary-color">${{ (product.price * 0.8).toFixed(2) }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
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

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const cart = useCartStore()
const wishlist = useWishlistStore()
const productStore = useProductStore()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)

const breadcrumbs = computed(() => [
  { title: 'Home', disabled: false, to: { name: 'Home' } },
  { title: product.value?.name || 'Product Details', disabled: true }
])

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
    cart.addToCart(product.value, quantity.value)
    // Show success toast
    router.push({ name: 'Cart' })
  }
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
  padding-bottom: 64px;
}

.product-image-card {
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  border-radius: 8px;
  background-color: #f9f9f9;
}

.thumbnail-gallery {
  overflow-x: auto;
}

.thumbnail-image {
  border-radius: 4px;
  border: 1px solid #eeeeee;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail-image:hover {
  border-color: var(--primary-color);
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

.primary-color {
  color: var(--primary-color);
}

.action-buttons {
  margin-top: 24px;
}

.related-product-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.related-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

@media (max-width: 600px) {
  .product-info {
    padding-top: 24px;
  }
}
</style> 