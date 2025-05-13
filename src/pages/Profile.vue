<template>
  <div class="profile-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">Profile</h2>
      <v-card v-if="user" class="mb-4 pa-4">
        <div class="mb-2"><strong>Name:</strong> {{ user.name || user.full_name || user.email }}</div>
        <div class="mb-2"><strong>Email:</strong> {{ user.email }}</div>
      </v-card>
      <v-btn color="error" block @click="logout">Logout</v-btn>
    </v-container>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
const user = auth.user

const logout = () => {
  auth.logout()
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 64px;
}
</style> 