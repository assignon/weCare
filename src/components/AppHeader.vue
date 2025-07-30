<template>
  <div class="flex items-center justify-between mb-6">
    <!-- Left side -->
    <div class="flex items-center space-x-3">
      <!-- Back button (if showBack is true) -->
      <button 
        v-if="showBack"
        @click="handleBack"
        class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
      >
        <ArrowLeft class="w-5 h-5 text-slate-700" />
      </button>
      
      <!-- Logo and title (if not showing back button) -->
      <template v-if="!showBack">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span class="text-white font-bold text-lg">w</span>
        </div>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
            weCare
          </h1>
        </div>
      </template>
      
      <!-- Custom title (if provided) -->
      <h1 v-if="customTitle" class="text-xl font-bold text-slate-900">{{ customTitle }}</h1>
    </div>
    
    <!-- Right side -->
    <div class="flex items-center space-x-2">
      <!-- Custom right content (if provided) -->
      <slot name="right-content">
        <!-- Default notification and profile buttons -->
        <button 
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center relative"
          @click="navigateToNotification"
        >
          <Bell class="w-5 h-5 text-slate-700" />
          <span 
            v-if="notification.hasUnreadNotifications"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg"
          >
            {{ notification.unreadCount }}
          </span>
        </button>
        <button 
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center overflow-hidden"
          @click="navigateToProfile"
        >
          <img 
            v-if="auth.user?.profile_picture" 
            :src="auth.user.profile_picture" 
            alt="Profile" 
            class="w-full h-full object-cover"
          />
          <User v-else class="w-5 h-5 text-slate-700" />
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { Bell, User, ArrowLeft } from 'lucide-vue-next'

// Props
const props = defineProps({
  showBack: {
    type: Boolean,
    default: false
  },
  customTitle: {
    type: String,
    default: ''
  },
  backRoute: {
    type: [String, Object],
    default: null
  }
})

const router = useRouter()
const auth = useAuthStore()
const notification = useNotificationStore()

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
}

const navigateToProfile = () => {
  router.push({ name: 'Profile' })
}

const handleBack = () => {
  if (props.backRoute) {
    if (typeof props.backRoute === 'string') {
      router.push({ name: props.backRoute })
    } else {
      router.push(props.backRoute)
    }
  } else {
    router.back()
  }
}
</script> 