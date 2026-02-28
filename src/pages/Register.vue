<template>
  <div class="page-container flex items-center justify-center p-4">
    <div class="w-11/12">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-card">
          <User class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-navy mb-1">
          {{ $t('auth.join_afriqexpress') }}
        </h1>
        <p class="text-grey-500 text-xs">{{ $t('auth.create_account_subtitle') }}</p>
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
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
                </div>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="input pl-10 pr-3 h-12 text-sm"
                  :placeholder="$t('auth.enter_email')"
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
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12 text-sm"
                  :placeholder="$t('auth.create_password')"
                  autocomplete="new-password"
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
              <p class="text-xs text-grey-400 mt-1">{{ $t('auth.password_requirements') }}</p>
            </div>

            <!-- Confirm Password field -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
                </div>
                <input
                  id="password_confirm"
                  v-model="formData.password_confirm"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="input pl-10 pr-10 h-12 text-sm"
                  :placeholder="$t('auth.confirm_password_placeholder')"
                  autocomplete="new-password"
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

            <!-- Next button -->
            <button
              type="button"
              @click="nextStep"
              :disabled="!isStep1Valid"
              class="btn-cta disabled:bg-grey-400 disabled:cursor-not-allowed"
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
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
                </div>
                <input
                  id="mobile"
                  v-model="formData.mobile"
                  type="tel"
                  required
                  class="input pl-10 pr-3 h-12 text-sm"
                  :placeholder="$t('auth.enter_mobile')"
                  autocomplete="tel"
                />
              </div>
            </div>

            <!-- Country field -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
                </div>
                <select
                  id="country"
                  v-model="formData.country"
                  required
                  :disabled="loadingCountries"
                  class="select pl-10 pr-8 h-12 text-sm"
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
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-navy"></div>
                </div>
              </div>
            </div>

            <!-- Language field -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageCircle class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
                </div>
                <select
                  id="language"
                  v-model="formData.default_language"
                  :disabled="loadingLanguages"
                  class="select pl-10 pr-8 h-12 text-sm"
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
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-navy"></div>
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="flex space-x-3">
              <button
                type="button"
                @click="prevStep"
                class="btn btn-outlined flex-1"
              >
                <span class="flex items-center justify-center">
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  {{ $t('auth.back') }}
                </span>
              </button>
              <button
                type="submit"
                :disabled="authStore.loading || !isFormValid"
                class="flex-1 btn-cta disabled:bg-grey-400 disabled:cursor-not-allowed"
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
              <div class="w-full border-t border-grey-200"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-2 bg-white text-grey-500">{{ $t('auth.already_have_account') }}</span>
            </div>
          </div>

          <!-- Login link -->
          <div class="text-center">
            <router-link :to="{ name: 'Login' }" class="btn btn-outlined inline-flex items-center justify-center w-full">
              <Lock class="w-4 h-4 mr-2" />
              {{ $t('auth.sign_in') }}
            </router-link>
          </div>
        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-xs text-grey-500">
            {{ $t('auth.agree_terms_register') }} 
            <a href="https://afriqxpress.com/terms" target="_blank" rel="noopener noreferrer" class="text-navy font-medium">{{ $t('auth.terms_of_service') }}</a> 
            {{ $t('auth.and') }} 
            <a href="https://afriqxpress.com/privacy" target="_blank" rel="noopener noreferrer" class="text-navy font-medium">{{ $t('auth.privacy_policy') }}</a>
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
    // If registration includes login (tokens), redirect to home
    if (authStore.isAuthenticated) {
      // Always redirect to home after successful registration
      router.push({ name: 'Home' })
    }
    // Otherwise, login page with registered=true will be handled by the store
  }
}

onMounted(async () => {
  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    router.replace({ name: 'Home' })
  }

  // Fetch countries and languages for selection
  await Promise.all([fetchCountries(), fetchLanguages()])
})
</script>

<style scoped>
</style>
