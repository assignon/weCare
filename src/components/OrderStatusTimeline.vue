<template>
  <div class="relative">
    <!-- Timeline line -->
    <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>
    
    <!-- Timeline items -->
    <div class="space-y-8">
      <div 
        v-for="(tracking, index) in timeline" 
        :key="index"
        class="relative flex items-start space-x-6"
      >
        <!-- Timeline dot -->
        <div class="relative z-10 flex-shrink-0">
          <div 
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white',
              tracking.completed 
                ? getStatusClasses(tracking.status)
                : 'bg-gray-100 text-gray-400'
            ]"
          >
            <component 
              :is="getStatusIcon(tracking.status)" 
              :class="[
                'w-5 h-5',
                tracking.completed ? 'text-white' : 'text-gray-400'
              ]" 
            />
          </div>
          
          <!-- Connection line for completed items -->
          <div 
            v-if="tracking.completed && index < timeline.length - 1"
            class="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-purple-400"
          ></div>
        </div>

        <!-- Timeline content -->
        <div class="flex-1 min-w-0 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-sm">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900 mb-1">
            {{ formatStatus(tracking.status) }}
          </h4>
              <p v-if="tracking.notes && !tracking.notes.includes('Payment completed')" class="text-sm text-gray-600 mb-2">
            {{ tracking.notes }}
          </p>
              <div class="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar class="w-3 h-3" />
                <span v-if="tracking.timestamp">{{ formatDate(tracking.timestamp) }}</span>
                <span v-else-if="tracking.completed">Just now</span>
                <span v-else>Pending</span>
              </div>
            </div>
            
            <!-- Status indicator -->
            <div class="flex-shrink-0">
              <div 
                v-if="tracking.completed"
                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle class="w-4 h-4 text-green-600" />
              </div>
              <div 
                v-else
                class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Clock class="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Additional details -->
          <div v-if="tracking.created_by" class="flex items-center space-x-2 text-xs text-gray-500">
            <User class="w-3 h-3" />
            <span>Updated by {{ tracking.created_by }}</span>
          </div>

          <!-- Progress indicator for current step -->
          <div v-if="tracking.completed && index === getCurrentStepIndex()" class="mt-3">
            <div class="flex items-center space-x-2 text-xs text-blue-600 font-medium">
              <Loader2 class="w-3 h-3 animate-spin" />
              <span>Currently in progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline completion indicator -->
    <div v-if="isOrderCompleted()" class="mt-8 text-center">
      <div class="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        <CheckCircle class="w-4 h-4" />
        <span>Order completed successfully!</span>
      </div>
    </div>

    <!-- Cancelled order indicator -->
    <div v-if="order.status === 'cancelled'" class="mt-8 text-center">
      <div class="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <XCircle class="w-4 h-4" />
        <span>Order has been cancelled</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Clock, CheckCircle, Package, Truck, User, Calendar, 
  Loader2, XCircle, ShoppingBag, AlertTriangle
} from 'lucide-vue-next'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const timeline = computed(() => {
  if (!props.order) return []

  const statusFlow = [
    'pending',
    'assigned_to_driver',
    'picked_up',
    'delivered'
  ]

  const currentStatusIndex = statusFlow.indexOf(props.order.status)

  return statusFlow.map((status, index) => {
    const trackingItem = props.order.tracking_history?.find(t => t.status === status)

    return {
      status,
      completed: index <= currentStatusIndex && props.order.status !== 'cancelled',
      timestamp: trackingItem?.timestamp || (index <= currentStatusIndex ? props.order.created_at : null),
      notes: trackingItem?.notes || getDefaultStatusNote(status),
      created_by: trackingItem?.created_by_name
    }
  })
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusClasses = (status) => {
  const classes = {
    pending: 'bg-orange-500 text-white',
    assigned_to_driver: 'bg-indigo-500 text-white',
    picked_up: 'bg-blue-600 text-white',
    delivered: 'bg-green-500 text-white',
    cancelled: 'bg-red-500 text-white'
  }
  return classes[status] || 'bg-gray-500 text-white'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    assigned_to_driver: Truck,
    picked_up: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
  }
  return icons[status] || Package
}

const getDefaultStatusNote = (status) => {
  const notes = {
    pending: 'Order has been placed and is awaiting processing',
    assigned_to_driver: 'Order has been assigned to a delivery driver',
    picked_up: 'Order has been picked up and is on the way to you',
    delivered: 'Order has been successfully delivered to your address'
  }
  return notes[status] || ''
}

const getCurrentStepIndex = () => {
  const statusFlow = [
    'pending',
    'assigned_to_driver',
    'picked_up',
    'delivered'
  ]
  return statusFlow.indexOf(props.order.status)
}

const isOrderCompleted = () => {
  return props.order.status === 'delivered'
}
</script>

<style scoped>
/* Additional styles if needed */
</style>