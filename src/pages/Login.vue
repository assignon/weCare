<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- <div class="auth-illustration">
        <img src="/src/assets/images/login-illustration.svg" alt="Login illustration" />
      </div> -->

      <div class="auth-content">
        <h1 class="auth-title">Login</h1>
        <p class="auth-subtitle">Please sign in to continue.</p>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="onLogin" class="w-100">
          <v-alert v-if="route.query.registered" type="success" class="mb-4" variant="tonal" density="compact">
            Registration successful! Please log in.
          </v-alert>

          <v-alert v-if="route.query.message" type="success" class="mb-4" variant="tonal" density="compact">
            {{ route.query.message }}
          </v-alert>

          <v-alert v-if="authStore.error" type="error" class="mb-4" variant="tonal" density="compact" closable>
            {{ authStore.error }}
          </v-alert>

          <div class="input-field">
            <v-text-field v-model="email" label="Email" :rules="emailRules" variant="outlined" class="mb-4"
              autocomplete="email" prepend-inner-icon="mdi-email" hide-details="auto" width="100%" />
          </div>

          <div class="input-field">
            <v-text-field v-model="password" label="Password" :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4"
              autocomplete="current-password" prepend-inner-icon="mdi-lock" hide-details="auto" width="100%" />
          </div>

          <div class="forgot-password-link text-right mb-4">
            <router-link :to="{ name: 'ForgotPassword' }" class="forgot-link">
              Forgot Password?
            </router-link>
          </div>

          <v-btn block color="#1a2233" type="submit" :loading="authStore.loading" :disabled="!isFormValid"
            class="auth-btn">
            Sign In
          </v-btn>

          <div class="text-center auth-link">
            Don't have account? <router-link :to="{ name: 'Register' }">Sign Up</router-link>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]
const passwordRules = [v => !!v || 'Password is required']

const onLogin = async () => {
  if (!isFormValid.value) return

  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
    // // Check if user has completed their profile (has skin_type set)
    // if (authStore.user?.profile?.skin_type) {
    //   // Profile is complete, redirect to the originally requested page or home
    //   const redirectPath = route.query.redirect || '/'
    //   router.push(redirectPath)
    // } else {
    //   // Profile is incomplete, redirect to shopper goals
    //   router.push({ name: 'ShopperGoals' })
    // }
  }
}

onMounted(() => {
  // If already authenticated, redirect to home or original destination
  if (authStore.isAuthenticated) {
    const redirectPath = route.query.redirect || '/'
    router.replace(redirectPath)
  }
})
</script>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.auth-container {
  width: 100%;
}

/* .auth-illustration {
  width: 100%;
  background-color: #f0f2f8;
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.auth-illustration img {
  height: 180px;
  width: auto;
  max-width: 100%;
} */

.auth-content {
  padding: 24px;
  width: 100%;
  /* box-sizing: border-box; */
}

.auth-title {
  font-size: 35px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a2233;
  width: 100%;
}

.auth-subtitle {
  font-size: 16px;
  color: #707a8a;
  margin-bottom: 28px;
  width: 100%;
}

.input-field {
  margin-bottom: 12px;
  width: 100%;
}

/* .auth-input {
  width: 100%;
}

.auth-input :deep(.v-field__outline) {
  border-color: #e0e4ec;
} */

/* .auth-input :deep(.v-field--focused .v-field__outline) {
  border-color: #1a2233;
} */

/* .auth-input :deep(.v-field__input) {
  width: 100%;
} */

.remember-me {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  width: 100%;
}

/* .remember-switch :deep(.v-label) {
  font-size: 14px;
  color: #707a8a;
  opacity: 1;
} */

.auth-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  min-height: 48px;
  text-transform: none;
  margin-bottom: 16px;
  box-shadow: none;
  width: 100%;
}

.auth-link {
  margin-top: 16px;
  color: #707a8a;
  font-size: 15px;
  width: 100%;
}

.auth-link a {
  /* color: #1a2233; */
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 4px;
  text-decoration: none;
}

/* Media queries for better responsiveness */
@media screen and (max-width: 600px) {
  .auth-container {
    max-width: 100%;
  }

  .auth-content {
    padding: 20px 16px;
  }

  .auth-title {
    font-size: 35px;
  }

  .auth-subtitle {
    font-size: 17px;
  }
}

/* For very small screens */
@media screen and (max-width: 320px) {
  .auth-page {
    padding: 8px;
  }

  .auth-illustration {
    padding: 20px 0;
  }

  .auth-illustration img {
    height: 140px;
  }
}

.w-100 {
  width: 100%;
}

.forgot-password-link {
  width: 100%;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>