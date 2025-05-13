<template>
  <div class="product-details-page">
    <v-container>
      <v-btn icon @click="$router.back()" class="mb-2"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-skeleton-loader v-if="loading" type="image, heading, paragraph, actions" />
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <div v-if="product">
        <v-img :src="product.image || 'https://via.placeholder.com/300'" height="220" class="mb-4" />
        <h2 class="text-h5 font-weight-bold mb-2">{{ product.name }}</h2>
        <div class="text-subtitle-1 mb-2">${{ product.price }}</div>
        <div class="text-body-2 mb-4">{{ product.description }}</div>
        <v-btn color="primary" block @click="addToCart">Add to Cart</v-btn>
        <v-btn
          :color="inWishlist ? 'error' : 'secondary'"
          block
          class="mt-2"
          @click="toggleWishlist"
        >
          <v-icon left>{{ inWishlist ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          {{ inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref(null)
const cart = useCartStore()
const wishlist = useWishlistStore()

const fetchProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/products/products/${route.params.id}/`)
    product.value = res.data
  } catch (err) {
    error.value = 'Failed to load product.'
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (product.value) {
    cart.addToCart(product.value, 1)
    alert('Added to cart!')
  }
}

const inWishlist = computed(() => wishlist.items.some(i => i.id === product.value?.id))
const toggleWishlist = () => {
  if (!product.value) return
  if (inWishlist.value) {
    wishlist.remove(product.value.id)
  } else {
    wishlist.add(product.value)
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
.product-details-page {
  padding-bottom: 64px;
}
</style> 