<template>
  <div class="profile-page">
    <v-container>
      <!-- Header with back button and title -->
      <div class="d-flex align-center justify-space-between mb-5">
        <v-btn icon variant="text" @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <h1 class="text-h5 font-weight-bold text-center">My Profile</h1>

        <div style="width: 40px"></div> <!-- Spacer to maintain layout -->
      </div>

      <!-- Profile summary -->
      <v-card class="mb-6 rounded-lg" elevation="0">
        <div class="d-flex align-center pa-4">
          <div class="profile-avatar-wrapper mr-4 position-relative">
            <v-avatar size="75" color="grey-lighten-3">
              <v-img v-if="user && user.profile_picture" :src="user.profile_picture" cover></v-img>
              <span v-else class="text-h5">{{ userInitials }}</span>
            </v-avatar>
          </div>

          <div>
            <div class="text-h6 font-weight-bold">{{ user.first_name || user.last_name || user.email }}</div>
            <div class="text-subtitle-2 text-grey">@{{ userHandle }}</div>
          </div>

          <v-spacer></v-spacer>

          <v-btn color="primary" variant="outlined" class="text-none" rounded size="small"
            :to="{ name: 'EditProfile' }">
            Edit Profile
          </v-btn>
        </div>
      </v-card>

      <!-- Menu items -->
      <v-list class="menu-list rounded-lg pa-2 mb-4" flat>
        <!-- Edit Profile -->
        <v-list-item :to="{ name: 'EditProfile' }" class="rounded-lg mb-2" color="red">
          <template v-slot:prepend>
            <v-icon color="primary" size="large">mdi-account-edit</v-icon>
          </template>

          <v-list-item-title>Edit Profile</v-list-item-title>

          <template v-slot:append>
            <v-icon color="primary">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <!-- Skin Profile -->
        <v-list-item :to="{ name: 'SkinProfile' }" class="rounded-lg mb-2" color="grey-lighten-5">
          <template v-slot:prepend>
            <v-icon color="primary" size="large">mdi-face-woman-shimmer</v-icon>
          </template>

          <v-list-item-title>Skin Profile</v-list-item-title>

          <template v-slot:append>
            <v-icon color="primary">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <!-- Addresses -->
        <v-list-item :to="{ name: 'Addresses' }" class="rounded-lg mb-2" color="grey-lighten-5">
          <template v-slot:prepend>
            <v-icon color="primary" size="large">mdi-map-marker</v-icon>
          </template>

          <v-list-item-title>Addresses</v-list-item-title>

          <template v-slot:append>
            <v-icon color="primary">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <!-- Language -->
        <v-list-item @click="showLanguageDialog = true" class="rounded-lg mb-2" color="grey-lighten-5">
          <template v-slot:prepend>
            <v-icon color="primary" size="large">mdi-translate</v-icon>
          </template>

          <v-list-item-title>Language</v-list-item-title>

          <template v-slot:append>
            <span class="text-caption text-grey">{{ currentLanguageName }}</span>
            <v-icon color="primary">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <!-- Logout button -->
      <v-list class="menu-list rounded-lg pa-2" elevation="1">
        <v-list-item @click="confirmLogout" class="rounded-lg" color="grey-lighten-5">
          <template v-slot:prepend>
            <v-avatar color="error" size="32" class="profile-icon">
              <v-icon color="white" size="18">mdi-logout</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="text-error">Log out</v-list-item-title>

          <template v-slot:append>
            <v-icon color="error">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>



      <!-- Language selection dialog -->
      <v-dialog v-model="showLanguageDialog" max-width="300">
        <v-card>
          <v-card-title class="text-h6 pb-1">Select Language</v-card-title>
          <v-card-subtitle>Current: {{ currentLanguageName }}</v-card-subtitle>
          <v-card-text>
            <div v-if="loadingLanguages" class="text-center py-4">
              <v-progress-circular indeterminate size="24"></v-progress-circular>
              <p class="text-caption mt-2">Loading languages...</p>
            </div>
            <v-radio-group v-else v-model="selectedLanguage">
              <v-radio v-for="lang in languages" :key="lang.id" :value="lang.id" :label="lang.name"></v-radio>
            </v-radio-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showLanguageDialog = false" class="text-none">Cancel</v-btn>
            <v-btn color="primary" class="text-none" @click="changeLanguage" :disabled="loadingLanguages">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Logout confirmation dialog -->
      <v-dialog v-model="showLogoutDialog" max-width="300">
        <v-card>
          <v-card-title class="text-h6">Log Out</v-card-title>
          <v-card-text>
            Are you sure you want to log out?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showLogoutDialog = false">Cancel</v-btn>
            <v-btn color="error" @click="logout">Log Out</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Dialog states
const showLanguageDialog = ref(false)
const showLogoutDialog = ref(false)
const selectedLanguage = ref('')
const languages = ref([])
const loadingLanguages = ref(false)

// Skin profile states
const loadingProfile = ref(false)
const profileData = ref({})

// Age groups (same as in ShopperGoals)
const ageGroups = ref([
  {
    value: 'under_18',
    label: 'Under 18',
    description: 'Young skin with natural glow'
  },
  {
    value: '18_25',
    label: '18-25',
    description: 'Prevention and maintenance'
  },
  {
    value: '26_35',
    label: '26-35',
    description: 'Early anti-aging care'
  },
  {
    value: '36_45',
    label: '36-45',
    description: 'Targeted anti-aging'
  },
  {
    value: '46_plus',
    label: '46+',
    description: 'Mature skin care'
  }
])

// Computed properties for user info
const userInitials = computed(() => {
  if (!user) return '?'

  const name = user.name || user.full_name || user.email || ''
  return name.split(' ').map(n => n[0]?.toUpperCase() || '').join('').substring(0, 2)
})

const userHandle = computed(() => {
  if (!user) return 'user'
  return user.username || user.email?.split('@')[0] || 'user'
})

const currentLanguageName = computed(() => {
  if (!user?.default_language) return 'English'
  return user.default_language.name
})

const hasProfileData = computed(() => {
  return profileData.value.skin_type ||
    (profileData.value.skin_concerns && profileData.value.skin_concerns.length > 0) ||
    (profileData.value.product_types && profileData.value.product_types.length > 0) ||
    profileData.value.age_group
})

// Helper function to get age group label
const getAgeGroupLabel = (value) => {
  const ageGroup = ageGroups.value.find(ag => ag.value === value)
  return ageGroup ? ageGroup.label : value
}

// Load profile data
const fetchProfileData = async () => {
  loadingProfile.value = true
  try {
    const response = await apiService.getProfile()
    profileData.value = response.data
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
  } finally {
    loadingProfile.value = false
  }
}



// Load languages on mount
onMounted(async () => {
  await Promise.all([
    fetchLanguages(),
    fetchProfileData()
  ])

  // Set current language as selected
  if (user?.default_language) {
    selectedLanguage.value = user.default_language.id
  }
})



// Fetch available languages
const fetchLanguages = async () => {
  loadingLanguages.value = true
  try {
    const response = await apiService.getLanguages()
    languages.value = response.data.results || response.data || []

    // If no current language is set, default to English
    if (!selectedLanguage.value && languages.value.length > 0) {
      const english = languages.value.find(lang => lang.code === 'en')
      if (english) {
        selectedLanguage.value = english.id
      } else {
        selectedLanguage.value = languages.value[0].id
      }
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error)
  } finally {
    loadingLanguages.value = false
  }
}

// Confirm logout
const confirmLogout = () => {
  showLogoutDialog.value = true
}

// Logout function
const logout = () => {
  auth.logout()
  router.replace({ name: 'Login' })
}

// Change language function
const changeLanguage = async () => {
  try {
    // Update user's default language
    const updatePayload = {
      default_language: selectedLanguage.value
    }

    await apiService.updateLanguage(selectedLanguage.value)

    // Refresh user data to get updated language
    await auth.fetchUserData()

    showLanguageDialog.value = false

    // You could also trigger a UI language change here if implementing i18n
    console.log(`Language changed to: ${selectedLanguage.value}`)
  } catch (error) {
    console.error('Failed to update language:', error)
  }
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 64px;
}

.profile-avatar-wrapper {
  position: relative;
}

.profile-edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--v-primary-base, #1976d2);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.menu-list {
  background-color: white;
}

.profile-icon {
  font-size: 16px;
}

.skin-profile-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.profile-item {
  padding: 8px 0;
}

.profile-item:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>