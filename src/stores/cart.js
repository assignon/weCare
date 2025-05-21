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
      item => item.id === product.id && item.variant === product.variant
    )
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      items.value[existingItemIndex].quantity = quantity
    } else {
      // Add new item
      items.value.push({
        ...product,
        quantity,
        cartItemId: `${product.id}-${product.variant}`
      })
    }
    
    cartUpdated.value = true
    
    // Create a new cart when adding items
    try {
      await createNewCart()
    } catch (error) {
      console.error('Failed to create cart:', error)
    }
  }
  
  const updateVariantQuantity = async (cartItemId, variantId, newQuantity, stock) => {
    try {
      // Check if items structure is properly loaded
      if (!items.value || !items.value.items) {
        console.error('Cart data not properly loaded');
        return;
      }
      
      // Find the specific cart item
      const cartItem = items.value.items.find(item => item.id === cartItemId);
      if (!cartItem) {
        console.error('Cart item not found:', cartItemId);
        return;
      }
      
      // Find the specific variant in the cart item
      const variantExists = cartItem.variants.some(v => v.id === variantId);
      if (!variantExists) {
        console.error('Variant not found in cart item:', variantId);
        return;
      }
      
      // Call the API to update the cart item with specific variant
      await apiService.updateCartItem({
        id: cartItemId,
        variant_id: variantId,
        quantity: newQuantity,
        stock: stock
      });
      
      // Refresh the cart data
      await fetchCart();
    } catch (error) {
      console.error('Error updating variant quantity:', error);
    }
  }
  
  const removeVariant = async (cartItemId) => {
    try {
      // Check if items structure is properly loaded
      if (!items.value || !items.value.items) {
        console.error('Cart data not properly loaded');
        return;
      }
      
      // Call the API to remove the cart item
      await apiService.removeCartItem(cartItemId);
      
      // Refresh the cart data
      await fetchCart();
    } catch (error) {
      console.error('Error removing variant:', error);
    }
  }
  
  const clearCart = async () => {
    try {
      // Call the API to clear the cart
      await apiService.clearCart();
      
      // Reset the cart data structure
      items.value = {
        items: [],
        total_amount: 0,
        total_items: 0
      };
      
      cartUpdated.value = false;
      cartId.value = null;
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  const removeItem = async (itemId) => {
    try {
      await apiService.removeCartItem(cartId.value, itemId)
      cartUpdated.value = true
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }
  
  
  const fetchCart = async () => {
    try {
      const response = await apiService.getCart()
      
      // Handle both direct items array or nested structure
      if (response.data && response.data.items) {
        items.value = response.data
        // If the response includes a cart ID, store it
        if (response.data.id) {
          cartId.value = response.data.id
        }
      } else {
        // If the API returns the items directly
        items.value = response.data || []
      }
      
      cartUpdated.value = false
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      throw error
    }
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
            id: item.id,
            product_id: item.product_id,
            variant_id: item.variant,
            quantity: item.quantity,
            stock: item.stock && item.stock.available ? item.stock.available : 0
          })
        }
        
        // Fetch latest cart state
        await fetchCart()
      } else {
        // If we don't have a cart ID but have items, we should fetch first
        // to see if a cart already exists
        await fetchCart()
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error)
      throw error
    }
  }
  
  // Update the createNewCart function to handle quantities correctly
  const createNewCart = async (selectedVariant, quantity, product_id) => {
    try {
      // Create a single cart item with the correct quantity
      const cartItem = {
        product_id: product_id,
        variant_id: selectedVariant.id,
        quantity: quantity // Use the exact quantity passed in
      };
      
      // Create new cart with the single item
      const response = await apiService.createCart([cartItem]);
      if (response.data && response.data.id) {
        cartId.value = response.data.id;
      }
      
      // Fetch latest cart state
      await fetchCart();
      
      // Reset the updated flag
      cartUpdated.value = false;
    } catch (error) {
      console.error('Failed to create cart:', error);
      throw error;
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
    removeItem,
    syncCartWithBackend,
    fetchCart,
    initCartState,
    createNewCart
  }
}) 