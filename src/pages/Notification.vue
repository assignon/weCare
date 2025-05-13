<template>
  <div class="notification-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">Notifications</h2>
      <v-skeleton-loader v-if="loading" type="list-item, list-item, list-item" />
      <v-alert v-if="error" type="error">{{ error }}</v-alert>
      <v-list v-if="notifications.length">
        <v-list-item v-for="n in notifications" :key="n.id">
          <v-list-item-content>
            <v-list-item-title>{{ n.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ n.body }}</v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption">{{ n.created_at ? new Date(n.created_at).toLocaleString() : '' }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-alert v-else-if="!loading && !error" type="info">No notifications found.</v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)

const fetchNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/notifications/')
    notifications.value = res.data.results || res.data
  } catch (err) {
    error.value = 'Failed to load notifications.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotifications)
</script>

<style scoped>
.notification-page {
  padding-bottom: 64px;
}
</style> 