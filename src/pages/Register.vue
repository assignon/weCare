<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- <div class="auth-illustration">
        <img src="/src/assets/images/register-illustration.svg" alt="Register illustration" />
      </div> -->
      
      <div class="auth-content">
        <h1 class="auth-title">Register</h1>
        <p class="auth-subtitle">Please register to login.</p>
        
        <v-form ref="form" v-model="isFormValid" @submit.prevent="onRegister" class="w-100">
          <v-alert v-if="authStore.error" type="error" class="mb-4" variant="tonal" density="compact" closable>
            {{ authStore.error }}
          </v-alert>
          
          <div class="input-field">
            <v-text-field
              v-model="formData.email"
              label="Email"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              variant="outlined"
              autocomplete="email"
              prepend-inner-icon="mdi-email"
              hide-details="auto"
              width="100%"
            ></v-text-field>
          </div>
          
          <div class="input-field">
            <v-text-field
              v-model="formData.mobile"
              label="Mobile Number"
              :rules="[v => !!v || 'Mobile number is required']"
              variant="outlined"
              autocomplete="tel"
              prepend-inner-icon="mdi-cellphone"
              hide-details="auto"
              width="100%"
            ></v-text-field>
          </div>
          <div class="input-field">
            <v-text-field
              v-model="formData.password"
              label="Password"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              autocomplete="new-password"
              prepend-inner-icon="mdi-lock"
              hide-details="auto"
              width="100%"
            ></v-text-field>
          </div>
          <div class="input-field">
            <v-text-field
              v-model="formData.password_confirm"
              label="Confirm Password"
              :rules="confirmPasswordRules"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              autocomplete="new-password"
              prepend-inner-icon="mdi-lock"
              hide-details="auto"
              width="100%"
            ></v-text-field>
          </div>
          
          <div class="input-field">
            <v-select
              v-model="formData.default_language"
              :items="languages"
              item-title="name"
              item-value="id"
              label="Preferred Language"
              variant="outlined"
              prepend-inner-icon="mdi-translate"
              hide-details="auto"
              width="100%"
              :loading="loadingLanguages"
              :disabled="loadingLanguages"
            ></v-select>
          </div>
          
          <v-btn 
            block 
            color="#1a2233" 
            type="submit" 
            :loading="authStore.loading" 
            :disabled="!isFormValid" 
            class="auth-btn"
          >
            Sign Up
          </v-btn>
          
          <div class="text-center auth-link">
            Already have account? <router-link :to="{ name: 'Login' }">Sign In</router-link>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const form = ref(null)
const isFormValid = ref(false)
const showPassword = ref(false)
const languages = ref([])
const loadingLanguages = ref(false)

const formData = ref({
  email: '',
  mobile: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  default_language: null
})

const passwordRules = [
  v => !!v || 'Password is required', 
  v => v.length >= 8 || 'Password must be at least 8 characters',
  v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
  v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
  v => /[0-9]/.test(v) || 'Password must contain at least one number'
]

const confirmPasswordRules = [
  v => !!v || 'Confirm password is required', 
  v => v === formData.value.password || 'Passwords must match'
]

// Fetch available languages
const fetchLanguages = async () => {
  loadingLanguages.value = true
  try {
    const response = await apiService.getLanguages()
    languages.value = response.data.results || response.data || []
    
    // Set English as default if available
    if (languages.value.length > 0 && !formData.value.default_language) {
      const english = languages.value.find(lang => lang.code === 'en')
      if (english) {
        formData.value.default_language = english.id
      } else {
        formData.value.default_language = languages.value[0].id
      }
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error)
  } finally {
    loadingLanguages.value = false
  }
}

const onRegister = async () => {
  if (!isFormValid.value) return
  
  // Prepare registration data with phone_number field name
  const registrationData = {
    ...formData.value,
    phone_number: formData.value.mobile
  }
  delete registrationData.mobile
  
  const success = await authStore.register(registrationData)
  
  if (success) {
    // If registration includes login (tokens), redirect to home
    if (authStore.isAuthenticated) {
      router.push('/')
    }
    // Otherwise, login page with registered=true will be handled by the store
  }
}

onMounted(async () => {
  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    router.replace({ name: 'Home' })
  }
  
  // Fetch languages for selection
  await fetchLanguages()
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

/* .auth-illustration {
  width: 100%;
  background-color: #f0f2f8;
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.auth-illustration img {
  height: 180px;
  width: auto;
  max-width: 100%;
} */

.auth-content {
  padding: 24px;
  width: 100%;
  /* box-sizing: border-box; */
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

/* .auth-input {
  width: 100%;
}

.auth-input :deep(.v-field__outline) {
  border-color: #e0e4ec;
}

.auth-input :deep(.v-field--focused .v-field__outline) {
  border-color: #1a2233;
} */

/* .auth-input :deep(.v-field__input) {
  width: 100%;
} */

.remember-me {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  width: 100%;
}

/* .remember-switch :deep(.v-label) {
  font-size: 14px;
  color: #707a8a;
  opacity: 1;
} */

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
  /* color: #1a2233; */
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 4px;
  text-decoration: none;
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
  
  .auth-illustration {
    padding: 20px 0;
  }
  
  .auth-illustration img {
    height: 140px;
  }
}

.w-100 {
  width: 100%;
}
</style> 