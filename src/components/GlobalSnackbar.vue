<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="transform -translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-2 opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto rounded-lg shadow-lg p-4',
        snackbarColorClass
      ]"
    >
      <div class="flex items-center">
        <component :is="snackbarIcon" class="w-5 h-5 mr-3 flex-shrink-0" />
        <div class="flex-1">
          <div v-if="currentNotification?.title" class="font-medium mb-1">
            {{ currentNotification.title }}
          </div>
          <div class="text-sm">
            {{ currentNotification?.message }}
          </div>
        </div>
        <div class="flex items-center ml-3 space-x-2">
          <button
            v-if="hasAction"
            class="text-xs font-medium underline hover:no-underline"
            @click="handleAction"
          >
            {{ actionText }}
          </button>
          <button
            class="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            @click="closeSnackbar"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import notificationService from '@/services/notificationService'
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-vue-next'

const router = useRouter()

// State
const show = ref(false)
const currentNotification = ref(null)
const notificationQueue = ref([])

// Computed properties
const snackbarColorClass = computed(() => {
  const colorMap = {
    'success': 'bg-success text-white',
    'info': 'bg-info text-white',
    'warning': 'bg-warning text-black',
    'error': 'bg-error text-white'
  }
  return colorMap[currentNotification.value?.severity] || 'bg-info text-white'
})

const snackbarIcon = computed(() => {
  const iconMap = {
    'success': CheckCircle,
    'info': Info,
    'warning': AlertTriangle,
    'error': AlertCircle
  }
  return iconMap[currentNotification.value?.severity] || Info
})

const isMultiLine = computed(() => {
  return currentNotification.value?.message?.length > 60
})

const isVertical = computed(() => {
  return isMultiLine.value || !!currentNotification.value?.title
})

const hasAction = computed(() => {
  return currentNotification.value?.reference_type && currentNotification.value?.reference_id
})

const actionText = computed(() => {
  const typeMap = {
    'Order': 'View Order',
    'Product': 'View Product',
    'Profile': 'Go to Profile'
  }
  return typeMap[currentNotification.value?.reference_type] || 'View Details'
})

// Methods
const displayNotification = (notification) => {
  // Add to queue
  notificationQueue.value.push(notification)

  // If not currently showing a notification, show this one
  if (!show.value) {
    showNextNotification()
  }
}

const showNextNotification = () => {
  if (notificationQueue.value.length === 0) {
    show.value = false
    currentNotification.value = null
    return
  }

  // Get next notification from queue
  currentNotification.value = notificationQueue.value.shift()
  show.value = true

  // If persistent notification, don't auto-close
  if (!currentNotification.value.persistent && currentNotification.value.timeout > 0) {
    setTimeout(() => {
      if (show.value) {
        closeSnackbar()
      }
    }, currentNotification.value.timeout)
  }
}

const closeSnackbar = () => {
  show.value = false
  // Wait for snackbar close animation, then show next
  setTimeout(() => {
    showNextNotification()
  }, 300)
}

const handleAction = () => {
  if (!currentNotification.value?.reference_type || !currentNotification.value?.reference_id) {
    return
  }

  const linkMap = {
    'Order': `/order-status/${currentNotification.value.reference_id}`,
    'Product': `/product/${currentNotification.value.reference_id}`,
    'Profile': '/profile'
  }

  const link = linkMap[currentNotification.value.reference_type]
  if (link) {
    router.push(link)
  } else {
    router.push('/notifications')
  }

  closeSnackbar()
}

// Lifecycle
onMounted(() => {
  // Register snackbar callback with notification service
  notificationService.registerSnackbarCallback(displayNotification)
})

onUnmounted(() => {
  // Unregister snackbar callback
  notificationService.unregisterSnackbarCallback(displayNotification)
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style>