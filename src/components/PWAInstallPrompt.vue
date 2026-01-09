<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Download class="w-6 h-6 text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 mb-0.5">Install AfriQExpress</h3>
          <p class="text-xs text-gray-600">Get the full app experience</p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button
            @click="dismissPrompt"
            class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Not now
          </button>
          <button
            @click="handleInstall"
            :disabled="installing"
            class="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all"
            style="background: linear-gradient(to right, #8c36ea, #3060eb);"
          >
            {{ installing ? 'Installing...' : 'Install' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Download } from 'lucide-vue-next'
import pwaService from '@/services/pwaService'

const showPrompt = ref(false)
const installing = ref(false)
const dismissedKey = 'pwa-install-dismissed'

onMounted(() => {
  // Check if user previously dismissed
  const dismissed = localStorage.getItem(dismissedKey)
  if (dismissed) {
    const dismissedTime = parseInt(dismissed)
    // Show again after 7 days
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
    if (daysSinceDismissed < 7) {
      return
    }
  }

  // Check if PWA can be installed
  const checkInstallability = () => {
    const status = pwaService.getInstallationStatus()
    if (status.canInstall && !status.isInstalled) {
      // Show prompt after a short delay
      setTimeout(() => {
        showPrompt.value = true
      }, 3000) // Show after 3 seconds
    }
  }

  // Check immediately
  checkInstallability()

  // Listen for install availability
  const handleInstallAvailable = () => {
    checkInstallability()
  }

  window.addEventListener('pwa-install-available', handleInstallAvailable)
  window.addEventListener('pwa-installed', () => {
    showPrompt.value = false
  })

  onUnmounted(() => {
    window.removeEventListener('pwa-install-available', handleInstallAvailable)
    window.removeEventListener('pwa-installed', () => {})
  })
})

const handleInstall = async () => {
  installing.value = true
  try {
    const result = await pwaService.showInstallPrompt()
    if (result.success) {
      showPrompt.value = false
    } else {
      installing.value = false
    }
  } catch (error) {
    console.error('Install error:', error)
    installing.value = false
  }
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem(dismissedKey, Date.now().toString())
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

