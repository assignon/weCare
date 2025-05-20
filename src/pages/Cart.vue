<template>
  <div class="cart-page">
    <v-container>
      <h1 class="text-h5 font-weight-bold mb-6">Shopping Cart</h1>
      
      <v-row v-if="cart.items.items.length > 0">
        <!-- Cart items -->
        <v-col cols="12" md="8">
          <v-card class="cart-items-container mb-4" flat>
            <div 
              v-for="group in cart.items.items" 
              :key="group.product_id"
              class="cart-product-group"
            >
              <!-- Product header -->
              <div class="d-flex cart-item-content mb-2">
                <div class="cart-item-image-container mr-4">
                  <v-img 
                    :src="group.main_image || 'https://via.placeholder.com/150'" 
                    width="100" 
                    height="100" 
                    class="cart-item-image"
                    cover
                  ></v-img>
                </div>
                
                <div class="flex-grow-1">
                  <h3 class="text-subtitle-1 font-weight-medium mb-1">{{ group.product_name }}</h3>
                  <p class="text-caption text-grey mb-0">{{ group.seller_name || '---' }}</p>
                  <p class="text-caption text-primary font-weight-bold">
                    <v-icon size="x-small" color="primary" class="mr-1">mdi-truck-delivery</v-icon>
                    {{ group.delivery_info.estimated_delivery_display }}
                  </p>
                </div>
              </div>
              
              <!-- Variants -->
              <div class="variants-container pl-16">
                <div 
                  v-for="variant in group.variants" 
                  :key="variant.id"
                  class="variant-item d-flex align-center justify-space-between py-2"
                >
                  <div class="d-flex align-center">
                    <span class="text-body-2 mr-4">{{ variant.name }}</span>
                    <span class="text-subtitle-2 font-weight-medium">${{ variant.price }}</span>
                  </div>
                  
                  <div class="d-flex align-center">
                    <div class="d-flex align-center quantity-controls mr-4">
                      <v-btn 
                        variant="outlined" 
                        icon="mdi-minus" 
                        density="comfortable"
                        size="small"
                        :disabled="variant.quantity <= 1"
                        @click="updateVariantQuantity(group.product_id, variant.id, variant.quantity - 1)"
                      ></v-btn>
                      <div class="quantity-display mx-2">{{ variant.quantity }}</div>
                      <v-btn 
                        variant="outlined" 
                        icon="mdi-plus" 
                        density="comfortable"
                        size="small"
                        :disabled="variant.quantity >= variant.stock"
                        @click="updateVariantQuantity(group.product_id, variant.id, variant.quantity + 1)"
                      ></v-btn>
                    </div>
                    
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      density="comfortable"
                      @click="removeVariant(group.product_id, variant.id)"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
          
          <!-- Continue shopping button -->
          <div class="d-flex mb-6">
            <v-btn 
              variant="tonal" 
              prepend-icon="mdi-arrow-left" 
              @click="$router.push({ name: 'Home' })"
            >
              Continue Shopping
            </v-btn>
          </div>
        </v-col>
        
        <!-- Order summary -->
        <v-col cols="12" md="4">
          <v-card class="order-summary pa-2" variant="text">
            <h2 class="text-h6 font-weight-bold mb-4">Order Summary</h2>
            
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1">Items ({{ cart.items.total_items }})</span>
              <span class="text-body-1">${{ cart.items.total_amount ? cart.items.total_amount.toFixed(2) : '0.00' }}</span>
            </div>
            
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1">Shipping</span>
              <span class="text-body-1">$0.00</span>
            </div>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="d-flex justify-space-between mb-4">
              <span class="text-subtitle-1 font-weight-bold">Total</span>
              <span class="text-h6 font-weight-bold primary-color">${{ cart.items.total_amount ? cart.items.total_amount.toFixed(2) : '0.00' }}</span>
            </div>
            
            <!-- Promo code -->
            <!-- <v-text-field
              label="Promo Code"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-tag"
              hide-details
              class="mb-4"
            ></v-text-field> -->
            
            <!-- Secure checkout info -->
            <div class="d-flex align-center justify-center mt-4">
              <v-icon size="small" class="mr-1">mdi-lock</v-icon>
              <span class="text-caption text-grey">Secure Checkout</span>
            </div>
            
            <!-- Payment methods -->
            <!-- <div class="payment-methods d-flex justify-center mt-4">
              <v-icon size="large" class="mx-1">mdi-credit-card</v-icon>
              <v-icon size="large" class="mx-1">mdi-paypal</v-icon>
              <v-icon size="large" class="mx-1">mdi-bank</v-icon>
            </div> -->
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Fixed checkout button for mobile -->
      <div v-if="cart.items.items.length > 0" class="fixed-checkout-button">
        <v-btn 
          color="primary" 
          block 
          :to="{ name: 'Checkout' }"
          size="large"
          class="checkout-btn d-flex align-center justify-space-between"
        >
          <span>Proceed to Checkout</span>
          <span>${{ cart.total_amount ? cart.total_amount.toFixed(2) : '0.00' }}</span>
        </v-btn>
      </div>
      
      <!-- Empty cart -->
      <v-card v-else class="empty-cart pa-6 text-center">
        <v-icon size="x-large" color="grey-lighten-1" class="mb-4">mdi-cart-off</v-icon>
        <h3 class="text-h5 mb-2">Your Cart is Empty</h3>
        <p class="text-body-1 text-grey mb-6">Looks like you haven't added any items to your cart yet.</p>
        <v-btn 
          color="primary" 
          size="large" 
          :to="{ name: 'Home' }"
        >
          Start Shopping
        </v-btn>
      </v-card>
      
      <!-- Suggested products -->
      <!-- <div v-if="cart.items.length > 0" class="suggested-products mt-8">
        <h2 class="text-h5 font-weight-medium mb-4">You Might Also Like</h2>
        <v-row>
          <v-col 
            v-for="i in 4" 
            :key="i" 
            cols="6" sm="3"
          >
            <v-card class="suggested-product-card" flat hover>
              <v-img 
                :src="`https://via.placeholder.com/300?text=Product ${i}`" 
                height="160" 
                cover
              ></v-img>
              <v-card-text class="pa-3">
                <div class="text-subtitle-2 font-weight-medium text-truncate">Suggested Product {{ i }}</div>
                <div class="d-flex justify-space-between align-center mt-1">
                  <div class="text-subtitle-1 font-weight-bold primary-color">${{ (19.99).toFixed(2) }}</div>
                  <v-btn 
                    icon="mdi-cart-plus" 
                    size="small" 
                    color="primary" 
                    variant="text"
                  ></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div> -->

      <!-- Add warning dialog -->
      <v-dialog v-model="showWarningDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Unsaved Changes</v-card-title>
          <v-card-text>
            You have unsaved changes in your cart. Are you sure you want to leave this page?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="showWarningDialog = false">
              Stay
            </v-btn>
            <v-btn color="error" variant="text" @click="handleLeave">
              Leave
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> 
    </v-container>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const cart = useCartStore()
const router = useRouter()

// Add computed property to group cart items by product
const groupedCartItems = computed(() => {
  const groups = {}
  
  cart.items.forEach(item => {
    const productId = item.product_id
    
    if (!groups[productId]) {
      groups[productId] = {
        product: {
          id: productId,
          name: item.product_name,
          main_image: item.main_image,
          seller_name: item.seller_name,
          delivery_info: item.delivery_info || "Standard Delivery"
        },
        variants: []
      }
    }
    
    groups[productId].variants.push({
      id: item.variant,
      name: item.variant_name,
      price: item.variant_price,
      quantity: item.quantity,
      stock: item.stock && item.stock.available ? item.stock.available : 0
    })
  })
  console.log('groups', Object.values(groups));
  
  return Object.values(groups)
})

// Add warning dialog
const showWarningDialog = ref(false)

// Handle page unload
const handleBeforeUnload = (e) => {
  if (cart.cartUpdated) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  // Add event listener for page unload
  window.addEventListener('beforeunload', handleBeforeUnload)
  try {
    // Initialize cart state
    cart.initCartState()
    
    // If cart is updated, sync with backend
    if (cart.cartUpdated) {
      await cart.syncCartWithBackend()
    } else {
      // Otherwise just fetch the latest cart state
      await cart.fetchCart()
    }
  } catch (error) {
    console.error('Failed to initialize cart:', error)
  }
  console.log('cartItems', cart.items.total_amount);
})

onBeforeUnmount(() => {
  // Remove event listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Update variant quantity with backend sync
const updateVariantQuantity = async (productId, variantId, newQuantity) => {
  try {
    await cart.updateVariantQuantity(productId, variantId, newQuantity)
    await cart.syncCartWithBackend()
  } catch (error) {
    console.error('Failed to update variant quantity:', error)
  }
}

// Update remove variant with backend sync
const removeVariant = async (productId, variantId) => {
  try {
    await cart.removeVariant(productId, variantId)
    await cart.syncCartWithBackend()
  } catch (error) {
    console.error('Failed to remove variant:', error)
  }
}
</script>

<style scoped>
.cart-page {
  padding-bottom: 84px; /* Increased to accommodate bottom fixed button */
}

.cart-items-container {
  background-color: white;
  border-radius: 8px;
}

.cart-item {
  padding: 16px;
}

.has-divider {
  border-bottom: 1px solid #f0f0f0;
}

.cart-item-image {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.cart-item-details {
  min-width: 0; /* Ensures proper text truncation */
}

.primary-color {
  color: var(--primary-color);
}

.quantity-display {
  min-width: 24px;
  text-align: center;
  font-weight: medium;
}

.order-summary {
  background-color: white;
  border-radius: 8px;
  position: sticky;
  top: 24px;
}

.suggested-product-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.suggested-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.empty-cart {
  margin: 32px auto;
  max-width: 500px;
  border-radius: 8px;
}

.checkout-btn {
  text-transform: none;
  font-weight: 600;
}

@media (max-width: 600px) {
  .cart-item-content {
    flex-direction: column;
  }
  
  .cart-item-image-container {
    margin-right: 0;
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .cart-item-image {
    width: 120px;
    height: 120px;
  }
}

.cart-product-group {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.cart-product-group:last-child {
  border-bottom: none;
}

.variants-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 8px;
}

.variant-item {
  border-bottom: 1px solid #e0e0e0;
}

.variant-item:last-child {
  border-bottom: none;
}

.quantity-controls {
  background-color: white;
  border-radius: 4px;
  padding: 2px;
}

.quantity-display {
  min-width: 32px;
  text-align: center;
  font-weight: bold;
}

.fixed-checkout-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 10;
}
</style>