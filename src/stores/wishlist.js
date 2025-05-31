import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const defaultWishlist = ref(null)

  // Getters
  const wishlistItems = computed(() => {
    if (defaultWishlist.value && Array.isArray(defaultWishlist.value.products)) {
      return defaultWishlist.value.products
    }
    return []
  })
  const itemCount = computed(() => wishlistItems.value.length)
  const isInWishlist = computed(() => (productId) => {
    const items = wishlistItems.value
    return Array.isArray(items) && items.some(item => item.id === productId)
  })

  // Actions
  const fetchWishlist = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getWishlist()
      items.value = response.data || []
      
      // Get or create default wishlist
      if (items.value.length === 0) {
        try {
          // Create default wishlist if none exists
          const createResponse = await apiService.createWishlist()
          defaultWishlist.value = createResponse.data
          items.value = [createResponse.data]
        } catch (createError) {
          console.error('Failed to create default wishlist:', createError)
          // Set empty default wishlist structure
          defaultWishlist.value = { id: null, products: [] }
        }
      } else {
        // Use the first wishlist as default
        defaultWishlist.value = items.value[0]
      }
      
      return items.value
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
      error.value = 'Failed to load wishlist'
      // Set empty default wishlist structure on error
      defaultWishlist.value = { id: null, products: [] }
      items.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // Initialize default wishlist structure
  const initializeDefaultWishlist = () => {
    if (!defaultWishlist.value) {
      defaultWishlist.value = { id: null, products: [] }
    }
  }

  const addToWishlist = async (productId) => {
    // Initialize or fetch wishlist if needed
    if (!defaultWishlist.value || !defaultWishlist.value.id) {
      try {
        await fetchWishlist()
      } catch (error) {
        console.error('Failed to fetch wishlist, initializing empty one:', error)
        initializeDefaultWishlist()
      }
    }
    
    // // If still no valid wishlist, try to create one
    // if (!defaultWishlist.value || !defaultWishlist.value.id) {
    //   try {
    //     const createResponse = await apiService.createWishlist()
    //     defaultWishlist.value = createResponse.data
    //     items.value = [createResponse.data]
    //   } catch (createError) {
    //     console.error('Failed to create wishlist:', createError)
    //     error.value = 'Failed to create wishlist'
    //     return
    //   }
    // }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.addToWishlist(productId)
      
      // Update the default wishlist with the response
      defaultWishlist.value = response.data
      
      // // Update items array
      // const index = items.value.findIndex(w => w.id === defaultWishlist.value.id)
      // if (index !== -1) {
      //   items.value[index] = defaultWishlist.value
      // }
      
      return response.data
    } catch (err) {
      console.error('Failed to add to wishlist:', err)
      error.value = 'Failed to add to wishlist'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeFromWishlist = async (productId) => {
    // Initialize or fetch wishlist if needed
    if (!defaultWishlist.value || !defaultWishlist.value.id) {
      try {
        await fetchWishlist()
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
        initializeDefaultWishlist()
        return false
      }
    }
    
    // If no valid wishlist, nothing to remove
    if (!defaultWishlist.value || !defaultWishlist.value.id) {
      return false
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.removeFromWishlist(defaultWishlist.value.id, productId)
      
      // Update the default wishlist with the response
      defaultWishlist.value = response.data
      
      // Update items array
      const index = items.value.findIndex(w => w.id === defaultWishlist.value.id)
      if (index !== -1) {
        items.value[index] = defaultWishlist.value
      }
      
      return true
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
      error.value = 'Failed to remove from wishlist'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleWishlist = async (productId) => {
    if (isInWishlist.value(productId)) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  }

  const clearWishlist = () => {
    items.value = []
    defaultWishlist.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize on store creation
  initializeDefaultWishlist()

  return {
    // State
    items,
    loading,
    error,
    defaultWishlist,
    
    // Getters
    wishlistItems,
    itemCount,
    isInWishlist,
    
    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    clearError,
    initializeDefaultWishlist
  }
}) 