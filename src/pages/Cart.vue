<template>
  <div class="cart-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">My Cart</h2>
      <v-alert v-if="cart.items.length === 0" type="info">Your cart is empty.</v-alert>
      <v-list v-else>
        <v-list-item v-for="item in cart.items" :key="item.id">
          <v-list-item-avatar>
            <v-img :src="item.image || 'https://via.placeholder.com/80'" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>${{ item.price }}</v-list-item-subtitle>
            <v-text-field
              v-model.number="item.quantity"
              type="number"
              min="1"
              style="max-width: 80px;"
              @change="cart.updateQuantity(item.id, item.quantity)"
              hide-details
              dense
              label="Qty"
            />
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon color="error" @click="cart.removeFromCart(item.id)"><v-icon>mdi-delete</v-icon></v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <div v-if="cart.items.length > 0" class="mt-6">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="font-weight-bold">Total:</span>
          <span class="text-h6">${{ cart.totalPrice.toFixed(2) }}</span>
        </div>
        <v-btn color="primary" block :to="{ name: 'Checkout' }">Checkout</v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
const cart = useCartStore()
</script>

<style scoped>
.cart-page {
  padding-bottom: 64px;
}
</style> 