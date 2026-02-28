<template>
  <div class="page-container pb-24">
    <!-- Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-4 py-4 shadow-nav">
      <h2 class="text-lg font-bold text-navy">My Wishlist</h2>
    </div>

    <!-- Empty State -->
    <div v-if="wishlist.items.length === 0" class="px-4 py-16">
      <div class="card-flat p-8 text-center">
        <div class="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 class="w-8 h-8 text-grey-400" />
        </div>
        <h3 class="text-base font-bold text-navy mb-2">Your wishlist is empty</h3>
        <p class="text-sm text-grey-500">Browse products and add them to your wishlist.</p>
      </div>
    </div>

    <!-- Wishlist Grid -->
    <div v-else class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div v-for="item in wishlist.items" :key="item.id" class="flex flex-col">
          <!-- Product Image -->
          <div class="bg-grey-50 rounded-2xl shadow-card overflow-hidden mb-2 aspect-square">
            <img 
              :src="item.image || 'https://via.placeholder.com/150'" 
              :alt="item.name"
              class="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <!-- Product Info -->
          <div class="space-y-1.5">
            <h3 class="font-bold text-xs text-navy line-clamp-2 leading-tight capitalize">
              {{ item.name }}
            </h3>
            <p class="font-semibold text-sm text-navy">
              {{ formatApiPrice({ price: item.price, currency_info: item.currency_info }) }}
            </p>
            <div class="flex items-center gap-2 pt-1">
              <button 
                @click="addToCart(item)"
                class="flex-1 py-2 bg-navy text-white text-xs font-semibold rounded-2xl hover:bg-navy/90 transition-colors"
              >
                Add to Cart
              </button>
              <button 
                @click="wishlist.remove(item.id)"
                class="w-9 h-9 flex items-center justify-center bg-grey-50 rounded-2xl hover:bg-red-50 transition-colors"
              >
                <Trash2 class="w-4 h-4 text-grey-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useCurrency } from '@/composables/useCurrency'
import { Trash2 } from 'lucide-vue-next'

const wishlist = useWishlistStore()
const cart = useCartStore()
const { formatApiPrice } = useCurrency()

const addToCart = (item) => {
  cart.addToCart(item, 1)
  wishlist.remove(item.id)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>