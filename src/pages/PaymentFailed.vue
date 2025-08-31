<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 pb-24">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button 
          @click="$router.push({ name: 'Cart' })"
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>

        <h1 class="text-xl font-bold text-gray-900">Payment Failed</h1>

        <div class="w-10"></div>
      </div>

      <!-- Main Content -->
      <div class="max-w-md mx-auto">
        <!-- Failed Icon Section -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 mb-6 text-center">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 failed-icon-container">
            <XCircle class="w-12 h-12 text-red-500 failed-icon" />
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h2>
          <p class="text-gray-600 mb-2">We couldn't process your payment</p>
          <p class="text-sm text-gray-500">
            Don't worry, your order hasn't been placed. Please check your payment details and try again.
          </p>
        </div>

        <!-- Error Details -->
        <div v-if="errorDetails" class="bg-red-50/80 backdrop-blur-sm rounded-3xl shadow-sm border border-red-100 p-6 mb-6">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertCircle class="w-4 h-4 text-red-600" />
            </div>
            <h3 class="font-semibold text-red-900">Error Details</h3>
          </div>
          <p class="text-sm text-red-700 leading-relaxed">{{ errorDetails }}</p>
        </div>

        <!-- Common Issues -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6 mb-6">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Info class="w-4 h-4 text-blue-600" />
            </div>
            Common reasons for payment failure
          </h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span class="text-sm text-gray-600">Insufficient funds in your account</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span class="text-sm text-gray-600">Incorrect payment details</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span class="text-sm text-gray-600">Network connectivity issues</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span class="text-sm text-gray-600">Card expired or blocked</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4 mb-6">
          <button 
            @click="$router.push({ name: 'Checkout' })"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <RefreshCw class="w-5 h-5" />
            <span>Try Again</span>
          </button>
          
          <button 
            @click="$router.push({ name: 'Cart' })"
            class="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingCart class="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <button 
            @click="$router.push({ name: 'Home' })"
            class="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home class="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <!-- Support Contact -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-6 text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p class="text-sm text-gray-600 mb-4">
            Contact our support team if you continue to experience issues with your payment.
          </p>
          <button class="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Notification -->
    <div 
      v-if="showNotification" 
      :class="[
        'fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-lg transition-all duration-300 transform',
        notificationColor === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200',
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
          <X class="w-4 h-4 text-gray-500" />
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

/* Mobile responsiveness */
@media (max-width: 640px) {
  .failed-icon-container {
    width: 20rem;
    height: 5rem;
  }
}
</style>