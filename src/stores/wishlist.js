import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])

  const add = (product) => {
    if (!items.value.find(i => i.id === product.id)) {
      items.value.push(product)
    }
  }

  const remove = (productId) => {
    items.value = items.value.filter(i => i.id !== productId)
  }

  const clear = () => {
    items.value = []
  }

  return {
    items,
    add,
    remove,
    clear
  }
}) 