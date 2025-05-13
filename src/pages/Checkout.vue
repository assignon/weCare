<template>
  <div class="checkout-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">Checkout</h2>
      <v-list>
        <v-list-item v-for="item in cart.items" :key="item.id">
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>Qty: {{ item.quantity }} &times; ${{ item.price }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <div class="d-flex justify-space-between align-center mb-4 mt-4">
        <span class="font-weight-bold">Total:</span>
        <span class="text-h6">${{ cart.totalPrice.toFixed(2) }}</span>
      </div>
      <v-btn color="primary" block @click="placeOrder" :disabled="cart.items.length === 0">Place Order</v-btn>
      <v-alert v-if="success" type="success" class="mt-4">Order placed successfully!</v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
const cart = useCartStore()
const success = ref(false)

const placeOrder = () => {
  // Simulate order placement
  cart.clearCart()
  success.value = true
}
</script>

<style scoped>
.checkout-page {
  padding-bottom: 64px;
}
</style> 