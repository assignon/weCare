<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-11/12">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg" style="background: linear-gradient(to right, #3b82f6, #9333ea);">
          <User class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text mb-1">
          {{ $t('auth.join_afriqexpress') }}
        </h1>
        <p class="text-gray-600 text-xs">{{ $t('auth.create_account_subtitle') }}</p>
      </div>

        <form @submit.prevent="onRegister" class="space-y-4">


                    <!-- Step 1 -->
          <div v-if="currentStep === 1" class="space-y-4">
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
                  v-model="formData.email"
                  type="email"
                  required
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="$t('auth.enter_email')"
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
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="$t('auth.create_password')"
                  autocomplete="new-password"
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
              <p class="text-xs text-gray-500 mt-1">{{ $t('auth.password_requirements') }}</p>
            </div>

            <!-- Confirm Password field -->
            <div class="space-y-1">
              <!-- <label for="password_confirm" class="block text-sm font-semibold text-gray-700">Confirm Password</label> -->
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="password_confirm"
                  v-model="formData.password_confirm"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="$t('auth.confirm_password_placeholder')"
                  autocomplete="new-password"
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

            <!-- Next button -->
            <button
              type="button"
              @click="nextStep"
              :disabled="!isStep1Valid"
              class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              <span class="flex items-center justify-center">
                <span class="mr-2">{{ $t('auth.next') }}</span>
                <ArrowRight class="w-4 h-4" />
              </span>
            </button>
          </div>

          <!-- Step 2 -->
          <div v-if="currentStep === 2" class="space-y-4">
            <!-- Mobile field -->
            <div class="space-y-1">
              <!-- <label for="mobile" class="block text-sm font-semibold text-gray-700">Mobile Number</label> -->
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="mobile"
                  v-model="formData.mobile"
                  type="tel"
                  required
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="$t('auth.enter_mobile')"
                  autocomplete="tel"
                />
              </div>
            </div>

            <!-- Country field -->
            <div class="space-y-1">
              <!-- <label for="country" class="block text-sm font-semibold text-gray-700">Country</label> -->
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <select
                  id="country"
                  v-model="formData.country"
                  required
                  :disabled="loadingCountries"
                  class="select pl-10 pr-8 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{{ $t('auth.select_country') }}</option>
                  <option
                    v-for="country in countries"
                    :key="country.id"
                    :value="country.id"
                  >
                    {{ country.name }}
                  </option>
                </select>
                <div v-if="loadingCountries" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>

            <!-- Language field -->
            <div class="space-y-1">
              <!-- <label for="language" class="block text-sm font-semibold text-gray-700">Preferred Language</label> -->
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageCircle class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <select
                  id="language"
                  v-model="formData.default_language"
                  :disabled="loadingLanguages"
                  class="select pl-10 pr-8 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{{ $t('auth.select_language') }}</option>
                  <option
                    v-for="language in languages"
                    :key="language.id"
                    :value="language.id"
                  >
                    {{ language.name }}
                  </option>
                </select>
                <div v-if="loadingLanguages" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="flex space-x-3">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <span class="flex items-center justify-center">
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  {{ $t('auth.back') }}
                </span>
              </button>
              <button
                type="submit"
                :disabled="authStore.loading || !isFormValid"
                class="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="authStore.loading" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ $t('auth.creating_account') }}
                </span>
                <span v-else class="flex items-center justify-center">
                  <User class="w-4 h-4 mr-2" />
                  {{ $t('auth.create_account') }}
                </span>
              </button>
            </div>
          </div>

          <!-- Divider -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-2 bg-gray-100 text-gray-500">{{ $t('auth.already_have_account') }}</span>
            </div>
          </div>

          <!-- Login link -->
          <div class="text-center">
            <router-link :to="{ name: 'Login' }" class="inline-flex items-center justify-center w-full h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-[1.02]">
              <Lock class="w-4 h-4 mr-2" />
              {{ $t('auth.sign_in') }}
            </router-link>
          </div>
        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-xs text-gray-500">
            {{ $t('auth.agree_terms_register') }} 
            <a href="https://afriqxpress.com/terms" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 font-medium">{{ $t('auth.terms_of_service') }}</a> 
            {{ $t('auth.and') }} 
            <a href="https://afriqxpress.com/privacy" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 font-medium">{{ $t('auth.privacy_policy') }}</a>
          </p>
        </div>
      </form>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { 
  Mail, Phone, Lock, Eye, EyeOff, Globe, MessageCircle, XCircle, User, ArrowRight, ArrowLeft
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)
const languages = ref([])
const loadingLanguages = ref(false)
const countries = ref([])
const loadingCountries = ref(false)
const currentStep = ref(1)

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

// Step 1 validation
const isStep1Valid = computed(() => {
  return formData.value.email && 
         formData.value.password && 
         formData.value.password_confirm && 
         formData.value.password === formData.value.password_confirm &&
         formData.value.password.length >= 8 &&
         /[A-Z]/.test(formData.value.password) &&
         /[a-z]/.test(formData.value.password) &&
         /[0-9]/.test(formData.value.password)
})

// Form validation
const isFormValid = computed(() => {
  return isStep1Valid.value && 
         formData.value.mobile && 
         formData.value.country
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

// Step navigation
const nextStep = () => {
  if (isStep1Valid.value) {
    currentStep.value = 2
  }
}

const prevStep = () => {
  currentStep.value = 1
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