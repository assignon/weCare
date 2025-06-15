<template>
  <div class="payment-success-page">
    <v-container class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-8" elevation="0" variant="text">
            <!-- Success Animation/Icon -->
            <div class="success-icon-container mb-6">
              <v-icon size="120" color="success" class="success-icon">
                mdi-check-circle
              </v-icon>
            </div>

            <!-- Success Message -->
            <h1 class="text-h4 font-weight-bold mb-4 success-title">
              Payment Successful!
            </h1>

            <p class="text-h6 mb-2 text-grey-darken-1">
              Your order has been placed successfully
            </p>

            <p class="text-body-1 mb-6 text-grey-darken-2">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>

            <!-- Order Details (if available) -->
            <v-card v-if="orderDetails" class="mb-6 pa-4" variant="tonal" color="success">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2 font-weight-medium">Order Number:</span>
                <span class="text-subtitle-2 font-weight-bold">#{{ orderDetails.order_number || 'N/A' }}</span>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2 font-weight-medium">Total Amount:</span>
                <span class="text-subtitle-2 font-weight-bold">{{ formatApiPrice({
                  price: orderDetails.total_amount ||
                    0, currency_info: orderDetails.currency_info }) }}</span>
              </div>

              <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2 font-weight-medium">Payment Method:</span>
                <span class="text-subtitle-2 font-weight-bold text-capitalize">{{ orderDetails.payment_method || 'N/A'
                }}</span>
              </div>
            </v-card>

            <!-- Loading state while fetching orders -->
            <div v-if="loading" class="mb-6">
              <v-progress-circular indeterminate color="primary" class="mb-2"></v-progress-circular>
              <p class="text-body-2 text-grey-darken-1">Processing your order...</p>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-column gap-3">
              <v-btn color="primary" size="large" block :to="{ name: 'Orders' }" class="text-none" rounded>
                <v-icon left>mdi-package-variant</v-icon>
                View My Orders
              </v-btn>

              <v-btn variant="outlined" color="primary" size="large" block :to="{ name: 'Home' }" class="text-none"
                rounded>
                <v-icon left>mdi-home</v-icon>
                Continue Shopping
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="4000" location="top">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useCurrency } from '@/composables/useCurrency'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const { formatApiPrice } = useCurrency()

// Component state
const loading = ref(false)
const orderDetails = ref(null)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Get order details from route params if available
onMounted(async () => {
  // Get order details from route query/params
  if (route.query.order_id) {
    orderDetails.value = {
      order_number: route.query.order_number || route.query.order_id,
      total_amount: route.query.total_amount,
      payment_method: route.query.payment_method
    }
  }

  // Fetch latest orders to update the orders list
  // await fetchOrders()

  // Clear the cart since payment was successful
  await clearCart()
})

// Fetch orders from API
// const fetchOrders = async () => {
//   loading.value = true
//   try {
//     await apiService.getOrders()
//     console.log('Orders fetched successfully after payment')
//   } catch (error) {
//     console.error('Error fetching orders after payment:', error)
//     showError('Failed to fetch latest orders')
//   } finally {
//     loading.value = false
//   }
// }

// Clear cart after successful payment
const clearCart = async () => {
  try {
    await cart.clearCart()
    console.log('Cart cleared after successful payment')
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

// Show error message
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.success-icon-container {
  position: relative;
}

.success-icon {
  animation: successPulse 2s ease-in-out infinite;
}

.success-title {
  color: #2e7d32;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.gap-3 {
  gap: 12px;
}

@media (max-width: 600px) {
  .success-icon {
    font-size: 80px !important;
  }

  .success-title {
    font-size: 1.75rem !important;
  }
}
</style>