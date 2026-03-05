<template>
  <div class="page-container flex items-center justify-center p-4">
    <div class="w-full max-w-xs">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-card">
          <Mail class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-navy mb-1">
          {{ $t('auth.reset_password') }}
        </h1>
        <p class="text-grey-500 text-xs">{{ $t('auth.reset_password_subtitle') }}</p>
      </div>

      <form @submit.prevent="onForgotPassword" class="space-y-4">
        <!-- Alert -->
        <div v-if="alert" :class="['alert', alertType === 'success' ? 'alert-success' : 'alert-error']">
          <CheckCircle v-if="alertType === 'success'" class="w-4 h-4" />
          <XCircle v-else class="w-4 h-4" />
          <span>{{ alert }}</span>
        </div>

        <!-- Email field -->
        <div class="space-y-1">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-4 w-4 text-grey-400 group-focus-within:text-navy transition-colors" />
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input pl-10 pr-3 h-12 text-sm"
              :placeholder="$t('auth.enter_email_address')"
              autocomplete="email"
            />
          </div>
          <p class="text-xs text-grey-400 mt-1">{{ $t('auth.reset_link_message') }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading || !email"
          class="btn-cta disabled:bg-grey-400 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ $t('auth.sending_reset_link') }}
          </span>
          <span v-else class="flex items-center justify-center">
            <Mail class="w-4 h-4 mr-2" />
            {{ $t('auth.send_reset_link') }}
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-grey-200"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-grey-500">{{ $t('auth.remember_password') }}</span>
          </div>
        </div>

        <!-- Login link -->
        <div class="text-center">
          <router-link :to="{ name: 'Login' }" class="btn btn-outlined inline-flex items-center justify-center w-full">
            <Lock class="w-4 h-4 mr-2" />
            {{ $t('auth.back_to_sign_in') }}
          </router-link>
        </div>
      </form>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-xs text-grey-500">
          {{ $t('auth.need_help') }} 
          <a href="https://afriqxpress.com/#footer" class="text-navy font-medium">{{ $t('auth.support_team') }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import { Mail, CheckCircle, XCircle, Lock } from 'lucide-vue-next'

const router = useRouter()
const { t, locale } = useI18n()
const email = ref('')
const alert = ref('')
const alertType = ref('success')
const loading = ref(false)

const onForgotPassword = async () => {
  if (!email.value) return

  loading.value = true
  alert.value = ''

  try {
    const hostUrl = window.location.origin
    await apiService.requestPasswordReset(email.value, hostUrl, locale.value)
    alertType.value = 'success'
    alert.value = t('auth.reset_link_sent')
    email.value = ''
  } catch (error) {
    alertType.value = 'error'
    alert.value = error.response?.data?.error || t('auth.reset_link_failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
