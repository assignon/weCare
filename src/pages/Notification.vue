<template>
  <div class="min-h-screen bg-white pb-24">
    <!-- Modern Header -->
    <BackButtonHeader :title="$t('notifications.title')">
      <template #right>
        <button 
          v-if="notifications.length > 0 && hasUnreadNotifications"
          @click="handleMarkAllAsRead"
          :disabled="markingAllAsRead"
          class="px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700"
        >
          <Loader2 v-if="markingAllAsRead" class="w-3 h-3 animate-spin" />
          <CheckCheck v-else class="w-3 h-3" />
          <span>{{ $t('notifications.mark_all_read_button') }}</span>
        </button>
      </template>
    </BackButtonHeader>
    
    <div class="p-3 pt-4">

      <!-- Unread count badge -->
      <div v-if="hasUnreadNotifications" class="mb-3">
        <div class="inline-flex items-center px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
          <div class="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
          <span class="text-xs font-semibold text-blue-800">
            {{ unreadCount }} {{ unreadCount === 1 ? $t('notifications.unread_notification') : $t('notifications.unread_notifications') }}
          </span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('notifications.loading_notifications') }}</h3>
        <p class="text-xs text-gray-600">{{ $t('notifications.loading_subtitle') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <AlertCircle class="w-3 h-3 text-red-600" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-semibold text-red-800 mb-0.5">{{ $t('notifications.error_loading') }}</h4>
            <p class="text-red-700 text-xs">{{ error }}</p>
          </div>
          <button @click="clearError" class="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2">
            <X class="w-3 h-3 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Notifications list -->
      <div v-else-if="!loading && notifications.length > 0" class="space-y-2">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="[
            'bg-white rounded-lg border transition-all duration-200 overflow-hidden cursor-pointer',
            !notification.is_read 
              ? 'border-blue-200 shadow-sm' 
              : 'border-gray-200 hover:bg-gray-50'
          ]"
          @click="toggleNotification(notification.id)"
        >
          <!-- Notification header (always visible) -->
          <div class="p-3">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-2.5 flex-1">
                <!-- Notification icon -->
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-600">
                  <component 
                    :is="getNotificationIcon(notification.type).icon" 
                    class="w-4 h-4 text-white"
                    v-if="getNotificationIcon(notification.type).icon"
                  />
                  <!-- Fallback icon if component fails to render -->
                  <Bell v-else class="w-4 h-4 text-white" />
                </div>

                <!-- Notification content -->
                <div class="flex-1 min-w-0 overflow-hidden max-w-full">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-xs font-semibold text-gray-900 truncate flex-1 min-w-0">
                      {{ notification.title }}
                    </h3>
                    <div v-if="!notification.is_read" class="flex items-center flex-shrink-0">
                      <div class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <!-- Preview message (truncated) -->
                  <p class="text-xs text-gray-600 mb-2 line-clamp-2 break-words">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400 flex items-center">
                      <Clock class="w-3 h-3 mr-1" />
                      {{ formatDate(notification.created_at) }}
                    </span>
                    
                    <!-- Expand/collapse indicator -->
                    <div class="flex items-center space-x-1.5">
                      <button 
                        v-if="!notification.is_read"
                        @click.stop="handleMarkAsRead(notification.id)"
                        :disabled="markingAsRead[notification.id]"
                        class="w-6 h-6 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Loader2 v-if="markingAsRead[notification.id]" class="w-3 h-3 text-blue-600 animate-spin" />
                        <Check v-else class="w-3 h-3 text-blue-600" />
                      </button>
                      
                      <!-- Expand/collapse arrow -->
                      <div class="w-6 h-6 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200">
                        <ChevronDown 
                          :class="[
                            'w-3 h-3 text-gray-600 transition-transform duration-200',
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
              class="border-t border-gray-100 bg-gray-50"
            >
              <div class="p-3">
                <!-- Full message content -->
                <div class="mb-3">
                  <h4 class="text-xs font-semibold text-gray-700 mb-1.5">{{ $t('notifications.full_message') }}</h4>
                  <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {{ notification.message }}
                  </p>
                </div>

                <!-- Additional details -->
                <div class="space-y-2">
                  <!-- Notification type -->
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">{{ $t('notifications.type') }}</span>
                    <span class="font-medium text-gray-700 capitalize">{{ notification.type }}</span>
                  </div>

                  <!-- Created date (full format) -->
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">{{ $t('notifications.created') }}</span>
                    <span class="font-medium text-gray-700">{{ formatFullDate(notification.created_at) }}</span>
                  </div>

                  <!-- Read status -->
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">{{ $t('notifications.status') }}</span>
                    <span :class="[
                      'font-medium px-1.5 py-0.5 rounded-full text-xs',
                      notification.is_read 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    ]">
                      {{ notification.is_read ? $t('notifications.read') : $t('notifications.unread') }}
                    </span>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <button 
                    v-if="notification.reference_type && notification.reference_id"
                    @click.stop="navigateToReference(notification)"
                    class="px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight class="w-3 h-3" />
                    <span>{{ $t('notifications.view') }} {{ notification.reference_type }}</span>
                  </button>
                  
                  <button 
                    v-if="!notification.is_read"
                    @click.stop="handleMarkAsRead(notification.id)"
                    :disabled="markingAsRead[notification.id]"
                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center space-x-1.5"
                  >
                    <Loader2 v-if="markingAsRead[notification.id]" class="w-3 h-3 animate-spin" />
                    <Check v-else class="w-3 h-3" />
                    <span>{{ $t('notifications.mark_as_read') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Load More Button -->
        <div v-if="pagination.hasMore" class="text-center pt-3">
          <button 
            @click="loadMoreNotifications"
            :disabled="loadingMore"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 mx-auto"
          >
            <Loader2 v-if="loadingMore" class="w-4 h-4 animate-spin" />
            <span>{{ loadingMore ? $t('notifications.loading') : $t('notifications.load_more') }}</span>
          </button>
        </div>

        <!-- End of notifications -->
        <div v-if="!pagination.hasMore && notifications.length > 0" class="text-center py-8">
          <div class="w-12 h-0.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <CheckCircle class="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p class="text-xs text-gray-600 font-medium">
            {{ $t('notifications.seen_all', { count: notifications.length }) }}
          </p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && notifications.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Bell class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-sm font-bold text-gray-900 mb-1">{{ $t('notifications.no_notifications_yet') }}</h3>
        <p class="text-xs text-gray-600 max-w-md mx-auto">
          {{ $t('notifications.no_notifications_message') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '@/stores/notification'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { 
  Bell, Check, CheckCheck, CheckCircle, Clock, AlertCircle, X, Loader2, ArrowRight,
  ShoppingBag, AlertTriangle, Info, Package, ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
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

  if (diffMins < 1) return t('notifications.just_now')
  if (diffMins < 60) {
    return diffMins === 1 
      ? t('notifications.minute_ago', { count: diffMins })
      : t('notifications.minutes_ago', { count: diffMins })
  }
  if (diffHours < 24) {
    return diffHours === 1
      ? t('notifications.hour_ago', { count: diffHours })
      : t('notifications.hours_ago', { count: diffHours })
  }
  if (diffDays < 7) {
    return diffDays === 1
      ? t('notifications.day_ago', { count: diffDays })
      : t('notifications.days_ago', { count: diffDays })
  }

  return date.toLocaleDateString('fr-FR')
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
    'Profile': '/profile',
    'ListingInquiry': '/listing-inquiries'
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
  return date.toLocaleString('fr-FR', {
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