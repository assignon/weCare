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
        <!-- Profile Picture -->
        <div class="text-center mb-6">
          <div class="profile-avatar-wrapper d-inline-block position-relative">
            <v-avatar size="100" color="grey-lighten-3">
              <v-img
                v-if="formData.profile_picture"
                :src="formData.profile_picture"
                cover
              ></v-img>
              <span v-else class="text-h4">{{ userInitials }}</span>
            </v-avatar>
            <div 
              class="profile-edit-badge"
              @click="openFileInput"
            >
              <v-icon size="small" color="white">mdi-camera</v-icon>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              class="d-none"
              @change="handleFileUpload"
            />
          </div>
          <p class="text-subtitle-1 mt-2">Change Profile Picture</p>
        </div>
        
        <!-- Form Fields -->
        <v-card class="mb-4 pa-4 rounded-lg" elevation="1">
          <v-text-field
            v-model="formData.first_name"
            label="First Name"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[required]"
          ></v-text-field>
          
          <v-text-field
            v-model="formData.last_name"
            label="Last Name"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[required]"
          ></v-text-field>
          
          <v-text-field
            v-model="formData.email"
            label="Email"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[required, emailRule]"
            type="email"
          ></v-text-field>
          
          <v-text-field
            v-model="formData.phone"
            label="Phone Number"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :rules="[required, phoneRule]"
          ></v-text-field>
        </v-card>
        
        <!-- Password section -->
        <v-card class="mb-6 pa-4 rounded-lg" elevation="1">
          <p class="text-subtitle-1 font-weight-bold mb-3">Change Password</p>
          
          <v-text-field
            v-model="formData.new_password"
            label="New Password"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            type="password"
            :rules="formData.new_password ? [passwordRule] : []"
          ></v-text-field>
          
          <v-text-field
            v-model="formData.confirm_password"
            label="Confirm New Password"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            type="password"
            :rules="formData.new_password ? [passwordMatchRule] : []"
          ></v-text-field>
        </v-card>
        
        <!-- Current password confirmation -->
        <v-card class="mb-6 pa-4 rounded-lg" elevation="1">
          <p class="text-subtitle-1 font-weight-bold mb-3">Confirm Changes</p>
          <p class="text-caption mb-3">Please enter your current password to save changes</p>
          
          <v-text-field
            v-model="formData.current_password"
            label="Current Password"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            type="password"
            :rules="[required]"
          ></v-text-field>
        </v-card>
        
        <!-- Submit button -->
        <v-btn 
          color="primary" 
          block 
          size="large"
          type="submit"
          :loading="loading"
          :disabled="!formValid"
          class="text-none rounded-lg"
        >
          Save Changes
        </v-btn>
      </v-form>
      
      <!-- Snackbar for notifications -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        timeout="3000"
        location="top"
      >
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn
            variant="text"
            @click="showSnackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Form refs and state
const form = ref(null)
const fileInput = ref(null)
const formValid = ref(false)
const loading = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Form data
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  profile_picture: null,
  new_password: '',
  confirm_password: '',
  current_password: ''
})

// Validation rules
const required = v => !!v || 'This field is required'
const emailRule = v => /.+@.+\..+/.test(v) || 'Please enter a valid email'
const phoneRule = v => /^\+?[0-9\s-]{10,15}$/.test(v) || 'Please enter a valid phone number'
const passwordRule = v => v.length >= 8 || 'Password must be at least 8 characters'
const passwordMatchRule = v => v === formData.value.new_password || 'Passwords do not match'

// Computed properties
const userInitials = computed(() => {
  const firstName = formData.value.first_name || ''
  const lastName = formData.value.last_name || ''
  
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  return initials || '?'
})

// Initialize form data from user
onMounted(() => {
  if (user.value) {
    formData.value.first_name = user.value.first_name || ''
    formData.value.last_name = user.value.last_name || ''
    formData.value.email = user.value.email || ''
    formData.value.phone = user.value.phone || user.value.mobile || ''
    formData.value.profile_picture = user.value.profile_picture || null
  }
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
  
  // Create a preview URL
  formData.value.profile_picture = URL.createObjectURL(file)
  
  // In a real app, you would typically upload this to your server
  // and update the formData with the returned URL
}

// Form submission
const submitForm = async () => {
  if (!formValid.value) return
  
  loading.value = true
  
  try {
    // Create payload (remove confirm password)
    const payload = { ...formData.value }
    delete payload.confirm_password
    
    // Only include new password if set
    if (!payload.new_password) {
      delete payload.new_password
    }
    
    // Call API to update profile
    // In a real app, you would:
    // 1. Upload profile picture if changed
    // 2. Send update request to API
    // await apiService.updateProfile(payload)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    snackbarColor.value = 'success'
    snackbarText.value = 'Profile updated successfully'
    showSnackbar.value = true
    
    // In a real app, you would also update the auth store with new user data
    // await auth.fetchUserData()
    
    // Navigate back to profile page
    setTimeout(() => {
      router.push({ name: 'Profile' })
    }, 1500)
  } catch (error) {
    // Show error message
    showError(error.message || 'Failed to update profile')
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