<template>
  <div class="cart-page">
    <v-container>
      <h1 class="text-h5 font-weight-bold mb-6">Shopping Cart</h1>
      
      <v-row v-if="cart.items.length > 0">
        <!-- Cart items -->
        <v-col cols="12" md="8">
          <v-card class="cart-items-container mb-4" flat>
            <div 
              v-for="(item, index) in cart.items" 
              :key="item.cartItemId || item.id"
              class="cart-item"
              :class="{ 'has-divider': index < cart.items.length - 1 }"
            >
              <div class="d-flex cart-item-content">
                <!-- Product image -->
                <div class="cart-item-image-container mr-4">
                  <v-img 
                    :src="item.image || 'https://via.placeholder.com/150'" 
                    width="100" 
                    height="100" 
                    class="cart-item-image"
                    cover
                  ></v-img>
                </div>
                
                <!-- Product details -->
                <div class="cart-item-details flex-grow-1">
                  <div class="d-flex justify-space-between">
                    <div>
                      <h3 class="text-subtitle-1 font-weight-medium">{{ item.name }}</h3>
                      <div class="text-body-2 text-grey mb-2">SKU: {{ item.id }}</div>
                      <div v-if="item.selectedSize" class="text-body-2 mb-2">Size: {{ item.selectedSize }}</div>
                    </div>
                    <v-btn density="compact" icon="mdi-close" variant="text" @click="removeItem(item)"></v-btn>
                  </div>
                  
                  <div class="d-flex flex-wrap justify-space-between align-center">
                    <div class="quantity-controls d-flex align-center">
                      <v-btn 
                        variant="tonal" 
                        size="small" 
                        icon="mdi-minus" 
                        density="compact"
                        @click="decreaseQuantity(item)"
                        :disabled="item.quantity <= 1"
                      ></v-btn>
                      <span class="quantity-display mx-3">{{ item.quantity }}</span>
                      <v-btn 
                        variant="tonal" 
                        size="small" 
                        icon="mdi-plus" 
                        density="compact"
                        @click="increaseQuantity(item)"
                      ></v-btn>
                    </div>
                    
                    <div class="item-price text-subtitle-1 font-weight-bold primary-color mt-2 mt-sm-0">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </div>
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
          <v-card class="order-summary pa-4">
            <h2 class="text-h6 font-weight-bold mb-4">Order Summary</h2>
            
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1">Items ({{ cart.totalItems }})</span>
              <span class="text-body-1">${{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1">Shipping</span>
              <span class="text-body-1">$0.00</span>
            </div>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="d-flex justify-space-between mb-4">
              <span class="text-subtitle-1 font-weight-bold">Total</span>
              <span class="text-h6 font-weight-bold primary-color">${{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            
            <!-- Promo code -->
            <v-text-field
              label="Promo Code"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-tag"
              hide-details
              class="mb-4"
            ></v-text-field>
            
            <!-- Checkout button -->
            <v-btn 
              color="primary" 
              block 
              :to="{ name: 'Checkout' }"
              size="large"
              class="checkout-btn"
            >
              Proceed to Checkout
            </v-btn>
            
            <!-- Secure checkout info -->
            <div class="d-flex align-center justify-center mt-4">
              <v-icon size="small" class="mr-1">mdi-lock</v-icon>
              <span class="text-caption text-grey">Secure Checkout</span>
            </div>
            
            <!-- Payment methods -->
            <div class="payment-methods d-flex justify-center mt-4">
              <v-icon size="large" class="mx-1">mdi-credit-card</v-icon>
              <v-icon size="large" class="mx-1">mdi-paypal</v-icon>
              <v-icon size="large" class="mx-1">mdi-bank</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>
      
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
      <div v-if="cart.items.length > 0" class="suggested-products mt-8">
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
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const cart = useCartStore()
const router = useRouter()

const increaseQuantity = (item) => {
  cart.updateQuantity(item.cartItemId || item.id, item.quantity + 1)
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cart.updateQuantity(item.cartItemId || item.id, item.quantity - 1)
  }
}

const removeItem = (item) => {
  cart.removeFromCart(item.cartItemId || item.id)
}
</script>

<style scoped>
.cart-page {
  padding-bottom: 64px;
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
</style> 