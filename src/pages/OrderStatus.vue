<template>
  <div class="order-status-page">
    <v-container>
      <v-btn icon @click="$router.back()" class="mb-2"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-skeleton-loader v-if="loading" type="list-item, heading, paragraph, actions" />
      <v-alert v-if="error" type="error">{{ error }}</v-alert>
      <div v-if="order">
        <h2 class="text-h6 font-weight-bold mb-2">Order #{{ order.id }}</h2>
        <div class="mb-2">Status: <strong>{{ order.status }}</strong></div>
        <div class="mb-2">Date: {{ order.created_at ? new Date(order.created_at).toLocaleString() : '' }}</div>
        <v-list>
          <v-list-item v-for="item in order.items || []" :key="item.id">
            <v-list-item-content>
              <v-list-item-title>{{ item.product_name }}</v-list-item-title>
              <v-list-item-subtitle>Qty: {{ item.quantity }} &times; ${{ item.price }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div class="d-flex justify-space-between align-center mt-4">
          <span class="font-weight-bold">Total:</span>
          <span class="text-h6">${{ order.total }}</span>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchOrder = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/orders/${route.params.id}/`)
    order.value = res.data
  } catch (err) {
    error.value = 'Failed to load order.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrder)
</script>

<style scoped>
.order-status-page {
  padding-bottom: 64px;
}
</style> 