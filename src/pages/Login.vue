<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Login</h1>
        <p class="text-gray-600 mb-6">Please sign in to continue.</p>

        <form @submit.prevent="onLogin" class="space-y-4">
          <!-- Success Messages -->
          <div v-if="route.query.registered" class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle class="w-5 h-5 text-green-500 mr-2" />
            <span class="text-green-800 text-sm">Registration successful! Please log in.</span>
          </div>

          <div v-if="route.query.message" class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle class="w-5 h-5 text-green-500 mr-2" />
            <span class="text-green-800 text-sm">{{ route.query.message }}</span>
          </div>

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

          <!-- Password Field -->
          <div>
            <label class="form-label">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
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

          <!-- Forgot Password Link -->
          <div class="text-right">
            <router-link 
              :to="{ name: 'ForgotPassword' }" 
              class="text-primary text-sm font-medium hover:underline"
            >
              Forgot Password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isFormValid || authStore.loading"
            class="btn-primary w-full py-3 text-base flex items-center justify-center"
          >
            <div v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sign In
          </button>

          <!-- Sign Up Link -->
          <div class="text-center text-gray-600 text-sm">
            Don't have account? 
            <router-link :to="{ name: 'Register' }" class="text-primary font-medium hover:underline ml-1">
              Sign Up
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
import { CheckCircle, AlertCircle, X, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Email must be valid'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else {
    passwordError.value = ''
  }
}

const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         !emailError.value && 
         !passwordError.value &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const onLogin = async () => {
  // Validate all fields before submitting
  validateEmail()
  validatePassword()
  
  if (!isFormValid.value) return

  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  }
}

onMounted(() => {
  // If already authenticated, redirect to home or original destination
  if (authStore.isAuthenticated) {
    const redirectPath = route.query.redirect || '/'
    router.replace(redirectPath)
  }
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style>