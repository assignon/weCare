<template>
  <div class="payment-failed-page">
    <v-container class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-8" elevation="0">
            <!-- Failed Animation/Icon -->
            <div class="failed-icon-container mb-6">
              <v-icon 
                size="120" 
                color="error" 
                class="failed-icon"
              >
                mdi-close-circle
              </v-icon>
            </div>
            
            <!-- Failed Message -->
            <h1 class="text-h4 font-weight-bold mb-4 failed-title">
              Payment Failed
            </h1>
            
            <p class="text-h6 mb-2 text-grey-darken-1">
              We couldn't process your payment
            </p>
            
            <p class="text-body-1 mb-6 text-grey-darken-2">
              Don't worry, your order hasn't been placed. Please check your payment details and try again.
            </p>
            
            <!-- Error Details (if available) -->
            <v-card 
              v-if="errorDetails" 
              class="mb-6 pa-4" 
              variant="tonal" 
              color="error"
            >
              <div class="d-flex align-center mb-2">
                <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                <span class="text-subtitle-2 font-weight-medium">Error Details:</span>
              </div>
              <p class="text-body-2 mb-0">{{ errorDetails }}</p>
            </v-card>
            
            <!-- Common reasons -->
            <v-card class="mb-6 pa-4" variant="outlined">
              <p class="text-subtitle-2 font-weight-medium mb-3">Common reasons for payment failure:</p>
              <ul class="text-body-2 text-left text-grey-darken-1">
                <li class="mb-1">Insufficient funds in your account</li>
                <li class="mb-1">Incorrect payment details</li>
                <li class="mb-1">Network connectivity issues</li>
                <li class="mb-1">Card expired or blocked</li>
              </ul>
            </v-card>
            
            <!-- Action Buttons -->
            <div class="d-flex flex-column gap-3">
              <v-btn 
                color="primary" 
                size="large" 
                block
                :to="{ name: 'Checkout' }"
                class="text-none"
                rounded
              >
                <v-icon left>mdi-refresh</v-icon>
                Try Again
              </v-btn>
              
              <v-btn 
                variant="outlined" 
                color="primary" 
                size="large" 
                block
                :to="{ name: 'Cart' }"
                class="text-none"
                rounded
              >
                <v-icon left>mdi-cart</v-icon>
                Back to Cart
              </v-btn>
              
              <v-btn 
                variant="text" 
                color="grey" 
                size="large" 
                block
                :to="{ name: 'Home' }"
                class="text-none"
                rounded
              >
                <v-icon left>mdi-home</v-icon>
                Continue Shopping
              </v-btn>
            </div>
            
            <!-- Support contact -->
            <div class="mt-6 pa-4 bg-grey-lighten-4 rounded">
              <p class="text-body-2 mb-2">
                <v-icon size="small" class="mr-1">mdi-help-circle</v-icon>
                Need help?
              </p>
              <p class="text-caption text-grey-darken-1 mb-0">
                Contact our support team if you continue to experience issues with your payment.
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="4000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Component state
const errorDetails = ref(null)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('error')

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
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}
</script>

<style scoped>
.payment-failed-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.failed-icon-container {
  position: relative;
}

.failed-icon {
  animation: failedShake 1s ease-in-out;
}

.failed-title {
  color: #c62828;
}

@keyframes failedShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.gap-3 {
  gap: 12px;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}

@media (max-width: 600px) {
  .failed-icon {
    font-size: 80px !important;
  }
  
  .failed-title {
    font-size: 1.75rem !important;
  }
}
</style> 