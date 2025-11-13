<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform scale-95 opacity-0 -translate-x-1/2 -translate-y-1/2"
    enter-to-class="transform scale-100 opacity-100 -translate-x-1/2 -translate-y-1/2"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform scale-100 opacity-100 -translate-x-1/2 -translate-y-1/2"
    leave-to-class="transform scale-95 opacity-0 -translate-x-1/2 -translate-y-1/2"
  >
    <div v-if="show" class="fixed inset-0 snackbar-container">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-20"
        @click="closeSnackbar"
      ></div>
      
      <!-- Snackbar -->
      <div
        @click="handleSnackbarClick"
        class="fixed left-1/2 transform -translate-x-1/2 max-w-sm w-11/12 sm:w-full bg-white shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer snackbar-content"
        style="top: 2%;"
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
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-vue-next'
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
    'Profile': 'Go to Profile',
    'ListingInquiry': 'View Messages'
  }
  return typeMap[currentNotification.value?.reference_type] || 'View Details'
})

// Methods
const displayNotification = (notification) => {
  console.log('📱 Shopper GlobalSnackbar: Displaying notification:', notification)
  console.log('📱 Shopper GlobalSnackbar: Current show state:', show.value)
  
  // Check for duplicate notifications (same ID or same message within 5 seconds)
  const isDuplicate = notificationQueue.value.some(n => 
    n.id === notification.id || 
    (n.message === notification.message && 
     Math.abs(new Date(n.created_at) - new Date(notification.created_at)) < 5000)
  )
  
  if (isDuplicate) {
    console.log('📱 Duplicate notification ignored:', notification.message)
    return
  }
  
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

const handleSnackbarClick = () => {
  // Close snackbar when clicked anywhere on it
  closeSnackbar()
}

const handleAction = () => {
  if (!currentNotification.value?.reference_type || !currentNotification.value?.reference_id) {
    return
  }

  const linkMap = {
    'Order': `/order-status/${currentNotification.value.reference_id}`,
    'Product': `/product/${currentNotification.value.reference_id}`,
    'Profile': '/profile',
    'ListingInquiry': '/listing-inquiries'
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
/* Ensure snackbar is above everything */
.snackbar-container {
  z-index: 9998 !important;
}

.snackbar-content {
  z-index: 9999 !important;
  position: fixed !important;
}

/* Override any potential z-index conflicts */
:deep(.snackbar-content) {
  z-index: 9999 !important;
}
</style>