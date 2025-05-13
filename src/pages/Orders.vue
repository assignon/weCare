<template>
  <div class="orders-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">My Orders</h2>
      <v-skeleton-loader v-if="loading" type="list-item, list-item, list-item" />
      <v-alert v-if="error" type="error">{{ error }}</v-alert>
      <v-list v-if="orders.length">
        <v-list-item v-for="order in orders" :key="order.id" :to="{ name: 'OrderStatus', params: { id: order.id } }" link>
          <v-list-item-content>
            <v-list-item-title>Order #{{ order.id }}</v-list-item-title>
            <v-list-item-subtitle>{{ order.created_at ? new Date(order.created_at).toLocaleString() : '' }}</v-list-item-subtitle>
            <v-list-item-subtitle>Status: {{ order.status }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <span>${{ order.total }}</span>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-alert v-else-if="!loading && !error" type="info">No orders found.</v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)
const error = ref(null)

const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/orders/')
    orders.value = res.data.results || res.data
  } catch (err) {
    error.value = 'Failed to load orders.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.orders-page {
  padding-bottom: 64px;
}
</style> 