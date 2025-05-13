<template>
  <div class="password-forgot-page">
    <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card width="350" elevation="8" class="rounded-lg pa-6">
        <h1 class="text-h5 font-weight-bold mb-6 text-center">Forgot Password</h1>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="onForgot">
          <v-alert v-if="alert" :type="alertType" class="mb-4" closable>{{ alert }}</v-alert>
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            variant="outlined"
            class="mb-4"
            autocomplete="email"
            prepend-inner-icon="mdi-email"
          />
          <v-btn block color="primary" type="submit" :loading="loading" :disabled="!isFormValid" class="mb-4 text-white">Send Reset Link</v-btn>
          <div class="text-center">
            <v-btn variant="text" color="primary" :to="{ name: 'Login' }" size="small">Back to Login</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref(null)
const isFormValid = ref(false)
const email = ref('')
const alert = ref('')
const alertType = ref('success')
const loading = ref(false)

const emailRules = [v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']

const onForgot = async () => {
  if (!isFormValid.value) return
  loading.value = true
  alert.value = ''
  try {
    await axios.post('/api/auth/password/forgot/', { email: email.value })
    alertType.value = 'success'
    alert.value = 'If your email exists, a reset link has been sent.'
    email.value = ''
    isFormValid.value = false
  } catch (err) {
    alertType.value = 'error'
    alert.value = err.response?.data?.detail || 'Failed to send reset link.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-forgot-page {
  padding-bottom: 64px;
}
</style> 