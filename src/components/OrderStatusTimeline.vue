<template>
  <v-timeline density="compact" side="end">
    <v-timeline-item v-for="(tracking, index) in timeline" :key="index"
      :dot-color="tracking.completed ? getStatusColor(tracking.status) : 'grey-lighten-2'" size="small">
      <template #icon>
        <v-icon :color="tracking.completed ? 'white' : 'grey'" size="small">
          {{ getStatusIcon(tracking.status) }}
        </v-icon>
      </template>

      <div class="d-flex justify-space-between align-center">
        <div>
          <h4 class="text-subtitle-1 font-weight-medium">
            {{ formatStatus(tracking.status) }}
          </h4>
          <p v-if="tracking.notes" class="text-body-2 text-medium-emphasis mb-1">
            {{ tracking.notes }}
          </p>
          <p v-if="tracking.timestamp" class="text-caption text-medium-emphasis">
            {{ formatDate(tracking.timestamp) }}
          </p>
        </div>
        <v-icon v-if="tracking.completed" color="success" size="small">
          mdi-check-circle
        </v-icon>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>

<script setup>
import { computed } from 'vue'

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    assigned_to_driver: 'blue',
    picked_up: 'indigo',
    delivered: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'mdi-clock-outline',
    assigned_to_driver: 'mdi-package-variant',
    picked_up: 'mdi-truck',
    delivered: 'mdi-check-circle',
    cancelled: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-package-variant-closed'
}

const getDefaultStatusNote = (status) => {
  const notes = {
    pending: 'Order has been placed and is awaiting processing',
    assigned_to_driver: 'Order is prepared by the seller and is awaiting pickup by the delivery driver',
    picked_up: 'Order has been picked up and is on the way',
    delivered: 'Order has been successfully delivered'
  }
  return notes[status] || ''
}
</script>