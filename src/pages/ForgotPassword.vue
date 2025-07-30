<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg" style="background: linear-gradient(to right, #3b82f6, #9333ea);">
          <Mail class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-1">
          Reset Password
        </h1>
        <p class="text-gray-600 text-xs">Enter your email to receive a reset link</p>
      </div>

      <form @submit.prevent="onForgotPassword" class="space-y-4">
        <!-- Alert -->
        <div v-if="alert" :class="['alert', alertType === 'success' ? 'alert-success' : 'alert-error']">
          <CheckCircle v-if="alertType === 'success'" class="w-4 h-4" />
          <XCircle v-else class="w-4 h-4" />
          <span>{{ alert }}</span>
        </div>

        <!-- Email field -->
        <div class="space-y-1">
          <!-- <label for="email" class="block text-sm font-semibold text-gray-700">Email Address</label> -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              autocomplete="email"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">We'll send you a secure link to reset your password</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading || !email"
          class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending Reset Link...
          </span>
          <span v-else class="flex items-center justify-center">
            <Mail class="w-4 h-4 mr-2" />
            Send Reset Link
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-500">Remember your password?</span>
          </div>
        </div>

        <!-- Login link -->
        <div class="text-center">
          <router-link :to="{ name: 'Login' }" class="inline-flex items-center justify-center w-full h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
            <Lock class="w-4 h-4 mr-2" />
            Back to Sign In
          </router-link>
        </div>
      </form>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-xs text-gray-500">
          Need help? Contact our 
          <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">support team</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { Mail, CheckCircle, XCircle, Lock } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const alert = ref('')
const alertType = ref('success')
const loading = ref(false)

const onForgotPassword = async () => {
  if (!email.value) return

  loading.value = true
  alert.value = ''

  try {
    // get host url
    const hostUrl = window.location.origin
    await apiService.requestPasswordReset(email.value, hostUrl)
    alertType.value = 'success'
    alert.value = 'If your email exists in our system, a reset link has been sent to your email address.'
    email.value = ''
  } catch (error) {
    alertType.value = 'error'
    alert.value = error.response?.data?.error || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.auth-container {
  width: 100%;
}

.auth-content {
  padding: 24px;
  width: 100%;
}

.auth-title {
  font-size: 35px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a2233;
  width: 100%;
}

.auth-subtitle {
  font-size: 16px;
  color: #707a8a;
  margin-bottom: 28px;
  width: 100%;
}

.input-field {
  margin-bottom: 12px;
  width: 100%;
}

.auth-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  min-height: 48px;
  text-transform: none;
  margin-bottom: 16px;
  box-shadow: none;
  width: 100%;
}

.auth-link {
  margin-top: 16px;
  color: #707a8a;
  font-size: 15px;
  width: 100%;
}

.auth-link a {
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 4px;
  text-decoration: none;
}

.w-100 {
  width: 100%;
}

/* Media queries for better responsiveness */
@media screen and (max-width: 600px) {
  .auth-container {
    max-width: 100%;
  }

  .auth-content {
    padding: 20px 16px;
  }

  .auth-title {
    font-size: 35px;
  }

  .auth-subtitle {
    font-size: 17px;
  }
}

/* For very small screens */
@media screen and (max-width: 320px) {
  .auth-page {
    padding: 8px;
  }
}
</style>