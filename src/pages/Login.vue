<template>
  <div class="login-page">
    <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card width="350" elevation="8" class="rounded-lg pa-6">
        <h1 class="text-h5 font-weight-bold mb-6 text-center">Login</h1>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="onLogin">
          <v-alert v-if="route.query.registered" type="success" class="mb-4">Registration successful! Please log in.</v-alert>
          <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
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
            autocomplete="current-password"
            prepend-inner-icon="mdi-lock"
          />
          <div class="d-flex justify-end mb-4">
            <v-btn variant="text" color="primary" :to="{ name: 'PasswordForgot' }" size="small">Forgot Password?</v-btn>
          </div>
          <v-btn block color="primary" type="submit" :loading="loading" :disabled="!isFormValid" class="mb-4 text-white">Login</v-btn>
          <div class="text-center">
            <span>Don't have an account?</span>
            <v-btn variant="text" color="primary" :to="{ name: 'Register' }" size="small">Register</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref(null)
const isFormValid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const emailRules = [v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']
const passwordRules = [v => !!v || 'Password is required']

const error = authStore.error
const loading = authStore.loading

const onLogin = async () => {
  if (!isFormValid.value) return
  const success = await authStore.login({ email: email.value, password: password.value })
  if (success) {
    const redirect = route.query.redirect || { name: 'Home' }
    router.push(redirect)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace({ name: 'Home' })
  }
})
</script>

<style scoped>
.login-page {
  padding-bottom: 64px;
}
</style> 