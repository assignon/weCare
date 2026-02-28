<template>
  <div class="page-container pb-24">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button 
          @click="$router.push({ name: 'Cart' })"
          class="w-10 h-10 bg-white rounded-full shadow-card hover:shadow-float transition-all duration-200 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-navy" />
        </button>

        <h1 class="text-xl font-bold text-navy">Payment Failed</h1>

        <div class="w-10"></div>
      </div>

      <!-- Main Content -->
      <div class="max-w-md mx-auto">
        <!-- Failed Icon Section -->
        <div class="card p-8 mb-6 text-center">
          <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 failed-icon-container">
            <XCircle class="w-12 h-12 text-red-500 failed-icon" />
          </div>
          
          <h2 class="text-2xl font-bold text-navy mb-3">Payment Failed</h2>
          <p class="text-grey-500 mb-2">We couldn't process your payment</p>
          <p class="text-sm text-grey-400">
            Don't worry, your order hasn't been placed. Please check your payment details and try again.
          </p>
        </div>

        <!-- Error Details -->
        <div v-if="errorDetails" class="bg-red-50 rounded-2xl p-6 mb-6">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertCircle class="w-4 h-4 text-red-600" />
            </div>
            <h3 class="font-semibold text-red-900">Error Details</h3>
          </div>
          <p class="text-sm text-red-700 leading-relaxed">{{ errorDetails }}</p>
        </div>

        <!-- Common Issues -->
        <div class="card p-6 mb-6">
          <h3 class="font-semibold text-navy mb-4 flex items-center">
            <div class="w-8 h-8 bg-grey-50 rounded-full flex items-center justify-center mr-3">
              <Info class="w-4 h-4 text-navy" />
            </div>
            Common reasons for payment failure
          </h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-grey-200 rounded-full"></div>
              <span class="text-sm text-grey-500">Insufficient funds in your account</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-grey-200 rounded-full"></div>
              <span class="text-sm text-grey-500">Incorrect payment details</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-grey-200 rounded-full"></div>
              <span class="text-sm text-grey-500">Network connectivity issues</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-grey-200 rounded-full"></div>
              <span class="text-sm text-grey-500">Card expired or blocked</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4 mb-6">
          <button 
            @click="$router.push({ name: 'Checkout' })"
            class="btn-cta flex items-center justify-center space-x-2"
          >
            <RefreshCw class="w-5 h-5" />
            <span>Try Again</span>
          </button>
          
          <button 
            @click="$router.push({ name: 'Cart' })"
            class="btn btn-outlined w-full py-4 flex items-center justify-center space-x-2"
          >
            <ShoppingCart class="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <button 
            @click="$router.push({ name: 'Home' })"
            class="w-full py-3 text-grey-400 font-medium hover:text-navy transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home class="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <!-- Support Contact -->
        <div class="card-flat p-6 text-center">
          <div class="w-12 h-12 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle class="w-6 h-6 text-navy" />
          </div>
          <h3 class="font-semibold text-navy mb-2">Need Help?</h3>
          <p class="text-sm text-grey-500 mb-4">
            Contact our support team if you continue to experience issues with your payment.
          </p>
          <button class="btn btn-primary px-6 py-2">
            Contact Support
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Notification -->
    <div 
      v-if="showNotification" 
      :class="[
        'fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-float transition-all duration-300 transform',
        notificationColor === 'error' ? 'bg-red-50' : 'bg-green-50',
        showNotification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center',
            notificationColor === 'error' ? 'bg-red-100' : 'bg-green-100'
          ]">
            <AlertCircle v-if="notificationColor === 'error'" class="w-4 h-4 text-red-600" />
            <CheckCircle v-else class="w-4 h-4 text-green-600" />
          </div>
          <span :class="[
            'font-medium',
            notificationColor === 'error' ? 'text-red-900' : 'text-green-900'
          ]">{{ notificationText }}</span>
        </div>
        <button 
          @click="showNotification = false"
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            notificationColor === 'error' ? 'hover:bg-red-100' : 'hover:bg-green-100'
          ]"
        >
          <X class="w-4 h-4 text-grey-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, XCircle, AlertCircle, Info, RefreshCw, 
  ShoppingCart, Home, HelpCircle, CheckCircle, X 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Component state
const errorDetails = ref(null)
const showNotification = ref(false)
const notificationText = ref('')
const notificationColor = ref('error')

// Get error details from route params if available
onMounted(() => {
  if (route.query.error) {
    errorDetails.value = route.query.error
  }
  
  if (route.query.message) {
    showError(route.query.message)
  }
})

// Show error message
const showError = (message) => {
  notificationColor.value = 'error'
  notificationText.value = message
  showNotification.value = true
  
  // Auto hide after 4 seconds
  setTimeout(() => {
    showNotification.value = false
  }, 4000)
}
</script>

<style scoped>
.failed-icon-container {
  position: relative;
}

.failed-icon {
  animation: failedPulse 2s ease-in-out infinite;
}

@keyframes failedPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
</style>