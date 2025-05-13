import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const addToCart = (product, quantity = 1) => {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  const removeFromCart = (productId) => {
    items.value = items.value.filter(i => i.id !== productId)
  }

  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(i => i.id === productId)
    if (item) item.quantity = quantity
  }

  const clearCart = () => {
    items.value = []
  }

  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems
  }
}) 