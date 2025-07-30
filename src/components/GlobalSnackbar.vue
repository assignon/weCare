<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-to-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
  >
    <div
      v-if="show"
      class="fixed top-4 left-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="snackbarIcon" class="h-6 w-6" :class="iconColorClass" />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p v-if="currentNotification?.title" class="text-sm font-medium text-grey-900 mb-1">
              {{ currentNotification.title }}
            </p>
            <p class="text-sm text-grey-500">
              {{ currentNotification?.message }}
            </p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button
              @click="closeSnackbar"
              class="bg-white rounded-md inline-flex text-grey-400 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span class="sr-only">Close</span>
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div v-if="hasAction" class="mt-4 flex space-x-3">
          <button
            @click="handleAction"
            class="bg-white rounded-md text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {{ actionText }}
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

const router = useRouter()

// State
const show = ref(false)
const currentNotification = ref(null)
const notificationQueue = ref([])

// Computed properties
const snackbarColor = computed(() => {
  const colorMap = {
    'success': 'success',
    'info': 'info',
    'warning': 'warning',
    'error': 'error'
  }
  return colorMap[currentNotification.value?.severity] || 'info'
})

const snackbarIcon = computed(() => {
  const iconMap = {
    'success': 'CheckCircle',
    'info': 'Info',
    'warning': 'AlertTriangle',
    'error': 'AlertCircle'
  }
  return iconMap[currentNotification.value?.severity] || 'Info'
})

const iconColorClass = computed(() => {
  const colorMap = {
    'success': 'text-success-600',
    'info': 'text-blue-600',
    'warning': 'text-warning-600',
    'error': 'text-error-600'
  }
  return colorMap[currentNotification.value?.severity] || 'text-blue-600'
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
/* Additional styles if needed */
</style>