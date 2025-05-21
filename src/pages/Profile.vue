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
              <v-img
                v-if="user && user.profile_picture"
                :src="user.profile_picture"
                cover
              ></v-img>
              <span v-else class="text-h5">{{ userInitials }}</span>
            </v-avatar>
            <div class="profile-edit-badge">
              <v-icon size="small" color="white">mdi-pencil</v-icon>
            </div>
          </div>
          
          <div>
            <div class="text-h6 font-weight-bold">{{ user?.name || user?.full_name || 'User' }}</div>
            <div class="text-subtitle-2 text-grey">@{{ userHandle }}</div>
          </div>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            variant="outlined"
            class="text-none"
            rounded
            size="small"
            :to="{ name: 'EditProfile' }"
          >
            Edit Profile
          </v-btn>
        </div>
      </v-card>
      
      <!-- Menu items -->
      <v-list class="menu-list rounded-lg pa-2 mb-4" elevation="1">
        <!-- Edit Profile -->
        <v-list-item
          :to="{ name: 'EditProfile' }"
          class="rounded-lg mb-2"
          color="grey-lighten-5"
        >
          <template v-slot:prepend>
            <!-- <v-avatar color="primary" size="32" class="profile-icon"> -->
            <v-icon color="secondary" size="large">mdi-account-edit</v-icon>
            <!-- </v-avatar> -->
          </template>
          
          <v-list-item-title>Edit Profile</v-list-item-title>
          
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
        
        <!-- Addresses -->
        <v-list-item
          :to="{ name: 'Addresses' }"
          class="rounded-lg mb-2"
          color="grey-lighten-5"
        >
          <template v-slot:prepend>
            <!-- <v-avatar color="green" size="32" class="profile-icon"> -->
              <v-icon color="secondary" size="large">mdi-map-marker</v-icon>
            <!-- </v-avatar> -->
          </template>
          
          <v-list-item-title>Addresses</v-list-item-title>
          
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
        
        <!-- Language -->
        <v-list-item
          @click="showLanguageDialog = true"
          class="rounded-lg mb-2"
          color="grey-lighten-5"
        >
          <template v-slot:prepend>
            <!-- <v-avatar color="blue" size="32" class="profile-icon"> -->
              <v-icon color="secondary" size="large">mdi-translate</v-icon>
            <!-- </v-avatar> -->
          </template>
          
          <v-list-item-title>Language</v-list-item-title>
          
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
      
      <!-- Logout button -->
      <v-list class="menu-list rounded-lg pa-2" elevation="1">
        <v-list-item
          @click="confirmLogout"
          class="rounded-lg"
          color="grey-lighten-5"
        >
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
          <v-card-text>
            <v-radio-group v-model="selectedLanguage">
              <v-radio value="en" label="English"></v-radio>
              <v-radio value="fr" label="French"></v-radio>
              <v-radio value="es" label="Spanish"></v-radio>
            </v-radio-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showLanguageDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="changeLanguage">Save</v-btn>
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
import { ref, computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Dialog states
const showLanguageDialog = ref(false)
const showLogoutDialog = ref(false)
const selectedLanguage = ref('en')

// Computed properties for user info
const userInitials = computed(() => {
  if (!user.value) return '?'
  
  const name = user.value.name || user.value.full_name || user.value.email || ''
  return name.split(' ').map(n => n[0]?.toUpperCase() || '').join('').substring(0, 2)
})

const userHandle = computed(() => {
  if (!user.value) return 'user'
  return user.value.username || user.value.email?.split('@')[0] || 'user'
})

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
const changeLanguage = () => {
  // Here you would implement language change logic
  console.log(`Language changed to: ${selectedLanguage.value}`)
  showLanguageDialog.value = false
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
</style> 