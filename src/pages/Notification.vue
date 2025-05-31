<template>
  <div class="notification-page">
    <v-container>
      <!-- Header with title and actions -->
      <div class="d-flex justify-space-between align-center mb-4">
        <v-btn variant="text" @click="$router.back()">
          <v-icon size="24">mdi-arrow-left</v-icon>
          <h2 class="text-h6 font-weight-bold ml-2">Notifications</h2>
        </v-btn>  
        <v-btn
          v-if="notifications.length > 0 && hasUnreadNotifications"
          color="primary"
          variant="text"
          size="small"
          class="text-none"
          @click="handleMarkAllAsRead"
          :loading="markingAllAsRead"
        >
          Mark all as read
        </v-btn>
      </div>

      <!-- Unread count badge -->
      <div v-if="hasUnreadNotifications" class="mb-4">
        <v-chip color="primary" size="small">
          {{ unreadCount }} unread notification{{ unreadCount === 1 ? '' : 's' }}
        </v-chip>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center my-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-3 text-grey">Loading notifications...</p>
      </div>

      <!-- Error state -->
      <v-alert
        v-if="error && !loading"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="clearError"
      >
        {{ error }}
      </v-alert>

      <!-- Notifications list -->
      <div v-if="!loading && notifications.length > 0">
        <v-expansion-panels
          v-model="expandedPanels"
          multiple
          variant="accordion"
        >
          <v-expansion-panel
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'notification-item',
              { 'unread-notification': !notification.is_read }
            ]"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <!-- Notification icon based on type -->
                  <v-icon
                    :color="getNotificationIcon(notification.type).color"
                    class="me-3"
                    size="20"
                  >
                    {{ getNotificationIcon(notification.type).icon }}
                  </v-icon>
                  
                  <!-- Title and unread indicator -->
                  <div>
                    <div class="d-flex align-center">
                      <span class="text-subtitle-1 font-weight-medium">
                        {{ notification.title }}
                      </span>
                      <v-chip
                        v-if="!notification.is_read"
                        color="primary"
                        size="x-small"
                        class="ml-2"
                      >
                        New
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{ formatDate(notification.created_at) }}
                    </div>
                  </div>
                </div>

                <!-- Mark as read button -->
                <v-btn
                  v-if="!notification.is_read"
                  icon
                  size="small"
                  variant="text"
                  @click.stop="handleMarkAsRead(notification.id)"
                  :loading="markingAsRead[notification.id]"
                >
                  <v-icon size="18">mdi-check</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Mark as read
                  </v-tooltip>
                </v-btn>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="notification-content">
                <p class="text-body-2">{{ notification.message }}</p>
                
                <!-- Reference link if available -->
                <div v-if="notification.reference_type && notification.reference_id" class="mt-3">
                  <v-btn
                    :to="getNotificationLink(notification)"
                    color="primary"
                    variant="outlined"
                    size="small"
                    rounded
                    class="text-none"
                  >
                    View {{ notification.reference_type }}
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Pagination if needed -->
        <div v-if="notifications.length >= 20" class="text-center mt-6">
          <v-btn
            color="primary"
            variant="text"
            @click="loadMoreNotifications"
            :loading="loadingMore"
          >
            Load more notifications
          </v-btn>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && notifications.length === 0" class="text-center my-12">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">
          mdi-bell-outline
        </v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">No notifications yet</h3>
        <p class="text-body-2 text-grey-darken-1">
          You'll see order updates, promotions, and other important information here.
        </p>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

// Local state
const expandedPanels = ref([])
const markingAsRead = ref({})
const markingAllAsRead = ref(false)
const loadingMore = ref(false)

// Computed properties from store
const notifications = computed(() => notificationStore.notifications)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications)

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  
  return date.toLocaleDateString()
}

const getNotificationIcon = (type) => {
  const icons = {
    'order': { icon: 'mdi-shopping', color: 'blue' },
    'alert': { icon: 'mdi-alert-circle', color: 'orange' },
    'info': { icon: 'mdi-information', color: 'blue' },
    'success': { icon: 'mdi-check-circle', color: 'green' },
    'warning': { icon: 'mdi-alert', color: 'orange' }
  }
  return icons[type] || icons.info
}

const getNotificationLink = (notification) => {
  if (!notification.reference_type || !notification.reference_id) return null
  
  const linkMap = {
    'Order': `/order-status/${notification.reference_id}`,
    'Product': `/product/${notification.reference_id}`,
    'Profile': '/profile'
  }
  
  return linkMap[notification.reference_type] || null
}

const handleMarkAsRead = async (notificationId) => {
  markingAsRead.value[notificationId] = true
  try {
    await notificationStore.markAsRead(notificationId)
  } finally {
    markingAsRead.value[notificationId] = false
  }
}

const handleMarkAllAsRead = async () => {
  markingAllAsRead.value = true
  try {
    await notificationStore.markAllAsRead()
  } finally {
    markingAllAsRead.value = false
  }
}

const clearError = () => {
  notificationStore.clearError()
}

const loadMoreNotifications = async () => {
  loadingMore.value = true
  try {
    // Implement pagination if needed
    await notificationStore.fetchNotifications()
  } finally {
    loadingMore.value = false
  }
}

// Auto-refresh notifications every 30 seconds
let refreshInterval = null

onMounted(async () => {
  await notificationStore.fetchNotifications()
  
  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    notificationStore.fetchUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.notification-page {
  padding-bottom: 100px; /* Account for bottom navigation */
}

.notification-item {
  margin-bottom: 8px;
}

.unread-notification {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.notification-content {
  padding: 16px 0;
}

.v-expansion-panel-title {
  padding: 16px !important;
}

.v-expansion-panel-text {
  padding: 0 16px 16px 16px !important;
}

/* Custom styling for unread notifications */
.unread-notification .v-expansion-panel-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style> 