<template>
  <div class="page-container flex items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-card">
          <Lock class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-navy mb-1 mt-5">
          {{ $t('auth.sign_in') }}
        </h1>
        <p class="text-grey-500 text-xs">{{ $t('auth.sign_in_subtitle') }}</p>
      </div>

      <form @submit.prevent="onLogin" class="space-y-4">
        <!-- Success alerts -->
        <div v-if="route.query.registered" class="alert alert-success">
          <CheckCircle class="w-4 h-4" />
          <span>{{ $t('auth.registration_successful') }}</span>
        </div>

        <div v-if="route.query.message" class="alert alert-success">
          <CheckCircle class="w-4 h-4" />
          <span>{{ route.query.message }}</span>
        </div>

        <!-- Error alert (translated when possible) -->
        <div v-if="authStore.error" class="alert alert-error">
          <XCircle class="w-4 h-4" />
          <span>{{ loginErrorKey ? $t(loginErrorKey) : authStore.error }}</span>
        </div>

        <!-- Email field -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input pl-10 pr-3 h-12 text-sm"
              :placeholder="$t('auth.email_placeholder')"
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password field -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input pl-10 pr-10 h-12 text-sm"
              :placeholder="$t('auth.password_placeholder')"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-grey-500 transition-colors"
            >
              <Eye v-if="!showPassword" class="h-4 w-4 text-grey-400" />
              <EyeOff v-else class="h-4 w-4 text-grey-400" />
            </button>
          </div>
        </div>

        <!-- Forgot password link -->
        <div class="text-right">
          <router-link :to="{ name: 'ForgotPassword' }" class="text-xs text-navy font-medium transition-colors">
            {{ $t('auth.forgot_password') }}
          </router-link>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="authStore.loading || !email || !password"
          class="btn-cta disabled:bg-grey-400 disabled:cursor-not-allowed"
        >
          <span v-if="authStore.loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ $t('auth.signing_in') }}
          </span>
          <span v-else class="flex items-center justify-center">
            <Lock class="w-4 h-4 mr-2" />
            {{ $t('auth.sign_in') }}
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-grey-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-grey-500">{{ $t('auth.new_to_platform') }}</span>
          </div>
        </div>

        <!-- Register link -->
        <div class="text-center">
          <router-link :to="{ name: 'Register' }" class="btn btn-outlined inline-flex items-center justify-center w-full">
            <User class="w-4 h-4 mr-2" />
            {{ $t('auth.create_account') }}
          </router-link>
        </div>
      </form>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-xs text-grey-500">
          {{ $t('auth.agree_terms') }} 
          <a href="https://afriqxpress.com/terms" target="_blank" rel="noopener noreferrer" class="text-navy font-medium">{{ $t('auth.terms_of_service') }}</a> 
          {{ $t('auth.and') }} 
          <a href="https://afriqxpress.com/privacy" target="_blank" rel="noopener noreferrer" class="text-navy font-medium">{{ $t('auth.privacy_policy') }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, User } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Map store error to i18n key so template can translate with current locale
const loginErrorKey = computed(() => {
  const err = authStore.error
  if (!err || typeof err !== 'string') return null
  const lower = err.toLowerCase()
  if (err === 'Invalid email or password. Please try again.') return 'auth.error_invalid_credentials'
  if (lower.includes('unable to log in') || (lower.includes('credential') && (lower.includes('invalid') || lower.includes('incorrect')))) return 'auth.error_invalid_credentials'
  if (err === 'Invalid login request') return 'auth.error_invalid_request'
  if (err === 'Connection error. Please check your internet connection.' || lower.startsWith('connection error')) return 'auth.error_network'
  if (err === 'An error occurred during login') return 'auth.error_generic'
  return null
})

const onLogin = async () => {
  if (!email.value || !password.value) return

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
</style>
