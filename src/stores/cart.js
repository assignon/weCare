import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { apiService } from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const cartUpdated = ref(false)
  const cartId = ref(null)
  
  // Initialize cartUpdated from localStorage
  const initCartState = () => {
    const stored = localStorage.getItem('cartUpdated')
    cartUpdated.value = stored === 'true'
  }
  
  // Watch for cart changes and update localStorage
  watch(cartUpdated, (newValue) => {
    localStorage.setItem('cartUpdated', newValue.toString())
  })
  
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })
  
  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })
  
  const addToCart = async (product, quantity = 1) => {
    const existingItemIndex = items.value.findIndex(
      item => item.id === product.id && item.selectedVariant?.id === product.selectedVariant.id
    )
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      items.value[existingItemIndex].quantity = quantity
    } else {
      // Add new item
      items.value.push({
        ...product,
        quantity,
        cartItemId: `${product.id}-${product.selectedVariant.id}`
      })
    }
    
    cartUpdated.value = true
  }
  
  const updateVariantQuantity = async (productId, variantId, newQuantity) => {
    const itemIndex = items.value.findIndex(
      item => item.id === productId && item.selectedVariant?.id === variantId
    )
    
    if (itemIndex > -1) {
      items.value[itemIndex].quantity = newQuantity
      cartUpdated.value = true
    }
  }
  
  const removeVariant = async (productId, variantId) => {
    const itemIndex = items.value.findIndex(
      item => item.id === productId && item.selectedVariant?.id === variantId
    )
    
    if (itemIndex > -1) {
      items.value.splice(itemIndex, 1)
      cartUpdated.value = true
    }
  }
  
  const clearCart = () => {
    items.value = []
    cartUpdated.value = false
    cartId.value = null
  }
  
  const syncCartWithBackend = async () => {
    if (!cartUpdated.value) return
    
    try {
      // If cart is empty, just fetch the latest state
      if (items.value.length === 0) {
        await fetchCart()
        return
      }

      // If we have a cart ID, update existing cart
      if (cartId.value) {
        // Update each item in the cart
        for (const item of items.value) {
          await apiService.updateCartItem(cartId.value, {
            product_id: item.id,
            variant_id: item.selectedVariant.id,
            quantity: item.quantity
          })
        }
      } else {
        // Create new cart with items
        const cartItems = items.value.map(item => ({
          product_id: item.id,
          variant_id: item.selectedVariant.id,
          quantity: item.quantity
        }))
        
        const response = await apiService.createCart(cartItems)
        cartId.value = response.data.id
      }
      
      // Fetch latest cart state
      const cartResponse = await apiService.getCart()
      items.value = cartResponse.data.items
      cartUpdated.value = false
    } catch (error) {
      console.error('Failed to sync cart with backend:', error)
      throw error
    }
  }
  
  const fetchCart = async () => {
    try {
      const response = await apiService.getCart()
      items.value = response.data.items
      cartId.value = response.data.id
      cartUpdated.value = false
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      throw error
    }
  }
  
  return {
    items,
    totalItems,
    subtotal,
    cartUpdated,
    cartId,
    addToCart,
    updateVariantQuantity,
    removeVariant,
    clearCart,
    syncCartWithBackend,
    fetchCart,
    initCartState
  }
}) 