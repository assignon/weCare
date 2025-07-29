<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Register</h1>
        <p class="text-gray-600 mb-6">Please register to login.</p>

        <form @submit.prevent="onRegister" class="space-y-4">
          <!-- Error Message -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <div class="flex items-center">
              <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
              <span class="text-red-800 text-sm">{{ authStore.error }}</span>
            </div>
            <button @click="authStore.clearError()" type="button" class="text-red-500 hover:text-red-700">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Email Field -->
          <div>
            <label class="form-label">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="formData.email"
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

          <!-- Mobile Field -->
          <div>
            <label class="form-label">Mobile Number</label>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="formData.mobile"
                type="tel"
                autocomplete="tel"
                :class="[
                  'input-field pl-10',
                  mobileError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Enter your mobile number"
                @blur="validateMobile"
              />
            </div>
            <p v-if="mobileError" class="text-red-500 text-xs mt-1">{{ mobileError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label class="form-label">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :class="[
                  'input-field pl-10 pr-10',
                  passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Enter your password"
                @blur="validatePassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label class="form-label">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="formData.password_confirm"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :class="[
                  'input-field pl-10 pr-10',
                  confirmPasswordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Confirm your password"
                @blur="validateConfirmPassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="confirmPasswordError" class="text-red-500 text-xs mt-1">{{ confirmPasswordError }}</p>
          </div>

          <!-- Country Field -->
          <div>
            <label class="form-label">Country</label>
            <div class="relative">
              <Globe class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                v-model="formData.country"
                :class="[
                  'input-field pl-10',
                  countryError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                ]"
                :disabled="loadingCountries"
                @blur="validateCountry"
              >
                <option value="">Select a country</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name }}
                </option>
              </select>
              <div v-if="loadingCountries" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
            <p v-if="countryError" class="text-red-500 text-xs mt-1">{{ countryError }}</p>
          </div>

          <!-- Language Field -->
          <div>
            <label class="form-label">Preferred Language</label>
            <div class="relative">
              <Languages class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                v-model="formData.default_language"
                class="input-field pl-10"
                :disabled="loadingLanguages"
              >
                <option value="">Select a language</option>
                <option v-for="language in languages" :key="language.id" :value="language.id">
                  {{ language.name }}
                </option>
              </select>
              <div v-if="loadingLanguages" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isFormValid || authStore.loading"
            class="btn-primary w-full py-3 text-base flex items-center justify-center"
          >
            <div v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sign Up
          </button>

          <!-- Sign In Link -->
          <div class="text-center text-gray-600 text-sm">
            Already have account? 
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { AlertCircle, X, Mail, Phone, Lock, Eye, EyeOff, Globe, Languages } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)
const languages = ref([])
const loadingLanguages = ref(false)
const countries = ref([])
const loadingCountries = ref(false)

// Form validation errors
const emailError = ref('')
const mobileError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const countryError = ref('')

const formData = ref({
  email: '',
  mobile: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  country: null,
  default_language: null
})

// Validation functions
const validateEmail = () => {
  if (!formData.value.email) {
    emailError.value = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    emailError.value = 'Email must be valid'
  } else {
    emailError.value = ''
  }
}

const validateMobile = () => {
  if (!formData.value.mobile) {
    mobileError.value = 'Mobile number is required'
  } else {
    mobileError.value = ''
  }
}

const validatePassword = () => {
  const password = formData.value.password
  if (!password) {
    passwordError.value = 'Password is required'
  } else if (password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(password)) {
    passwordError.value = 'Password must contain at least one uppercase letter'
  } else if (!/[a-z]/.test(password)) {
    passwordError.value = 'Password must contain at least one lowercase letter'
  } else if (!/[0-9]/.test(password)) {
    passwordError.value = 'Password must contain at least one number'
  } else {
    passwordError.value = ''
  }
  // Re-validate confirm password if it has a value
  if (formData.value.password_confirm) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!formData.value.password_confirm) {
    confirmPasswordError.value = 'Confirm password is required'
  } else if (formData.value.password_confirm !== formData.value.password) {
    confirmPasswordError.value = 'Passwords must match'
  } else {
    confirmPasswordError.value = ''
  }
}

const validateCountry = () => {
  if (!formData.value.country) {
    countryError.value = 'Country is required'
  } else {
    countryError.value = ''
  }
}

const isFormValid = computed(() => {
  return formData.value.email && 
         formData.value.mobile && 
         formData.value.password && 
         formData.value.password_confirm && 
         formData.value.country &&
         !emailError.value && 
         !mobileError.value && 
         !passwordError.value && 
         !confirmPasswordError.value && 
         !countryError.value &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
})

// Fetch available countries
const fetchCountries = async () => {
  loadingCountries.value = true
  try {
    const response = await apiService.getCountries()
    countries.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Failed to fetch countries:', error)
  } finally {
    loadingCountries.value = false
  }
}

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
  // Validate all fields before submitting
  validateEmail()
  validateMobile()
  validatePassword()
  validateConfirmPassword()
  validateCountry()
  
  if (!isFormValid.value) return

  // Prepare registration data with phone_number field name
  const registrationData = {
    ...formData.value,
    phone_number: formData.value.mobile
  }
  delete registrationData.mobile

  const success = await authStore.register(registrationData)

  if (success) {
    // If registration includes login (tokens), redirect to shopper goals
    if (authStore.isAuthenticated) {
      // Always redirect to shopper goals after successful registration
      router.push({ name: 'ShopperGoals' })
    }
    // Otherwise, login page with registered=true will be handled by the store
  }
}

onMounted(async () => {
  // If already authenticated, redirect to shopper goals
  if (authStore.isAuthenticated) {
    router.replace({ name: 'ShopperGoals' })
  }

  // Fetch countries and languages for selection
  await Promise.all([fetchCountries(), fetchLanguages()])
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style>