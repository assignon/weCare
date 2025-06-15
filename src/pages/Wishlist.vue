<template>
  <div class="wishlist-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">My Wishlist</h2>
      <v-alert v-if="wishlist.items.length === 0" type="info">Your wishlist is empty.</v-alert>
      <v-row v-else>
        <v-col v-for="item in wishlist.items" :key="item.id" cols="12" sm="6" md="4">
          <v-card class="mb-4">
            <v-img :src="item.image || 'https://via.placeholder.com/150'" height="160" />
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ item.name }}</v-card-title>
            <v-card-subtitle class="text-body-2">{{ formatApiPrice({
              price: item.price, currency_info:
                item.currency_info }) }}</v-card-subtitle>
            <v-card-actions>
              <v-btn color="primary" @click="addToCart(item)">Add to Cart</v-btn>
              <v-btn icon color="error" @click="wishlist.remove(item.id)"><v-icon>mdi-delete</v-icon></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useCurrency } from '@/composables/useCurrency'

const wishlist = useWishlistStore()
const cart = useCartStore()
const { formatApiPrice } = useCurrency()

const addToCart = (item) => {
  cart.addToCart(item, 1)
  wishlist.remove(item.id)
}
</script>

<style scoped>
.wishlist-page {
  padding-bottom: 64px;
}
</style>