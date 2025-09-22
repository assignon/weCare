import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import { 
  groupItemsBySeller, 
  calculateMultiSellerDeliveryCost,
  validateCartItemsForDelivery,
  formatDeliveryCost
} from '@/utils/deliveryCost'

export const useDeliveryCostStore = defineStore('deliveryCost', () => {
  // State
  const loading = ref(false)
  const error = ref(null)
  const deliveryCosts = ref({
    total_delivery_cost: 0,
    seller_groups: [],
    breakdown: {
      total_standard_cost: 0,
      total_express_cost: 0,
      total_mixed_cost: 0
    }
  })
  
  // Default costs (can be overridden by API)
  const defaultCosts = ref({
    standard: 10, // FCFA
    express: 15   // FCFA
  })

  // Getters
  const totalDeliveryCost = computed(() => deliveryCosts.value.total_delivery_cost || 0)
  const hasMultipleSellers = computed(() => deliveryCosts.value.seller_groups.length > 1)
  const sellerCount = computed(() => deliveryCosts.value.seller_groups.length)
  
  const formattedTotalCost = computed(() => 
    formatDeliveryCost(totalDeliveryCost.value)
  )

  const deliveryBreakdown = computed(() => deliveryCosts.value.breakdown)

  // Actions
  async function calculateDeliveryCostFromAPI(cartItems, customerAddress = null) {
    loading.value = true
    error.value = null

    try {
      // Validate cart items
      const validation = validateCartItemsForDelivery(cartItems)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Call the API to calculate multi-seller delivery cost
      const response = await apiService.calculateMultiSellerDeliveryFee(cartItems, customerAddress)
      
      if (response.data) {
        deliveryCosts.value = {
          total_delivery_cost: response.data.total_delivery_cost || 0,
          seller_groups: response.data.seller_groups || [],
          breakdown: response.data.breakdown || {
            total_standard_cost: 0,
            total_express_cost: 0,
            total_mixed_cost: 0
          }
        }
        
        return deliveryCosts.value
      } else {
        throw new Error('No delivery cost data received')
      }
    } catch (err) {
      error.value = err.message || 'Failed to calculate delivery cost'
      console.error('Error calculating delivery cost:', err)
      
      // Fallback to local calculation
      return calculateDeliveryCostLocally(cartItems)
    } finally {
      loading.value = false
    }
  }

  function calculateDeliveryCostLocally(cartItems) {
    loading.value = true
    error.value = null
    
    try {
      // Validate cart items
      const validation = validateCartItemsForDelivery(cartItems)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Group items by seller
      const sellerGroups = groupItemsBySeller(cartItems)
      
      // Calculate delivery costs
      const result = calculateMultiSellerDeliveryCost(
        sellerGroups, 
        defaultCosts.value.standard, 
        defaultCosts.value.express
      )

      deliveryCosts.value = result
      return result
    } catch (err) {
      error.value = err.message || 'Failed to calculate delivery cost locally'
      console.error('Error in local delivery cost calculation:', err)
      
      // Return default result with standard delivery cost for fallback
      const fallbackResult = {
        total_delivery_cost: defaultCosts.value.standard,
        seller_groups: [{
          seller_id: 'default',
          seller_name: 'Default Seller',
          delivery_cost: defaultCosts.value.standard,
          delivery_type: 'standard',
          breakdown: {
            standard_cost: defaultCosts.value.standard,
            express_cost: 0,
            total_cost: defaultCosts.value.standard
          },
          items: cartItems || []
        }],
        breakdown: {
          total_standard_cost: defaultCosts.value.standard,
          total_express_cost: 0,
          total_mixed_cost: 0
        }
      }
      
      deliveryCosts.value = fallbackResult
      return fallbackResult
    } finally {
      loading.value = false
    }
  }

  function updateDefaultCosts(standard, express) {
    defaultCosts.value.standard = standard
    defaultCosts.value.express = express
  }

  function clearDeliveryCosts() {
    deliveryCosts.value = {
      total_delivery_cost: 0,
      seller_groups: [],
      breakdown: {
        total_standard_cost: 0,
        total_express_cost: 0,
        total_mixed_cost: 0
      }
    }
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  // Utility functions
  function getSellerDeliveryCost(sellerId) {
    const seller = deliveryCosts.value.seller_groups.find(
      group => group.seller_id === sellerId
    )
    return seller ? seller.delivery_cost : 0
  }

  function getSellerDeliveryType(sellerId) {
    const seller = deliveryCosts.value.seller_groups.find(
      group => group.seller_id === sellerId
    )
    return seller ? seller.delivery_type : 'standard'
  }

  function getSellerBreakdown(sellerId) {
    const seller = deliveryCosts.value.seller_groups.find(
      group => group.seller_id === sellerId
    )
    return seller ? seller.breakdown : {
      standard_cost: 0,
      express_cost: 0,
      total_cost: 0
    }
  }

  // Debug function to get detailed information
  function getDeliveryDebugInfo() {
    return {
      state: {
        loading: loading.value,
        error: error.value,
        deliveryCosts: deliveryCosts.value,
        defaultCosts: defaultCosts.value
      },
      computed: {
        totalDeliveryCost: totalDeliveryCost.value,
        hasMultipleSellers: hasMultipleSellers.value,
        sellerCount: sellerCount.value,
        formattedTotalCost: formattedTotalCost.value,
        deliveryBreakdown: deliveryBreakdown.value
      }
    }
  }

  return {
    // State
    loading,
    error,
    deliveryCosts,
    defaultCosts,
    
    // Getters
    totalDeliveryCost,
    hasMultipleSellers,
    sellerCount,
    formattedTotalCost,
    deliveryBreakdown,
    
    // Actions
    calculateDeliveryCostFromAPI,
    calculateDeliveryCostLocally,
    updateDefaultCosts,
    clearDeliveryCosts,
    clearError,
    
    // Utilities
    getSellerDeliveryCost,
    getSellerDeliveryType,
    getSellerBreakdown,
    getDeliveryDebugInfo
  }
})