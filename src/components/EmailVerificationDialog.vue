<template>
  <div 
    v-if="dialog" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click="cancelVerification"
  >
    <div 
      class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MailCheck class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Verify New Email Address</h3>
        <p class="text-sm text-slate-600">
          We've sent a verification code to:
        </p>
        <p class="text-lg font-semibold text-blue-600 mt-1">{{ newEmail }}</p>
        <p class="text-xs text-slate-500 mt-2">
          Enter the 5-digit code to complete your email change
        </p>
      </div>

      <!-- OTP Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
        <input 
          v-model="verificationCode"
          type="text"
          maxlength="5"
          placeholder="00000"
          @input="clearError"
          @keypress="onlyNumbers"
          class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-center text-lg tracking-widest font-mono"
          :class="{ 'border-red-300 focus:ring-red-500/20 focus:border-red-500': errorMessage }"
        />
        <p v-if="errorMessage" class="text-sm text-red-600 mt-2">{{ errorMessage }}</p>
      </div>

      <!-- Timer -->
      <div class="text-center mb-6">
        <div v-if="timeRemaining > 0" class="flex items-center justify-center space-x-2 text-sm text-slate-600">
          <Clock class="w-4 h-4" />
          <span>Code expires in {{ Math.floor(timeRemaining / 60) }}:{{ String(timeRemaining % 60).padStart(2, '0') }}</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2 text-sm text-red-600">
          <Clock class="w-4 h-4" />
          <span>Verification code has expired</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <!-- Primary Action: Verify Email -->
        <button 
          @click="verifyCode"
          :disabled="!isCodeValid || timeRemaining <= 0 || verifying"
          class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
          onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
        >
          <Loader2 v-if="verifying" class="w-5 h-5 animate-spin" />
          <CheckCircle v-else class="w-5 h-5" />
          <span>Verify Email Address</span>
        </button>

        <!-- Code Expired State -->
        <div v-if="timeRemaining <= 0" class="text-center">
          <button 
            @click="resendCode"
            :disabled="resending"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="resending" class="w-5 h-5 animate-spin" />
            <RefreshCw v-else class="w-5 h-5" />
            <span>Send New Code</span>
          </button>
        </div>

        <!-- Active Code State -->
        <div v-else>
          <button 
            @click="resendCode"
            :disabled="timeRemaining > 30 || resending"
            class="w-full py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:border-blue-500 hover:text-blue-600"
          >
            <Loader2 v-if="resending" class="w-5 h-5 animate-spin" />
            <RefreshCw v-else class="w-5 h-5" />
            <span>{{ timeRemaining > 30 ? `Resend in ${Math.ceil(timeRemaining - 30)}s` : 'Resend Code' }}</span>
          </button>
        </div>

        <!-- Cancel Button -->
        <button 
          @click="cancelVerification"
          :disabled="verifying || resending"
          class="w-full py-3 text-slate-600 hover:text-slate-800 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <X class="w-5 h-5" />
          <span>Cancel Email Change</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { apiService } from '@/services/api'
import { 
  MailCheck, Clock, CheckCircle, RefreshCw, X, Loader2
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  newEmail: String,
  expiresInMinutes: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['update:modelValue', 'verified', 'cancelled', 'resend'])

// Reactive data
const verificationCode = ref('')
const verifying = ref(false)
const resending = ref(false)
const errorMessage = ref('')
const timeRemaining = ref(props.expiresInMinutes * 60) // Convert to seconds
const timer = ref(null)

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isCodeValid = computed(() => {
  return verificationCode.value && verificationCode.value.length === 5
})

// Methods
const clearError = () => {
  errorMessage.value = ''
}

const onlyNumbers = (event) => {
  const char = String.fromCharCode(event.which)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timer.value)
      // When timer expires, invalidate the code in the database
      handleCodeExpiration()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const verifyCode = async () => {
  if (!isCodeValid.value) return

  verifying.value = true
  errorMessage.value = ''

  try {
    await apiService.verifyEmailChange(verificationCode.value)
    emit('verified', verificationCode.value)
    dialog.value = false
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Invalid verification code'
  } finally {
    verifying.value = false
  }
}

const cancelVerification = async () => {
  stopTimer()
  // When timer expires, invalidate the code in the database
  handleCodeExpiration()
  emit('cancelled')
  dialog.value = false
}

const handleCodeExpiration = async () => {
  try {
    // Call API to invalidate expired verification codes
    await apiService.invalidateExpiredEmailVerification()
    console.log('Expired email verification codes invalidated')
  } catch (error) {
    console.error('Failed to invalidate expired codes:', error)
    // Don't show error to user as this is a background operation
  }
}

const resendCode = async () => {
  resending.value = true
  try {
    await apiService.requestEmailChange(props.newEmail)
    // Reset timer to 2 minutes
    timeRemaining.value = 2 * 60
    verificationCode.value = ''
    errorMessage.value = ''
    emit('resend')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to resend code'
  } finally {
    resending.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})

// Watch for dialog changes
const unwatchDialog = computed(() => props.modelValue)
watch(unwatchDialog, () => {
  if (props.modelValue) {
    startTimer()
    verificationCode.value = ''
    errorMessage.value = ''
    // Reset timer to 2 minutes when dialog opens
    timeRemaining.value = 2 * 60
  } else {
    stopTimer()
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>