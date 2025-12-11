<template>
    <div class="splash-screen">
        <div class="splash-content">
            <!-- Logo/Brand -->
            <div class="brand-section">
                <div class="logo-container">
                    <img src="/AE-no-text.svg" alt="AfriQExpress Logo" class="logo-image" />
                </div>
                <h1 class="brand-title">AfriQExpress</h1>
                <p class="brand-subtitle">Your African Marketplace</p>
            </div>

            <!-- Loading Animation -->
            <div class="loading-section">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p class="loading-text">{{ loadingText }}</p>
            </div>
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
    'Discovering great products...',
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
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.brand-section {
    margin-bottom: 60px;
    animation: fadeInUp 1s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.logo-container {
    margin-bottom: 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 140px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 28px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.logo-image {
    width: 100px;
    height: 100px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    animation: pulse 2s infinite;
}

.brand-title {
    font-size: 42px;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.5px;
    text-align: center;
    line-height: 1.1;
    font-family: 'Poppins', sans-serif;
}

.brand-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-weight: 400;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    text-align: center;
    line-height: 1.4;
    letter-spacing: 0.5px;
}

.loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 1.5s ease-out;
}

.loading-dots {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.loading-dots span {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
    animation-delay: 0s;
}

.loading-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 400;
    min-height: 24px;
    transition: opacity 0.3s ease;
    text-align: center;
}

.version-info {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    text-align: center;
}

.version-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    font-weight: 300;
    text-align: center;
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
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
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
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: float 30s infinite linear;
    z-index: 1;
}

.splash-screen::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
    z-index: 1;
}

@keyframes float {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }
    100% {
        transform: translate(-40px, -40px) rotate(360deg);
    }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .brand-title {
        font-size: 36px;
    }

    .brand-subtitle {
        font-size: 15px;
    }

    .logo-container {
        width: 120px;
        height: 120px;
        border-radius: 24px;
    }

    .logo-image {
        width: 80px;
        height: 80px;
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

    .logo-container {
        width: 100px;
        height: 100px;
        border-radius: 20px;
    }

    .logo-image {
        width: 70px;
        height: 70px;
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
