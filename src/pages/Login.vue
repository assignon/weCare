<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg" style="background: linear-gradient(to right, #3b82f6, #9333ea);">
          <Lock class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text mb-1 mt-5">
          {{ $t('auth.sign_in') }}
        </h1>
        <p class="text-gray-600 text-base text-xs">{{ $t('auth.sign_in_subtitle') }}</p>
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

        <!-- Error alert -->
        <div v-if="authStore.error" class="alert alert-error">
          <XCircle class="w-4 h-4" />
          <span>{{ authStore.error }}</span>
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
              :placeholder="$t('auth.email_placeholder')"
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password field -->
        <div class="space-y-1">
          <!-- <label for="password" class="block text-sm font-semibold text-gray-700">Password</label> -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input pl-10 pr-10 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="$t('auth.password_placeholder')"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            >
              <Eye v-if="!showPassword" class="h-4 w-4 text-gray-400" />
              <EyeOff v-else class="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Forgot password link -->
        <div class="text-right">
          <router-link :to="{ name: 'ForgotPassword' }" class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
            {{ $t('auth.forgot_password') }}
          </router-link>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="authStore.loading || !email || !password"
          class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
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
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-500">{{ $t('auth.new_to_platform') }}</span>
          </div>
        </div>

        <!-- Register link -->
        <div class="text-center">
          <router-link :to="{ name: 'Register' }" class="inline-flex items-center justify-center w-full h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
            <User class="w-4 h-4 mr-2" />
            {{ $t('auth.create_account') }}
          </router-link>
        </div>
      </form>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-xs text-gray-500">
          {{ $t('auth.agree_terms') }} 
          <a href="https://afriqxpress.com/terms" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 font-medium">{{ $t('auth.terms_of_service') }}</a> 
          {{ $t('auth.and') }} 
          <a href="https://afriqxpress.com/privacy" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 font-medium">{{ $t('auth.privacy_policy') }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, User } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

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
} */

/* .auth-input :deep(.v-field--focused .v-field__outline) {
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

.forgot-password-link {
  width: 100%;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>