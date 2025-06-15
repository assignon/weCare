<template>
    <div class="splash-screen">
        <div class="splash-content">
            <!-- Logo/Brand -->
            <div class="brand-section">
                <div class="logo-container">
                    <v-icon size="80" color="white" class="logo-icon">mdi-shopping</v-icon>
                </div>
                <h1 class="brand-title">weCare</h1>
                <p class="brand-subtitle">Your Skin Care Store</p>
            </div>

            <!-- Loading Animation -->
            <!-- <div class="loading-section">
                <v-progress-circular indeterminate size="48" width="4" color="white"
                    class="loading-spinner"></v-progress-circular>
                <p class="loading-text">{{ loadingText }}</p>
            </div> -->
        </div>

        <!-- Version Info -->
        <div class="version-info">
            <p class="version-text">Version 1.0.0</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loadingText = ref('Loading...')

const loadingMessages = [
    'Loading...',
    'Preparing your experience...',
    'Setting up your marketplace...',
    'Almost ready...'
]

let messageIndex = 0
let messageInterval = null

const startLoadingAnimation = () => {
    messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length
        loadingText.value = loadingMessages[messageIndex]
    }, 1000)
}

const stopLoadingAnimation = () => {
    if (messageInterval) {
        clearInterval(messageInterval)
        messageInterval = null
    }
}

const initializeApp = async () => {
    try {
        // Initialize auth from storage first
        authStore.initAuthFromStorage()

        // Check if user is already authenticated
        if (authStore.accessToken) {
            loadingText.value = 'Verifying authentication...'
            const isValid = await authStore.checkAuth()

            if (isValid) {
                loadingText.value = 'Welcome back!'
                setTimeout(() => {
                    router.replace({ name: 'Home' })
                }, 500)
                return
            }
        }

        // Not authenticated, go to login
        loadingText.value = 'Redirecting to login...'
        setTimeout(() => {
            router.replace({ name: 'Login' })
        }, 1500)

    } catch (error) {
        console.error('Splash screen initialization error:', error)
        // On error, still redirect to login
        setTimeout(() => {
            router.replace({ name: 'Login' })
        }, 1500)
    }
}

onMounted(async () => {
    startLoadingAnimation()

    // Minimum splash screen time for better UX
    const minSplashTime = 2000 // 2 seconds
    const startTime = Date.now()

    await initializeApp()

    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minSplashTime - elapsedTime)

    if (remainingTime > 0) {
        setTimeout(() => {
            stopLoadingAnimation()
        }, remainingTime)
    } else {
        stopLoadingAnimation()
    }
})
</script>

<style scoped>
.splash-screen {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.splash-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    z-index: 2;
}

.brand-section {
    margin-bottom: 60px;
    animation: fadeInUp 1s ease-out;
}

.logo-container {
    margin-bottom: 24px;
    position: relative;
}

.logo-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    animation: pulse 2s infinite;
}

.brand-title {
    font-size: 48px;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: -1px;
}

.brand-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-weight: 300;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 1.5s ease-out;
}

.loading-spinner {
    margin-bottom: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.loading-text {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 400;
    min-height: 24px;
    transition: opacity 0.3s ease;
}

.version-info {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
}

.version-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-weight: 300;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

/* Background decoration */
.splash-screen::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s infinite linear;
    z-index: 1;
}

@keyframes float {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }

    100% {
        transform: translate(-50px, -50px) rotate(360deg);
    }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .brand-title {
        font-size: 36px;
    }

    .brand-subtitle {
        font-size: 16px;
    }

    .logo-icon {
        font-size: 64px !important;
    }

    .brand-section {
        margin-bottom: 40px;
    }
}

@media (max-width: 480px) {
    .brand-title {
        font-size: 32px;
    }

    .brand-subtitle {
        font-size: 14px;
    }

    .logo-icon {
        font-size: 56px !important;
    }
}

/* PWA specific styles */
@media (display-mode: standalone) {
    .splash-screen {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
    }
}
</style>