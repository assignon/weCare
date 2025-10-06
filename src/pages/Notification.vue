<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        custom-title="Notifications"
      >
        <template #right-content>
                     <button 
             v-if="notifications.length > 0 && hasUnreadNotifications"
             @click="handleMarkAllAsRead"
             :disabled="markingAllAsRead"
             class="px-4 py-2 text-white text-sm font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
             style="background: linear-gradient(to right, #2563eb, #9333ea);"
             onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
             onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
           >
            <Loader2 v-if="markingAllAsRead" class="w-4 h-4 animate-spin" />
            <CheckCheck v-else class="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </template>
      </AppHeader>

      <!-- Unread count badge -->
      <div v-if="hasUnreadNotifications" class="mb-6">
        <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-blue-200/50">
          <div class="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
          <span class="text-sm font-semibold text-blue-800">
            {{ unreadCount }} unread notification{{ unreadCount === 1 ? '' : 's' }}
          </span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">Loading Notifications</h3>
        <p class="text-slate-600">Please wait while we fetch your notifications</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="mb-6 p-6 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-1">Error Loading Notifications</h4>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
          <button @click="clearError" class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
            <X class="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Notifications list -->
      <div v-else-if="!loading && notifications.length > 0" class="space-y-4">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="[
            'bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border transition-all duration-200 overflow-hidden cursor-pointer',
            !notification.is_read 
              ? 'border-blue-200/50 shadow-lg' 
              : 'border-white/20 hover:shadow-md'
          ]"
          @click="toggleNotification(notification.id)"
        >
          <!-- Notification header (always visible) -->
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-4 flex-1">
                <!-- Notification icon -->
                <div :class="[
                  'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                  getNotificationIcon(notification.type).bgClass
                ]" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                  <component 
                    :is="getNotificationIcon(notification.type).icon" 
                    class="w-6 h-6 text-white"
                    v-if="getNotificationIcon(notification.type).icon"
                  />
                  <!-- Fallback icon if component fails to render -->
                  <Bell v-else class="w-6 h-6 text-white" />
                </div>

                <!-- Notification content -->
                <div class="flex-1 min-w-0 overflow-hidden">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-semibold text-slate-900 truncate flex-1 min-w-0">
                      {{ notification.title }}
                    </h3>
                    <div v-if="!notification.is_read" class="flex items-center space-x-2 flex-shrink-0">
                      <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        New
                      </span>
                    </div>
                  </div>
                  
                  <!-- Preview message (truncated) -->
                  <p class="text-sm text-slate-600 mb-3 line-clamp-2">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500 flex items-center">
                      <Clock class="w-3 h-3 mr-1" />
                      {{ formatDate(notification.created_at) }}
                    </span>
                    
                    <!-- Expand/collapse indicator -->
                    <div class="flex items-center space-x-2">
                      <button 
                        v-if="!notification.is_read"
                        @click.stop="handleMarkAsRead(notification.id)"
                        :disabled="markingAsRead[notification.id]"
                        class="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Loader2 v-if="markingAsRead[notification.id]" class="w-4 h-4 text-blue-600 animate-spin" />
                        <Check v-else class="w-4 h-4 text-blue-600" />
                      </button>
                      
                      <!-- Expand/collapse arrow -->
                      <div class="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all duration-200">
                        <ChevronDown 
                          :class="[
                            'w-4 h-4 text-slate-600 transition-transform duration-200',
                            expandedNotifications.includes(notification.id) ? 'rotate-180' : ''
                          ]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Expanded content (shown when clicked) -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div 
              v-if="expandedNotifications.includes(notification.id)"
              class="border-t border-slate-100 bg-slate-50/50"
            >
              <div class="p-6">
                <!-- Full message content -->
                <div class="mb-4">
                  <h4 class="text-sm font-semibold text-slate-700 mb-2">Full Message:</h4>
                  <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {{ notification.message }}
                  </p>
                </div>

                <!-- Additional details -->
                <div class="space-y-3">
                  <!-- Notification type -->
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Type:</span>
                    <span class="font-medium text-slate-700 capitalize">{{ notification.type }}</span>
                  </div>

                  <!-- Created date (full format) -->
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Created:</span>
                    <span class="font-medium text-slate-700">{{ formatFullDate(notification.created_at) }}</span>
                  </div>

                  <!-- Read status -->
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Status:</span>
                    <span :class="[
                      'font-medium px-2 py-1 rounded-full text-xs',
                      notification.is_read 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    ]">
                      {{ notification.is_read ? 'Read' : 'Unread' }}
                    </span>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
                                     <button 
                     v-if="notification.reference_type && notification.reference_id"
                     @click.stop="navigateToReference(notification)"
                     class="px-4 py-2 text-white text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center space-x-2 shadow-lg"
                     style="background: linear-gradient(to right, #2563eb, #4f46e5);"
                     onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
                     onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
                   >
                    <ArrowRight class="w-4 h-4" />
                    <span>View {{ notification.reference_type }}</span>
                  </button>
                  
                  <button 
                    v-if="!notification.is_read"
                    @click.stop="handleMarkAsRead(notification.id)"
                    :disabled="markingAsRead[notification.id]"
                    class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <Loader2 v-if="markingAsRead[notification.id]" class="w-4 h-4 animate-spin" />
                    <Check v-else class="w-4 h-4" />
                    <span>Mark as Read</span>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Load More Button -->
        <div v-if="pagination.hasMore" class="text-center pt-6">
          <button 
            @click="loadMoreNotifications"
            :disabled="loadingMore"
            class="px-8 py-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl text-slate-700 font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <Loader2 v-if="loadingMore" class="w-5 h-5 animate-spin" />
            <span>{{ loadingMore ? 'Loading...' : 'Load more notifications' }}</span>
          </button>
        </div>

        <!-- End of notifications -->
        <div v-if="!pagination.hasMore && notifications.length > 0" class="text-center py-12">
          <div class="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-6"></div>
          <CheckCircle class="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p class="text-sm text-slate-600 font-medium">
            You've seen all {{ notifications.length }} notifications
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && notifications.length === 0" class="text-center py-16">
        <div class="w-32 h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Bell class="w-16 h-16 text-blue-600 opacity-60" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
        <p class="text-slate-600 max-w-md mx-auto">
          You'll see order updates, promotions, and other important information here when they arrive.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import AppHeader from '@/components/AppHeader.vue'
import { 
  Bell, Check, CheckCheck, CheckCircle, Clock, AlertCircle, X, Loader2, ArrowRight,
  ShoppingBag, AlertTriangle, Info, Package, ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()

// Local state
const markingAsRead = ref({})
const markingAllAsRead = ref(false)
const expandedNotifications = ref([])

// Computed properties from store
const notifications = computed(() => notificationStore.notifications)
const loading = computed(() => notificationStore.loading)
const loadingMore = computed(() => notificationStore.loadingMore)
const error = computed(() => notificationStore.error)
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications)
const pagination = computed(() => notificationStore.pagination)

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
    'order': { 
      icon: ShoppingBag, 
      bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600'
    },
    'alert': { 
      icon: AlertTriangle, 
      bgClass: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    'info': { 
      icon: Info, 
      bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    'success': { 
      icon: CheckCircle, 
      bgClass: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    'warning': { 
      icon: AlertTriangle, 
      bgClass: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    'product': { 
      icon: Package, 
      bgClass: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    'medicine': { 
      icon: Package, 
      bgClass: 'bg-gradient-to-r from-green-600 to-emerald-600'
    },
    'pharmacy': { 
      icon: ShoppingBag, 
      bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-500'
    }
  }
  
  // Ensure we always return a valid icon object
  const result = icons[type] || icons.info
  return {
    icon: result.icon || Bell,
    bgClass: result.bgClass || 'bg-gradient-to-r from-blue-500 to-cyan-500'
  }
}

const navigateToReference = (notification) => {
  if (!notification.reference_type || !notification.reference_id) return

  const linkMap = {
    'Order': `/order-status/${notification.reference_id}`,
    'Product': `/product/${notification.reference_id}`,
    'Profile': '/profile'
  }

  const link = linkMap[notification.reference_type]
  if (link) {
    router.push(link)
  }
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
  await notificationStore.loadMoreNotifications()
}

// Accordion functionality
const toggleNotification = (notificationId) => {
  const index = expandedNotifications.value.indexOf(notificationId)
  if (index > -1) {
    expandedNotifications.value.splice(index, 1)
  } else {
    expandedNotifications.value.push(notificationId)
  }
}

const formatFullDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>