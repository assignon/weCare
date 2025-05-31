<template>
  <div class="home-page">
    <v-container class="pa-4 pb-24">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <h1 class="text-h5 font-weight-bold">weCare</h1>
        <div class="d-flex">
          <v-btn icon class="" variant="text" @click="navigateToNotification">
            <v-badge 
              v-if="notification.hasUnreadNotifications"
              :content="notification.unreadCount" 
              color="error" 
              offset-x="1" 
              offset-y="1"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>
          <v-btn icon class="" variant="text" @click="navigateToProfile">
            <v-avatar size="32" v-if="auth.user?.profile_picture">
              <v-img 
                :src="auth.user.profile_picture" 
                alt="Profile"
              />
            </v-avatar>
            <v-icon v-else>mdi-account-circle-outline</v-icon>
          </v-btn>
        </div>
      </div>
      
      <!-- Popular Products Section -->
      <div v-if="productStore.popularProducts.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">Popular Product</h2>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- Popular products with horizontal scroll -->
        <div v-else class="horizontal-scroll-container">
          <div class="horizontal-scroll-content">
            <v-card 
              v-for="product in productStore.popularProducts.slice(0, 10)" 
              :key="product.id"
              class="product-card-horizontal" 
              flat 
              @click="navigateToDetails(product.id)"
            >
              <v-img 
                :src="product.main_image || packagingImage" 
                height="150"
                class="mb-2"
                cover
              ></v-img>
              <div class="px-2 pb-2">
                <h3 class="text-subtitle-2 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
                <p class="text-caption mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-2 font-weight-bold">${{ product.price }}</span>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
      
      <!-- New Arrivals Section -->
      <div v-if="productStore.newArrivals.length > 0" class="section mb-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <h2 class="section-title font-weight-bold">New Arrivals</h2>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="d-flex justify-center my-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        
        <!-- Error state -->
        <v-alert v-else-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <!-- New arrivals with horizontal scroll -->
        <div v-else class="horizontal-scroll-container">
          <div class="horizontal-scroll-content">
            <v-card 
              v-for="product in productStore.newArrivals.slice(0, 10)" 
              :key="product.id"
              class="product-card-bundle-horizontal" 
              flat 
              @click="navigateToDetails(product.id)"
            >
              <div class="d-flex">
                <v-img 
                  :src="product.main_image || packagingImage" 
                  height="150"
                  width="100"
                  class="rounded-lg flex-shrink-0"
                  cover
                ></v-img>
                <div class="px-3 py-2 d-flex flex-column justify-space-between flex-grow-1">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-medium mb-1 text-truncate text-capitalize">{{ product.name }}</h3>
                    <p class="text-caption text-grey mb-1 text-truncate">{{ product.seller_name || 'weCare' }}</p>
                  </div>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <span v-if="product.original_price && product.original_price > product.price" class="text-caption text-decoration-line-through text-grey mr-1">${{ product.original_price }}</span>
                      <span class="text-subtitle-2 font-weight-bold primary-color">${{ product.price }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
      
      <!-- Bottom Navigation -->
      <BottomNavigation />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'
import packagingImage from '@/assets/packaging_10471395.png'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()
const notification = useNotificationStore()
const auth = useAuthStore()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)

const navigateToProfile = () => {
  router.push({ name: 'Profile' })
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

onMounted(async () => {
  console.log('Home page mounted - starting initialization')
  
  try {
    // Initialize cart state
    cart.initCartState()
    console.log('Cart state initialized')
    
    await Promise.all([
      cart.fetchCart().then(() => console.log('Cart fetched')).catch(err => {
        console.error('Cart fetch failed, continuing anyway:', err)
      })
    ])

    // init notification store
    await notification.init()
    
    console.log('Starting to fetch products...')
    
    // Fetch only popular products and new arrivals for home page
    await Promise.all([
      productStore.fetchPopularProducts().then(() => {
        console.log('Popular products fetched:', productStore.popularProducts.length)
      }),
      productStore.fetchNewArrivals().then(() => {
        console.log('New arrivals fetched:', productStore.newArrivals.length)
      })
    ])
  } catch (error) {
    console.error('Error during Home page initialization:', error)
  }
})

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
}
</script>

<style scoped>
.home-page {
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
}

.section-title {
  font-size: 16px;
}

.primary-color {
  color: #6b3aa5;
}

.product-card-horizontal {
  flex: 0 0 160px; /* Fixed width */
  width: 160px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card-bundle-horizontal {
  flex: 0 0 280px; /* Fixed width for bundle cards */
  width: 280px;
  height: 150px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-bundle-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Horizontal scroll containers */
.horizontal-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.horizontal-scroll-container::-webkit-scrollbar {
  display: none; /* WebKit */
}

.horizontal-scroll-content {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

/* Make sure vertical scrolling is smooth */
::-webkit-scrollbar {
  height: 0;
  width: 0;
  display: none;
}
</style> 