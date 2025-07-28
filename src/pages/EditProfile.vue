<template>
  <div class="edit-profile-page">
    <v-container>
      <!-- Header with back button and title -->
      <div class="d-flex align-center justify-space-between mb-5">
        <v-btn icon variant="text" @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <h1 class="text-h5 font-weight-bold text-center">Edit Profile</h1>

        <div style="width: 40px"></div> <!-- Spacer to maintain layout -->
      </div>

      <!-- Profile form -->
      <v-form ref="form" v-model="formValid" @submit.prevent="submitForm">
        <!-- Loading state for initial data -->
        <div v-if="initialLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <p class="text-subtitle-1 mt-4">Loading profile information...</p>
        </div>

        <!-- Form content -->
        <div v-else>
          <!-- Profile Picture -->
          <div class="text-center mb-6">
            <div class="profile-avatar-wrapper d-inline-block position-relative">
              <v-avatar size="100" color="grey-lighten-3">
                <v-img v-if="formData.profile_picture" :src="formData.profile_picture" cover></v-img>
                <span v-else class="text-h4">{{ userInitials }}</span>
              </v-avatar>
              <div class="profile-edit-badge" @click="openFileInput">
                <v-icon size="small" color="white">mdi-camera</v-icon>
              </div>
              <input type="file" ref="fileInput" accept="image/*" class="d-none" @change="handleFileUpload" />
            </div>
            <p class="text-subtitle-1 mt-2">Change Profile Picture</p>
          </div>

          <!-- Form Fields -->
          <v-card class="mb-4 pa-4 rounded-lg" elevation="1">
            <v-text-field v-model="formData.first_name" label="First Name" variant="outlined" density="comfortable"
              class="mb-3"></v-text-field>

            <v-text-field v-model="formData.last_name" label="Last Name" variant="outlined" density="comfortable"
              class="mb-3"></v-text-field>

            <v-text-field v-model="formData.email" label="Email*" variant="outlined" density="comfortable" class="mb-3"
              :rules="[required, emailRule]" type="email" persistent-hint></v-text-field>

            <v-text-field v-model="formData.phone_number" label="Phone Number*" variant="outlined" density="comfortable"
              class="mb-3" :rules="[required, phoneRule]"></v-text-field>

            <!-- <v-textarea v-model="formData.address" label="Address (Optional)" variant="outlined" density="comfortable"
              rows="3" class="mb-3" hint="Your primary address" persistent-hint></v-textarea> -->

            <v-select v-model="formData.default_language" :items="languages" item-title="name" item-value="id"
              label="Preferred Language" variant="outlined" density="comfortable" class="mb-3"
              :loading="loadingLanguages" :disabled="loadingLanguages" clearable></v-select>
          </v-card>

          <!-- Password section -->
          <v-card class="mb-6 pa-4 rounded-lg" elevation="1">
            <p class="text-subtitle-1 font-weight-bold mb-3">Change Password (Optional)</p>
            <p class="text-caption mb-3 text-grey-darken-1">Leave these fields empty if you don't want to change your
              password</p>

            <v-text-field v-model="formData.new_password" label="New Password" variant="outlined" density="comfortable"
              class="mb-3" type="password" :rules="formData.new_password ? [passwordRule] : []"
              autocomplete="new-password"></v-text-field>

            <v-text-field v-model="formData.confirm_password" label="Confirm New Password" variant="outlined"
              density="comfortable" class="mb-3" type="password"
              :rules="formData.new_password ? [passwordMatchRule] : []" autocomplete="new-password"></v-text-field>
          </v-card>

          <!-- Current password confirmation -->
          <v-card class="mb-6 pa-4 rounded-lg" elevation="1">
            <p class="text-subtitle-1 font-weight-bold mb-3">Confirm Changes</p>
            <p class="text-caption mb-3">Please enter your current password to save changes</p>

            <v-text-field v-model="formData.current_password" label="Current Password" variant="outlined"
              density="comfortable" class="mb-3" type="password" :rules="[currentPasswordRequired]"
              autocomplete="current-password"></v-text-field>
          </v-card>

          <!-- Submit button -->
          <v-btn color="primary" block size="large" type="submit" :loading="loading"
            :disabled="!hasChangesToSave" class="text-none rounded-lg">
            {{ saveButtonText }}
          </v-btn>
        </div>
      </v-form>

      <!-- Snackbar for notifications -->
      <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000" location="top">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showSnackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <!-- Email Verification Dialog -->
      <EmailVerificationDialog v-model="showEmailVerificationDialog" :new-email="pendingEmailChange"
        :expires-in-minutes="2" @verified="onEmailVerified" @cancelled="onEmailVerificationCancelled"
        @resend="onEmailVerificationResend" />
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import EmailVerificationDialog from '@/components/EmailVerificationDialog.vue'

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Form refs and state
const form = ref(null)
const fileInput = ref(null)
const formValid = ref(false)
const loading = ref(false)
const initialLoading = ref(true)
const profilePictureFile = ref(null)
const languages = ref([])
const loadingLanguages = ref(false)

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
  // address: '',
  profile_picture: null,
  new_password: '',
  confirm_password: '',
  current_password: '',
  default_language: null
})

// Validation rules
const required = v => !!v || 'This field is required'
const emailRule = v => /.+@.+\..+/.test(v) || 'Please enter a valid email'
const phoneRule = v => /^\+?[0-9\s-]{10,15}$/.test(v) || 'Please enter a valid phone number'
const passwordRule = v => v.length >= 8 || 'Password must be at least 8 characters'
const passwordMatchRule = v => v === formData.value.new_password || 'Passwords do not match'
const currentPasswordRequired = v => {
  // Only require current password if we're making changes or changing password
  const hasProfileChanges = hasFormChanges.value
  const hasPasswordChange = formData.value.new_password
  return (hasProfileChanges || hasPasswordChange) ? (!!v || 'Current password is required to save changes') : true
}

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
      // formData.value.address = userData.address || ''
      formData.value.profile_picture = userData.profile_picture || null
      formData.value.default_language = userData.default_language?.id || null

      // Always keep password fields empty for security
      formData.value.new_password = ''
      formData.value.confirm_password = ''
      formData.value.current_password = ''
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
    showError('Failed to load profile information')
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
    // formData.value.address !== (userData.address || '') ||
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
  if (!hasProfileChanges) {
    return 'No Changes to Save'
  } else if (hasProfileChanges && hasPasswordChange) {
    return 'Save Profile & Password'
  } else if (hasPasswordChange) {
    return 'Change Password'
  } else {
    return 'Save Profile Changes'
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
    showError('Please select an image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    showError('Image size should be less than 5MB')
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
  snackbarText.value = 'Email updated successfully!'
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
  showError('Email change cancelled. Your email remains unchanged.')
}

// Handle email verification resend
const onEmailVerificationResend = () => {
  showSnackbar.value = false
  snackbarColor.value = 'info'
  snackbarText.value = 'Verification code resent to your new email address.'
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
  // if (!formValid.value) return

  const hasProfileChanges = hasFormChanges.value
  const hasPasswordChange = formData.value.new_password

  // Check if there are any changes to save
  if (!hasProfileChanges && !hasPasswordChange) {
    showError('No changes detected. Please modify some fields before saving.')
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
        // address: formData.value.address || null,
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
    let successMessage = 'Profile updated successfully'
    if (hasProfileChanges && hasPasswordChange) {
      successMessage = 'Profile and password updated successfully'
    } else if (hasPasswordChange) {
      successMessage = 'Password changed successfully'
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
      'Failed to update profile'
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
.edit-profile-page {
  padding-bottom: 64px;
}

.profile-avatar-wrapper {
  position: relative;
}

.profile-edit-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: var(--v-primary-base, #1976d2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  cursor: pointer;
}
</style>