<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-content">
        <h1 class="auth-title">Forgot Password</h1>
        <p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
        
        <v-form ref="form" v-model="isFormValid" @submit.prevent="onForgotPassword" class="w-100">
          <v-alert v-if="alert" :type="alertType" class="mb-4" variant="tonal" density="compact" closable>
            {{ alert }}
          </v-alert>
          
          <div class="input-field">
            <v-text-field
              v-model="email"
              label="Email"
              :rules="emailRules"
              variant="outlined"
              class="mb-4"
              autocomplete="email"
              prepend-inner-icon="mdi-email"
              hide-details="auto"
              width="100%"
            />
          </div>
          
          <v-btn 
            block 
            color="#1a2233" 
            type="submit" 
            :loading="loading" 
            :disabled="!isFormValid" 
            class="auth-btn"
          >
            Send Reset Link
          </v-btn>
          
          <div class="text-center auth-link">
            Remember your password? <router-link :to="{ name: 'Login' }">Sign In</router-link>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'

const router = useRouter()
const form = ref(null)
const isFormValid = ref(false)
const email = ref('')
const alert = ref('')
const alertType = ref('success')
const loading = ref(false)

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const onForgotPassword = async () => {
  if (!isFormValid.value) return

  loading.value = true
  alert.value = ''
  
  try {
    await apiService.requestPasswordReset(email.value)
    alertType.value = 'success'
    alert.value = 'If your email exists in our system, a reset link has been sent to your email address.'
    email.value = ''
    form.value.reset()
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