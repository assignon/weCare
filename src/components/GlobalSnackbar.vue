<template>
  <v-snackbar
    v-model="show"
    :color="snackbarColor"
    :timeout="currentNotification?.timeout || 5000"
    :persistent="currentNotification?.persistent || false"
    location="top right"
    :multi-line="isMultiLine"
    :vertical="isVertical"
    class="global-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon :icon="snackbarIcon" class="mr-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1" v-if="currentNotification?.title">
          {{ currentNotification.title }}
        </div>
        <div class="text-body-2">
          {{ currentNotification?.message }}
        </div>
      </div>
    </div>
    
    <template v-slot:actions>
      <v-btn
        variant="text" 
        icon="mdi-close"
        size="small"
        @click="closeSnackbar"
      />
      
      <!-- Action button for certain notification types -->
      <v-btn
        v-if="hasAction"
        variant="text"
        size="small"
        @click="handleAction"
      >
        {{ actionText }}
      </v-btn>
    </template>
  </v-snackbar>
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
    'success': 'mdi-check-circle',
    'info': 'mdi-information',
    'warning': 'mdi-alert',
    'error': 'mdi-alert-circle'
  }
  return iconMap[currentNotification.value?.severity] || 'mdi-information'
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
.global-snackbar {
  z-index: 10000 !important;
}

:deep(.v-snackbar__wrapper) {
  min-width: 300px;
  max-width: 500px;
}

:deep(.v-snackbar__content) {
  padding: 16px !important;
}
</style> 