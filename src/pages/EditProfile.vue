<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        :custom-title="$t('profile.edit_profile_page.title')"
      />

      <!-- Loading state for initial data -->
      <div v-if="initialLoading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ $t('profile.edit_profile_page.loading_profile') }}</h3>
        <p class="text-slate-600">{{ $t('profile.edit_profile_page.loading_subtitle') }}</p>
      </div>

      <!-- Form content -->
      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <!-- Profile Picture Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
          <div class="text-center">
            <div class="relative inline-block">
              <div class="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-lg mx-auto">
                <img 
                  v-if="formData.profile_picture" 
                  :src="formData.profile_picture" 
                  :alt="formData.first_name || 'Profile'"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-3xl font-bold text-slate-700">{{ userInitials }}</span>
              </div>
              <button 
                type="button"
                @click="openFileInput"
                class="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                style="background: linear-gradient(to right, #2563eb, #4f46e5);"
                onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
                onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
              >
                <Camera class="w-4 h-4 text-white" />
              </button>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                class="hidden" 
                @change="handleFileUpload" 
              />
            </div>
            <p class="text-sm text-slate-600 mt-3">{{ $t('profile.edit_profile_page.tap_to_change') }}</p>
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <User class="w-4 h-4 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.edit_profile_page.personal_information') }}</h3>
          </div>

          <div class="space-y-4">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.first_name_label') }}</label>
              <input 
                v-model="formData.first_name"
                type="text"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                :placeholder="$t('profile.edit_profile_page.first_name_placeholder')"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.last_name_label') }}</label>
              <input 
                v-model="formData.last_name"
                type="text"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                :placeholder="$t('profile.edit_profile_page.last_name_placeholder')"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.edit_profile_page.email_label') }} <span class="text-red-500">{{ $t('profile.edit_profile_page.email_required') }}</span>
              </label>
              <input 
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                :placeholder="$t('profile.edit_profile_page.email_placeholder')"
              />
              <p class="text-xs text-slate-500 mt-1">{{ $t('profile.edit_profile_page.email_verification_note') }}</p>
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.edit_profile_page.phone_label') }} <span class="text-red-500">{{ $t('profile.edit_profile_page.phone_required') }}</span>
              </label>
              <input 
                v-model="formData.phone_number"
                type="tel"
                required
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                :placeholder="$t('profile.edit_profile_page.phone_placeholder')"
              />
            </div>

            <!-- Language Preference -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.preferred_language') }}</label>
              <select 
                v-model="formData.default_language"
                :disabled="loadingLanguages"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="">{{ $t('profile.edit_profile_page.select_language_placeholder') }}</option>
                <option 
                  v-for="lang in languages" 
                  :key="lang.id" 
                  :value="lang.id"
                >
                  {{ lang.name }}
                </option>
              </select>
              <div v-if="loadingLanguages" class="flex items-center space-x-2 mt-2">
                <Loader2 class="w-4 h-4 text-blue-600 animate-spin" />
                <span class="text-xs text-slate-500">{{ $t('profile.edit_profile_page.loading_languages') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <Lock class="w-4 h-4 text-green-600" />
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.edit_profile_page.change_password') }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-4">{{ $t('profile.edit_profile_page.password_change_note') }}</p>

          <div class="space-y-4">
            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.new_password') }}</label>
              <div class="relative">
                <input 
                  v-model="formData.new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="w-full px-4 py-3 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                  :placeholder="$t('profile.edit_profile_page.new_password_placeholder')"
                  autocomplete="new-password"
                />
                <button 
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="showNewPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ $t('profile.edit_profile_page.password_requirements') }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.confirm_new_password') }}</label>
              <div class="relative">
                <input 
                  v-model="formData.confirm_password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="w-full px-4 py-3 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                  :placeholder="$t('profile.edit_profile_page.confirm_password_placeholder')"
                  autocomplete="new-password"
                />
                <button 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Password Confirmation -->
        <div v-if="hasChangesToSave" class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <Shield class="w-4 h-4 text-amber-600" />
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.edit_profile_page.confirm_changes') }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-4">{{ $t('profile.edit_profile_page.confirm_changes_note') }}</p>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ $t('profile.edit_profile_page.current_password') }}</label>
            <div class="relative">
              <input 
                v-model="formData.current_password"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                :placeholder="$t('profile.edit_profile_page.current_password_placeholder')"
                autocomplete="current-password"
              />
              <button 
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye v-if="showCurrentPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="!hasChangesToSave || loading"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
          onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <Save v-else class="w-5 h-5" />
          <span>{{ saveButtonText }}</span>
        </button>
      </form>

      <!-- Success/Error Toast -->
      <div 
        v-if="showSnackbar"
        :class="[
          'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-lg max-w-sm w-full',
          snackbarColor === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        ]"
      >
        <div class="flex items-center space-x-3">
          <CheckCircle v-if="snackbarColor === 'success'" class="w-5 h-5 flex-shrink-0" />
          <AlertCircle v-else class="w-5 h-5 flex-shrink-0" />
          <p class="text-sm font-medium">{{ snackbarText }}</p>
          <button 
            @click="showSnackbar = false"
            class="ml-auto text-white/80 hover:text-white"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Email Verification Dialog -->
      <EmailVerificationDialog 
        v-model="showEmailVerificationDialog" 
        :new-email="pendingEmailChange"
        :expires-in-minutes="2" 
        @verified="onEmailVerified" 
        @cancelled="onEmailVerificationCancelled"
        @resend="onEmailVerificationResend" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import EmailVerificationDialog from '@/components/EmailVerificationDialog.vue'
import AppHeader from '@/components/AppHeader.vue'
import { 
  User, Camera, Lock, Shield, Save, Loader2, CheckCircle, AlertCircle, X,
  Eye, EyeOff
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()
const user = auth.user

// Form refs and state
const fileInput = ref(null)
const loading = ref(false)
const initialLoading = ref(true)
const profilePictureFile = ref(null)
const languages = ref([])
const loadingLanguages = ref(false)

// Password visibility toggles
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showCurrentPassword = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Email verification state
const showEmailVerificationDialog = ref(false)
const pendingEmailChange = ref(null)

// Form data
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  profile_picture: null,
  new_password: '',
  confirm_password: '',
  current_password: '',
  default_language: null
})

// Initialize form data from user
onMounted(async () => {
  await loadUserData()
  await fetchLanguages()
  await checkPendingEmailVerification()
})

// Fetch available languages
const fetchLanguages = async () => {
  loadingLanguages.value = true
  try {
    const response = await apiService.getLanguages()
    languages.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Failed to fetch languages:', error)
  } finally {
    loadingLanguages.value = false
  }
}

// Load fresh user data
const loadUserData = async () => {
  initialLoading.value = true
  try {
    // Fetch the latest user data to ensure we have current information
    await auth.fetchUserData()

    // Prefill form with current user data
    if (auth.user) {
      const userData = auth.user
      formData.value.first_name = userData.first_name || ''
      formData.value.last_name = userData.last_name || ''
      formData.value.email = userData.email || ''
      formData.value.phone_number = userData.phone_number || ''
      formData.value.profile_picture = userData.profile_picture || null
      formData.value.default_language = userData.default_language?.id || null

      // Always keep password fields empty for security
      formData.value.new_password = ''
      formData.value.confirm_password = ''
      formData.value.current_password = ''
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
    showError(t('profile.edit_profile_page.failed_to_load'))
  } finally {
    initialLoading.value = false
  }
}

// Check if form has changes from original user data
const hasFormChanges = computed(() => {
  if (!auth.user) return false

  const userData = auth.user
  return (
    formData.value.first_name !== (userData.first_name || '') ||
    formData.value.last_name !== (userData.last_name || '') ||
    formData.value.email !== (userData.email || '') ||
    formData.value.phone_number !== (userData.phone_number || '') ||
    formData.value.default_language !== (userData.default_language?.id || null) ||
    !!profilePictureFile.value
  )
})

// Computed properties
const userInitials = computed(() => {
  const firstName = formData.value.first_name || ''
  const lastName = formData.value.last_name || ''

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  return initials || '?'
})

const saveButtonText = computed(() => {
  const hasProfileChanges = hasFormChanges.value
  const hasPasswordChange = formData.value.new_password
  if (!hasProfileChanges && !hasPasswordChange) {
    return t('profile.edit_profile_page.no_changes')
  } else if (hasProfileChanges && hasPasswordChange) {
    return t('profile.edit_profile_page.save_profile_password')
  } else if (hasPasswordChange) {
    return t('profile.edit_profile_page.change_password_button')
  } else {
    return t('profile.edit_profile_page.save_profile_changes')
  }
})

const hasChangesToSave = computed(() => {
  return hasFormChanges.value || !!formData.value.new_password
})

// File input handlers
const openFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check file type and size
  if (!file.type.includes('image/')) {
    showError(t('profile.edit_profile_page.select_image_file'))
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showError(t('profile.edit_profile_page.image_size_limit'))
    return
  }

  // Store the file for upload
  profilePictureFile.value = file

  // Create a preview URL
  formData.value.profile_picture = URL.createObjectURL(file)
}

// Show email verification dialog
const showEmailVerification = (newEmail) => {
  pendingEmailChange.value = newEmail
  showEmailVerificationDialog.value = true
}

// Handle email verification success
const onEmailVerified = async () => {
  showSnackbar.value = false
  snackbarColor.value = 'success'
  snackbarText.value = t('profile.edit_profile_page.email_updated')
  showSnackbar.value = true

  // Refresh user data
  await auth.fetchUserData()

  // Clear pending email change
  pendingEmailChange.value = null

  // Navigate back after a delay
  setTimeout(() => {
    router.push({ name: 'Profile' })
  }, 1500)
}

// Handle email verification cancellation
const onEmailVerificationCancelled = () => {
  pendingEmailChange.value = null
  showError(t('profile.edit_profile_page.email_change_cancelled'))
}

// Handle email verification resend
const onEmailVerificationResend = () => {
  showSnackbar.value = false
  snackbarColor.value = 'info'
  snackbarText.value = t('profile.edit_profile_page.verification_code_resent')
  showSnackbar.value = true
}

// Check for pending email verification on component mount
const checkPendingEmailVerification = async () => {
  try {
    const response = await apiService.getEmailVerificationStatus()
    if (response.data.has_pending_verification) {
      showEmailVerification(response.data.new_email)
    }
  } catch (error) {
    console.error('Failed to check email verification status:', error)
  }
}

// Form submission
const submitForm = async () => {
  const hasProfileChanges = hasFormChanges.value
  const hasPasswordChange = formData.value.new_password

  // Check if there are any changes to save
  if (!hasProfileChanges && !hasPasswordChange) {
    showError(t('profile.edit_profile_page.no_changes_detected'))
    return
  }

  // Validate password match if changing password
  if (hasPasswordChange && formData.value.new_password !== formData.value.confirm_password) {
    showError(t('profile.edit_profile_page.passwords_no_match'))
    return
  }

  // Validate password length if changing password
  if (hasPasswordChange && formData.value.new_password.length < 8) {
    showError(t('profile.edit_profile_page.password_too_short'))
    return
  }

  loading.value = true

  try {
    // Update profile only if there are profile changes
    if (hasProfileChanges) {
      const profilePayload = {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        email: formData.value.email,
        phone_number: formData.value.phone_number,
        default_language: formData.value.default_language
      }

      // Add profile picture if a new file was selected
      if (profilePictureFile.value) {
        profilePayload.profile_picture = profilePictureFile.value
      }

      // Update profile
      const response = await apiService.updateProfile(profilePayload, !!profilePictureFile.value)

      // Check if email verification is required
      if (response.data.email_verification) {
        showEmailVerification(response.data.email_verification.new_email)
        loading.value = false
        return
      }
    }

    // Handle password change if new password is provided
    if (hasPasswordChange) {
      const passwordPayload = {
        current_password: formData.value.current_password,
        new_password: formData.value.new_password,
        confirm_new_password: formData.value.confirm_password
      }

      await apiService.changePassword(passwordPayload)
    }

    // Show success message
    snackbarColor.value = 'success'
    let successMessage = t('profile.edit_profile_page.profile_updated')
    if (hasProfileChanges && hasPasswordChange) {
      successMessage = t('profile.edit_profile_page.profile_password_updated')
    } else if (hasPasswordChange) {
      successMessage = t('profile.edit_profile_page.password_changed')
    }
    snackbarText.value = successMessage
    showSnackbar.value = true

    // Refresh user data in auth store
    await auth.fetchUserData()

    // Clear password fields after successful update
    formData.value.new_password = ''
    formData.value.confirm_password = ''
    formData.value.current_password = ''
    profilePictureFile.value = null

    // Navigate back to profile page after a short delay
    setTimeout(() => {
      router.push({ name: 'Profile' })
    }, 1500)
  } catch (error) {
    console.error('Profile update error:', error)
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      Object.values(error.response?.data || {}).flat().join(', ') ||
      t('profile.edit_profile_page.failed_to_update')
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

// Show error in snackbar
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}
</script>

<style scoped>
/* Additional styles if needed */
</style>