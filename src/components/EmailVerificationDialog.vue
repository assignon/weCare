<template>
    <v-dialog v-model="dialog" max-width="450" persistent>
        <v-card class="rounded-lg">
            <v-card-title class="text-h5 pa-6 pb-4">
                Verify New Email Address
            </v-card-title>

            <v-card-text class="pa-6 pt-0">
                <div class="text-center mb-6">
                    <v-icon size="64" color="primary" class="mb-4">mdi-email-check</v-icon>
                    <p class="text-subtitle-1 mb-2">
                        We've sent a verification code to:
                    </p>
                    <p class="text-h6 font-weight-bold primary--text">{{ newEmail }}</p>
                    <p class="text-caption text-grey-darken-1 mt-2">
                        Enter the 5-digit code to complete your email change
                    </p>
                </div>

                <!-- OTP Input -->
                <div class="text-center mb-4">
                    <v-text-field v-model="verificationCode" label="Verification Code" variant="outlined"
                        class="centered-input" maxlength="5" placeholder="00000" :rules="[required, codeRule]"
                        :error-messages="errorMessage" @input="clearError" @keypress="onlyNumbers"
                        style="font-size: 18px; letter-spacing: 8px; text-align: center; font-family: 'Courier New', monospace;" />
                </div>

                <!-- Timer -->
                <div class="text-center mb-4" v-if="timeRemaining > 0">
                    <p class="text-caption">
                        <v-icon size="small" class="mr-1">mdi-timer-outline</v-icon>
                        Code expires in {{ Math.floor(timeRemaining / 60) }}:{{ String(timeRemaining % 60).padStart(2,
                            '0') }}
                    </p>
                </div>

                <!-- Expired message -->
                <div class="text-center mb-4" v-else>
                    <p class="text-caption error--text">
                        <v-icon size="small" class="mr-1">mdi-timer-off</v-icon>
                        Verification code has expired
                    </p>
                </div>
            </v-card-text>

            <v-card-actions class="pa-6 pt-2">
                <div class="w-100">
                    <!-- Primary Action: Verify Email -->
                    <v-btn color="primary" variant="flat" block size="large" @click="verifyCode" :loading="verifying"
                        :disabled="!isCodeValid || timeRemaining <= 0"
                        class="mb-6 text-none rounded-xl verification-btn" elevation="3">
                        <v-icon start size="20">mdi-check-circle-outline</v-icon>
                        Verify Email Address
                    </v-btn>

                    <!-- Code Expired State -->
                    <div v-if="timeRemaining <= 0" class="text-center mb-4">
                        <v-btn color="orange" variant="text" size="large" block @click="resendCode" :loading="resending"
                            class="mb-3 text-none resend-btn">
                            <v-icon start>mdi-email-sync-outline</v-icon>
                            Send New Code
                        </v-btn>
                    </div>

                    <!-- Active Code State -->
                    <div v-else class="mb-4">
                        <!-- Resend option (disabled during active timer) -->
                        <v-btn :color="timeRemaining > 30 ? 'grey-lighten-1' : 'primary'" variant="outlined"
                            size="small" block @click="resendCode" :loading="resending" :disabled="timeRemaining > 30"
                            class="mb-3 text-none rounded-lg">
                            <v-icon start size="16">mdi-refresh</v-icon>
                            {{ timeRemaining > 30 ? `Resend in ${Math.ceil(timeRemaining - 30)}s` : 'Resend Code' }}
                        </v-btn>
                    </div>

                    <!-- Cancel Button -->
                    <v-btn color="grey-darken-1" variant="text" size="large" block @click="cancelVerification"
                        :disabled="verifying || resending" class="text-none rounded-lg cancel-btn">
                        <v-icon start size="18">mdi-close</v-icon>
                        Cancel Email Change
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { apiService } from '@/services/api'

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

// Validation rules
const required = v => !!v || 'Verification code is required'
const codeRule = v => (v && v.length === 5) || 'Code must be 5 digits'

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
.centered-input :deep(.v-field__input) {
    text-align: center;
    font-size: 18px;
    letter-spacing: 8px;
    font-family: 'Courier New', monospace;
}

.primary--text {
    color: rgb(var(--v-theme-primary)) !important;
}

.error--text {
    color: rgb(var(--v-theme-error)) !important;
}

.gap-2 {
    gap: 8px;
}

.flex-1 {
    flex: 1;
}

.w-100 {
    width: 100%;
}

.verification-btn {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
    box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.3);
    transition: all 0.3s ease;
}

.verification-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4);
}

.resend-btn {
    transition: all 0.3s ease;
}

.resend-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.cancel-btn {
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    background-color: rgba(var(--v-theme-error), 0.05);
}
</style>