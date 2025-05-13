<template>
  <div class="register-page">
    <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card width="350" elevation="8" class="rounded-lg pa-6">
        <h1 class="text-h5 font-weight-bold mb-6 text-center">Register</h1>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="onRegister">
          <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
          <v-text-field
            v-model="name"
            label="Name"
            :rules="[v => !!v || 'Name is required']"
            variant="outlined"
            class="mb-4"
            autocomplete="name"
            prepend-inner-icon="mdi-account"
          />
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            variant="outlined"
            class="mb-4"
            autocomplete="email"
            prepend-inner-icon="mdi-email"
          />
          <v-text-field
            v-model="password"
            label="Password"
            :rules="passwordRules"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            class="mb-4"
            autocomplete="new-password"
            prepend-inner-icon="mdi-lock"
          />
          <v-btn block color="primary" type="submit" :loading="loading" :disabled="!isFormValid" class="mb-4 text-white">Register</v-btn>
          <div class="text-center">
            <span>Already have an account?</span>
            <v-btn variant="text" color="primary" :to="{ name: 'Login' }" size="small">Login</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref(null)
const isFormValid = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref(null)
const loading = ref(false)

const emailRules = [v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']
const passwordRules = [v => !!v || 'Password is required', v => v.length >= 8 || 'Min 8 characters']

const onRegister = async () => {
  if (!isFormValid.value) return
  loading.value = true
  error.value = null
  try {
    await axios.post('/api/auth/register/', { name: name.value, email: email.value, password: password.value })
    router.push({ name: 'Login', query: { registered: 1 } })
  } catch (err) {
    error.value = err.response?.data?.detail || 'Registration failed.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace({ name: 'Home' })
  }
})
</script>

<style scoped>
.register-page {
  padding-bottom: 64px;
}
</style> 