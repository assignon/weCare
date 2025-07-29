<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p class="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

        <form @submit.prevent="onForgotPassword" class="space-y-4">
          <!-- Alert Message -->
          <div v-if="alert" :class="[
            'border rounded-lg p-3 flex items-center justify-between',
            alertType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          ]">
            <div class="flex items-center">
              <CheckCircle v-if="alertType === 'success'" class="w-5 h-5 text-green-500 mr-2" />
              <AlertCircle v-else class="w-5 h-5 text-red-500 mr-2" />
              <span :class="alertType === 'success' ? 'text-green-800' : 'text-red-800'" class="text-sm">{{ alert }}</span>
            </div>
            <button @click="alert = ''" type="button" :class="alertType === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Email Field -->
          <div>
            <label class="form-label">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                :class="[
                  'input-field pl-10',
                  emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Enter your email"
                @blur="validateEmail"
              />
            </div>
            <p v-if="emailError" class="text-red-500 text-xs mt-1">{{ emailError }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="btn-primary w-full py-3 text-base flex items-center justify-center"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Send Reset Link
          </button>

          <!-- Sign In Link -->
          <div class="text-center text-gray-600 text-sm">
            Remember your password? 
            <router-link :to="{ name: 'Login' }" class="text-primary font-medium hover:underline ml-1">
              Sign In
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { CheckCircle, AlertCircle, X, Mail } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const emailError = ref('')
const alert = ref('')
const alertType = ref('success')
const loading = ref(false)

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Email must be valid'
  } else {
    emailError.value = ''
  }
}

const isFormValid = computed(() => {
  return email.value && 
         !emailError.value &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const onForgotPassword = async () => {
  // Validate field before submitting
  validateEmail()
  
  if (!isFormValid.value) return

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
/* Component-specific styles if needed */
</style>