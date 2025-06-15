<template>
    <v-btn v-if="showInstallButton" @click="handleInstall" :loading="installing" color="primary" variant="outlined"
        class="pwa-install-btn" prepend-icon="mdi-download">
        {{ installText }}
    </v-btn>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import pwaService from '@/services/pwaService'

const props = defineProps({
    text: {
        type: String,
        default: 'Install App'
    },
    hideWhenInstalled: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['install-success', 'install-failed', 'install-dismissed'])

const showInstallButton = ref(false)
const installing = ref(false)
const installText = ref(props.text)

const updateButtonVisibility = () => {
    const status = pwaService.getInstallationStatus()

    if (props.hideWhenInstalled && status.isInstalled) {
        showInstallButton.value = false
        return
    }

    showInstallButton.value = status.canInstall
}

const handleInstall = async () => {
    installing.value = true
    installText.value = 'Installing...'

    try {
        const result = await pwaService.showInstallPrompt()

        if (result.success) {
            emit('install-success', result)
            installText.value = 'Installed!'
            setTimeout(() => {
                showInstallButton.value = false
            }, 2000)
        } else {
            emit(result.outcome === 'dismissed' ? 'install-dismissed' : 'install-failed', result)
            installText.value = props.text
        }
    } catch (error) {
        console.error('Install error:', error)
        emit('install-failed', { error: error.message })
        installText.value = props.text
    } finally {
        installing.value = false
    }
}

const onInstallStatusChange = (installed) => {
    if (installed) {
        showInstallButton.value = false
        emit('install-success', { outcome: 'accepted' })
    }
}

onMounted(() => {
    updateButtonVisibility()
    pwaService.onInstall(onInstallStatusChange)

    // Listen for beforeinstallprompt events
    const handleBeforeInstallPrompt = () => {
        updateButtonVisibility()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Cleanup
    onUnmounted(() => {
        pwaService.offInstall(onInstallStatusChange)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    })
})
</script>

<style scoped>
.pwa-install-btn {
    text-transform: none;
    font-weight: 500;
}
</style>