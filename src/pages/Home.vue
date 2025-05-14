<template>
  <div class="home-page">
    <v-container class="pa-4">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <h1 class="text-h5 font-weight-bold">weCare</h1>
        <div class="d-flex">
          <v-btn icon class="mr-2">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon class="mr-2">
            <v-icon>mdi-reload</v-icon>
          </v-btn>
          <v-avatar size="32">
            <v-img src="https://via.placeholder.com/32"></v-img>
          </v-avatar>
        </div>
      </div>
      
      <!-- Filter chips -->
      <div class="d-flex overflow-x-auto filter-container mb-6">
        <v-btn 
          variant="outlined" 
          class="mr-2 filter-btn"
          prepend-icon="mdi-filter-variant"
          rounded="pill"
          size="small"
        >
          Filter
        </v-btn>
        <v-btn 
          class="mr-2" 
          color="primary" 
          rounded="pill" 
          size="small"
          @click="productStore.clearFilters(); productStore.fetchProducts()"
        >
          All
        </v-btn>
        <v-btn 
          v-for="category in productStore.categories"
          :key="category.id"
          class="mr-2" 
          :variant="productStore.selectedCategory === category.id ? 'elevated' : 'outlined'" 
          rounded="pill" 
          size="small"
          @click="productStore.filterByCategory(category.id)"
        >
          {{ category.name }}
        </v-btn>
      </div>
      
      <!-- Popular Products Section - only shown if products exist -->
      <div v-if="productStore.popularProducts.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">Popular Product</h2>
          <span class="text-caption primary-color">View More</span>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- Popular products -->
        <div v-else class="d-flex overflow-x-auto">
          <v-card 
            v-for="product in productStore.popularProducts.slice(0, 5)" 
            :key="product.id"
            class="product-card mr-3" 
            flat 
            width="150"
            @click="navigateToDetails(product.id)"
          >
            <v-img 
              :src="product.image || `https://via.placeholder.com/150/000000/FFFFFF?text=${product.name}`" 
              height="150"
              class="mb-2"
            ></v-img>
            <div class="px-2 pb-2">
              <h3 class="text-subtitle-2 font-weight-medium mb-1">{{ product.name }}</h3>
              <p class="text-caption mb-1">{{ product.brand || 'weCare' }}</p>
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">${{ product.price }}</span>
                <v-btn icon="mdi-heart-outline" variant="text" density="compact" size="small"></v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>
      
      <!-- New Arrivals Section - only shown if products exist -->
      <div v-if="productStore.newArrivals.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">New Arrivals</h2>
          <span class="text-caption primary-color">View More</span>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- New arrivals with horizontal scroll -->
        <div v-else class="d-flex overflow-x-auto">
          <v-card 
            v-for="product in productStore.newArrivals.slice(0, 5)" 
            :key="product.id"
            class="product-card mr-3" 
            flat 
            width="150"
            @click="navigateToDetails(product.id)"
          >
            <v-img 
              :src="product.image || `https://via.placeholder.com/150/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${product.name}`" 
              height="150"
              class="mb-2"
            ></v-img>
            <div class="px-2 pb-2">
              <h3 class="text-subtitle-2 font-weight-medium mb-1 text-truncate">{{ product.name }}</h3>
              <p class="text-caption mb-1">{{ product.brand || 'weCare' }}</p>
              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-bold">${{ product.price }}</span>
                <v-btn 
                  icon="mdi-cart-plus" 
                  size="small" 
                  color="primary" 
                  variant="text"
                  @click.stop="addToCart(product)" 
                ></v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>
      
      <!-- No products state -->
      <v-card v-if="!loading && productStore.popularProducts.length === 0 && productStore.newArrivals.length === 0" class="pa-6 text-center my-6">
        <v-icon size="large" color="grey-lighten-1" class="mb-4">mdi-cart-off</v-icon>
        <h3 class="text-h6 mb-2">No Products Available</h3>
        <p class="text-body-2 text-grey">Check back soon for new products.</p>
      </v-card>
      
      <!-- Bottom Navigation -->
      <div class="bottom-navigation">
        <v-bottom-navigation grow color="primary">
          <v-btn value="home">
            <v-icon>mdi-home</v-icon>
            <span>Home</span>
          </v-btn>
          <v-btn value="explore">
            <v-icon>mdi-compass</v-icon>
            <span>Explore</span>
          </v-btn>
          <v-btn value="cart">
            <v-icon>mdi-cart</v-icon>
            <span>Cart</span>
          </v-btn>
          <v-btn value="wishlist">
            <v-icon>mdi-heart</v-icon>
            <span>Wishlist</span>
          </v-btn>
        </v-bottom-navigation>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()

const search = ref('')
const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

const addToCart = (product) => {
  cart.addToCart(product, 1)
  // Show toast or notification
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

onMounted(async () => {
  // Fetch categories
  await productStore.fetchCategories()
  
  // Fetch products for each section
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchPopularProducts(),
    productStore.fetchNewArrivals()
  ])
})
</script>

<style scoped>
.home-page {
  padding-bottom: 64px;
  background-color: #f8f9fa;
}

.filter-container {
  margin-right: -16px;
  padding-bottom: 8px;
}

.filter-btn {
  border: 1px solid #e0e0e0;
}

.section-title {
  font-size: 16px;
}

.primary-color {
  color: #6b3aa5;
}

.special-offer-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Make sure horizontal scrolling is smooth */
::-webkit-scrollbar {
  height: 0;
  width: 0;
  display: none;
}

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  z-index: 99;
}
</style> 