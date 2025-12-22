<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Success Card -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center">
        <!-- Success Icon -->
        <div class="mb-8">
          <div class="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style="background: linear-gradient(to right, #4ade80, #10b981);">
            <CheckCircle class="w-12 h-12 text-white" />
          </div>
        </div>

        <!-- Success Message -->
        <h1 class="text-3xl font-bold text-gray-900 mb-3">
          {{ $t('payment_success.title') }}
        </h1>

        <p class="text-lg text-gray-700 mb-2">
          {{ $t('payment_success.order_placed') }}
        </p>

        <p class="text-gray-600 mb-8">
          {{ $t('payment_success.thank_you') }}
        </p>

        <!-- Order Details (if available) -->
        <div v-if="orderDetails" class="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2">
                <Receipt class="w-4 h-4 text-green-600" />
                <span class="text-sm font-medium text-gray-700">{{ $t('payment_success.order_number') }}:</span>
              </div>
              <span class="text-sm font-bold text-gray-900">#{{ orderDetails.order_number || $t('payment_success.na') }}</span>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2">
                <CreditCard class="w-4 h-4 text-green-600" />
                <span class="text-sm font-medium text-gray-700">{{ $t('payment_success.total_amount') }}:</span>
              </div>
              <span class="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                {{ formatApiPrice({
                  price: orderDetails.total_amount || 0, 
                  currency_info: orderDetails.currency_info 
                }) }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2">
                <Smartphone class="w-4 h-4 text-green-600" />
                <span class="text-sm font-medium text-gray-700">{{ $t('payment_success.payment_method') }}:</span>
              </div>
              <span class="text-sm font-bold text-gray-900">{{ getPaymentMethodLabel(orderDetails.payment_method) }}</span>
            </div>
          </div>
        </div>

        <!-- Loading state while fetching orders -->
        <div v-if="loading" class="mb-8">
          <div class="flex items-center justify-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            <p class="text-gray-600">{{ $t('payment_success.processing') }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <button 
            @click="$router.push({ name: 'Orders' })"
            class="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style="background: linear-gradient(to right, #16a34a, #10b981);"
          >
            <Package class="w-5 h-5 mr-2" />
            {{ $t('payment_success.view_orders') }}
          </button>

          <button 
            @click="$router.push({ name: 'Home' })"
            class="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-green-500 hover:text-green-600 transition-all duration-200 flex items-center justify-center"
          >
            <Home class="w-5 h-5 mr-2" />
            {{ $t('payment_success.continue_shopping') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <div 
      v-if="showSnackbar" 
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-sm w-full mx-4"
    >
      <div class="flex items-center space-x-3">
        <div 
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center',
            snackbarColor === 'success' ? 'bg-green-100' : 'bg-red-100'
          ]"
        >
          <CheckCircle v-if="snackbarColor === 'success'" class="w-4 h-4 text-green-600" />
          <XCircle v-else class="w-4 h-4 text-red-600" />
        </div>
        <span class="text-sm font-medium text-gray-900">{{ snackbarText }}</span>
        <button 
          @click="showSnackbar = false"
          class="ml-auto text-gray-400 hover:text-gray-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useCurrency } from '@/composables/useCurrency'
import { 
  CheckCircle, Package, Home, Receipt, CreditCard, Smartphone, X, XCircle 
} from 'lucide-vue-next'

const { t } = useI18n()

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

// Get payment method label
const getPaymentMethodLabel = (method) => {
  if (!method) return t('payment_success.na')
  if (method === 'mobile_money') return t('payment_success.mobile_money')
  return method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')
}

// Show error message
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}
</script>
