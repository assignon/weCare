import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const addToCart = (product, quantity = 1) => {
    // Generate a unique cart item ID based on product ID and size if available
    const cartItemId = product.selectedSize 
      ? `${product.id}-${product.selectedSize}`
      : product.id
    
    // Look for existing item with same ID and size
    const existing = items.value.find(item => {
      const itemId = item.selectedSize 
        ? `${item.id}-${item.selectedSize}`
        : item.id
      return itemId === cartItemId
    })
    
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ 
        ...product, 
        cartItemId,
        quantity 
      })
    }
  }

  const removeFromCart = (cartItemId) => {
    items.value = items.value.filter(item => {
      const itemId = item.selectedSize 
        ? `${item.id}-${item.selectedSize}`
        : item.id
      return itemId !== cartItemId
    })
  }

  const updateQuantity = (cartItemId, quantity) => {
    const item = items.value.find(item => {
      const itemId = item.selectedSize 
        ? `${item.id}-${item.selectedSize}`
        : item.id
      return itemId === cartItemId
    })
    
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