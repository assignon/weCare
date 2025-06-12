<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-content">
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">Enter your new password below.</p>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="onResetPassword" class="w-100">
          <v-alert v-if="alert" :type="alertType" class="mb-4" variant="tonal" density="compact" closable>
            {{ alert }}
          </v-alert>

          <div v-if="isValidCode === false && !loading" class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
            <h3 class="mb-4">Invalid Reset Link</h3>
            <p class="mb-4">This password reset link is invalid or has expired. Please request a new one.</p>
            <v-btn color="primary" :to="{ name: 'ForgotPassword' }" class="mr-2 text-none">Request New Link</v-btn>
            <v-btn color="secondary" :to="{ name: 'Login' }" class="text-none">Back to Login</v-btn>
          </div>

          <div v-else-if="loading || isValidCode === null" class="text-center">
            <v-progress-circular indeterminate size="64" class="mb-4"></v-progress-circular>
            <p>Validating reset link...</p>
          </div>

          <div v-else-if="isValidCode === true">
            <div class="input-field">
              <v-text-field v-model="password" label="New Password" :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4"
                autocomplete="new-password" prepend-inner-icon="mdi-lock" hide-details="auto" width="100%" />
            </div>

            <div class="input-field">
              <v-text-field v-model="confirmPassword" label="Confirm New Password" :rules="confirmPasswordRules"
                :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4"
                autocomplete="new-password" prepend-inner-icon="mdi-lock" hide-details="auto" width="100%" />
            </div>

            <v-btn block color="#1a2233" type="submit" :loading="loading" :disabled="!isFormValid" class="auth-btn">
              Reset Password
            </v-btn>
          </div>

          <div class="text-center auth-link">
            Remember your password? <router-link :to="{ name: 'Login' }">Sign In</router-link>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiService } from '@/services/api'

const router = useRouter()
const route = useRoute()
const form = ref(null)
const isFormValid = ref(false)
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const alert = ref('')
const alertType = ref('success')
const loading = ref(true) // Start with loading true while validating
const isValidCode = ref(null) // Start with null to indicate unknown state

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 8 || 'Password must be at least 8 characters',
  v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
  v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
  v => /[0-9]/.test(v) || 'Password must contain at least one number'
]

const confirmPasswordRules = [
  v => !!v || 'Confirm password is required',
  v => v === password.value || 'Passwords must match'
]

const validateResetCode = async () => {
  const code = route.params.code
  // get route params value
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
  if (!isFormValid.value || isValidCode.value !== true) return

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
    form.value?.resetValidation()

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