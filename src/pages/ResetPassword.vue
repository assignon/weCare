<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
        <!-- Header Section -->
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg" style="background: linear-gradient(to right, #3b82f6, #9333ea);">
            <Lock class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-1">Reset Password</h1>
          <p class="text-gray-600 text-xs">Enter your new password below.</p>
        </div>


        <form @submit.prevent="onResetPassword" class="space-y-4">
          <!-- Alert -->
          <div v-if="alert" :class="['alert', alertType === 'success' ? 'alert-success' : 'alert-error']">
            <CheckCircle v-if="alertType === 'success'" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
            <span>{{ alert }}</span>
          </div>

          <!-- Invalid Code State -->
          <div v-if="isValidCode === false && !loading" class="text-center space-y-4">
            <AlertCircle class="w-16 h-16 text-red-500 mx-auto" />
            <h3 class="text-xl font-semibold text-gray-900">Invalid Reset Link</h3>
            <p class="text-gray-600">This password reset link is invalid or has expired. Please request a new one.</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <router-link :to="{ name: 'ForgotPassword' }" class="inline-flex items-center justify-center px-4 py-2 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                Request New Link
              </router-link>
              <router-link :to="{ name: 'Login' }" class="inline-flex items-center justify-center px-4 py-2 h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
                Back to Login
              </router-link>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loading || isValidCode === null" class="text-center space-y-4">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-gray-600">Validating reset link...</p>
          </div>

          <!-- Valid Code State -->
          <div v-else-if="isValidCode === true" class="space-y-4">
            <!-- New Password field -->
            <div class="space-y-1">
              <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12"
                  placeholder="Enter your new password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <!-- Confirm Password field -->
            <div class="space-y-1">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12"
                  placeholder="Confirm your new password"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="space-y-2">
              <div class="bg-red-50 border border-red-200 rounded-md p-3">
                <div class="flex">
                  <XCircle class="h-5 w-5 text-red-400" />
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <div class="mt-2 text-sm text-red-700">
                      <ul class="list-disc pl-5 space-y-1">
                        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </span>
              <span v-else>Reset Password</span>
            </button>
            

          </div>

          <!-- Login link -->
          <div class="text-center text-gray-600">
            Remember your password? 
            <router-link :to="{ name: 'Login' }" class="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiService } from '@/services/api'
import { 
  Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle 
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const alert = ref('')
const alertType = ref('success')
const loading = ref(true) // Start with loading true while validating
const isValidCode = ref(null) // Start with null to indicate unknown state

// Form validation
const isFormValid = computed(() => {
  return password.value && 
         confirmPassword.value && 
         password.value === confirmPassword.value &&
         password.value.length >= 8 &&
         /[A-Z]/.test(password.value) &&
         /[a-z]/.test(password.value) &&
         /[0-9]/.test(password.value)
})

// Validation errors
const validationErrors = computed(() => {
  const errors = []
  
  if (!password.value) {
    errors.push('Password is required')
  } else {
    if (password.value.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password.value)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password.value)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password.value)) {
      errors.push('Password must contain at least one number')
    }
  }
  
  if (!confirmPassword.value) {
    errors.push('Please confirm your password')
  } else if (password.value !== confirmPassword.value) {
    errors.push('Passwords do not match')
  }
  
  if (isValidCode.value === false) {
    errors.push('Reset link is invalid or has expired')
  }
  
  return errors
})



const validateResetCode = async () => {
  const code = route.params.code
  console.log('route.params==============', route.params.code)

  if (!code) {
    isValidCode.value = false
    alertType.value = 'error'
    alert.value = 'No reset code provided in the URL.'
    loading.value = false
    return
  }

  try {
    console.log('🔍 [RESET PAGE] About to validate reset code:', code)
    console.log('🔍 [RESET PAGE] Current URL:', window.location.href)

    // Check if the reset code is valid
    const response = await apiService.validateResetCode(code)
    console.log('🔍 [RESET PAGE] Validation response:', response)

    isValidCode.value = true
    alert.value = '' // Clear any previous alerts
    alertType.value = 'success'
  } catch (error) {
    console.error('🔍 [RESET PAGE] Validation error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    })

    isValidCode.value = false
    alertType.value = 'error'

    // Set appropriate error message based on the error
    if (error.response?.status === 400 || error.response?.status === 404) {
      alert.value = 'This reset link is invalid or has expired.'
    } else if (error.response?.status === 401) {
      alert.value = 'Authentication error while validating reset link. This might be a server configuration issue.'
    } else {
      alert.value = 'Unable to validate reset link. Please try again.'
    }

    console.error('Reset code validation error:', error)
  } finally {
    loading.value = false
  }
}

const onResetPassword = async () => {
  console.log('🔍 [RESET PAGE] onResetPassword called')
  console.log('🔍 [RESET PAGE] validationErrors:', validationErrors.value)
  
  // Check for validation errors
  if (validationErrors.value.length > 0) {
    console.log('🔍 [RESET PAGE] Validation errors found, not proceeding')
    return
  }

  loading.value = true
  alert.value = ''

  try {
    const code = route.params.code
    console.log('🔍 [RESET PAGE] About to confirm password reset:', {
      code: code,
      hasPassword: !!password.value,
      passwordLength: password.value?.length
    })

    const response = await apiService.confirmPasswordReset(code, password.value)
    console.log('🔍 [RESET PAGE] Password reset response:', response)

    alertType.value = 'success'
    alert.value = 'Password reset successfully! Redirecting to login...'

    // Clear form
    password.value = ''
    confirmPassword.value = ''

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push({ name: 'Login', query: { message: 'Password reset successfully. Please log in with your new password.' } })
    }, 2000)

  } catch (error) {
    console.error('🔍 [RESET PAGE] Password reset error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    })

    alertType.value = 'error'
    if (error.response?.status === 400 || error.response?.status === 404) {
      alert.value = 'This reset link is invalid or has expired. Please request a new one.'
      isValidCode.value = false
    } else if (error.response?.status === 401) {
      alert.value = 'Authentication error during password reset. This might be a server configuration issue.'
    } else {
      alert.value = error.response?.data?.error || error.response?.data?.message || 'Failed to reset password. Please try again.'
    }
    console.error('Password reset error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  validateResetCode()
})
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