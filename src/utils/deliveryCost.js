/**
 * Utility functions for delivery cost calculations
 * Handles single seller and multi-seller delivery cost scenarios
 */

/**
 * Groups cart items by seller
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Grouped items by seller ID
 */
export const groupItemsBySeller = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) {
    return {}
  }

  return cartItems.reduce((groups, item) => {
    const sellerId = item.product?.seller?.id
    if (sellerId) {
      if (!groups[sellerId]) {
        groups[sellerId] = {
          seller_id: sellerId,
          seller_name: item.product.seller.name,
          items: []
        }
      }
      groups[sellerId].items.push(item)
    }
    return groups
  }, {})
}

/**
 * Determines delivery type for a group of items from the same seller
 * @param {Array} items - Items from the same seller
 * @returns {Object} - Delivery type information
 */
export const getDeliveryTypeForSellerGroup = (items) => {
  if (!items || !Array.isArray(items)) {
    return { type: 'standard', hasStandard: false, hasExpress: false }
  }

  const hasExpress = items.some(item => item.express_delivery === true)
  const hasStandard = items.some(item => item.express_delivery !== true)

  let type = 'standard'
  if (hasExpress && hasStandard) {
    type = 'mixed' // Some items are express, some are standard
  } else if (hasExpress && !hasStandard) {
    type = 'express' // All items are express
  }

  return {
    type,
    hasStandard,
    hasExpress
  }
}

/**
 * Calculate delivery cost for single seller scenarios
 * @param {Array} items - Items from single seller
 * @param {number} standardCost - Standard delivery cost
 * @param {number} expressCost - Express delivery cost
 * @returns {Object} - Calculated delivery cost with breakdown
 */
export const calculateSingleSellerDeliveryCost = (items, standardCost, expressCost) => {
  const deliveryInfo = getDeliveryTypeForSellerGroup(items)
  
  let totalCost = 0
  let breakdown = {
    standard_cost: 0,
    express_cost: 0,
    total_cost: 0
  }

  switch (deliveryInfo.type) {
    case 'standard':
      // Scenario 1: All items have standard delivery
      totalCost = standardCost
      breakdown.standard_cost = standardCost
      break
    
    case 'express':
      // Scenario 3: All items have express delivery
      totalCost = expressCost
      breakdown.express_cost = expressCost
      break
    
    case 'mixed':
      // Scenario 2: Mixed delivery options (sum of standard + express)
      totalCost = standardCost + expressCost
      breakdown.standard_cost = standardCost
      breakdown.express_cost = expressCost
      break
  }

  breakdown.total_cost = totalCost

  return {
    delivery_cost: totalCost,
    delivery_type: deliveryInfo.type,
    breakdown
  }
}

/**
 * Calculate delivery cost for multiple sellers
 * @param {Object} sellerGroups - Items grouped by seller
 * @param {number} standardCost - Standard delivery cost per seller
 * @param {number} expressCost - Express delivery cost per seller
 * @returns {Object} - Total delivery cost with detailed breakdown
 */
export const calculateMultiSellerDeliveryCost = (sellerGroups, standardCost, expressCost) => {
  let totalDeliveryCost = 0
  const sellerBreakdowns = []
  let totalStandardCost = 0
  let totalExpressCost = 0

  Object.values(sellerGroups).forEach(sellerGroup => {
    const sellerCostInfo = calculateSingleSellerDeliveryCost(
      sellerGroup.items,
      standardCost,
      expressCost
    )

    totalDeliveryCost += sellerCostInfo.delivery_cost
    totalStandardCost += sellerCostInfo.breakdown.standard_cost
    totalExpressCost += sellerCostInfo.breakdown.express_cost

    sellerBreakdowns.push({
      seller_id: sellerGroup.seller_id,
      seller_name: sellerGroup.seller_name,
      delivery_cost: sellerCostInfo.delivery_cost,
      delivery_type: sellerCostInfo.delivery_type,
      breakdown: sellerCostInfo.breakdown,
      items: sellerGroup.items
    })
  })

  return {
    total_delivery_cost: totalDeliveryCost,
    seller_groups: sellerBreakdowns,
    breakdown: {
      total_standard_cost: totalStandardCost,
      total_express_cost: totalExpressCost,
      total_mixed_cost: totalDeliveryCost - totalStandardCost - totalExpressCost
    }
  }
}

/**
 * Format delivery cost for display
 * @param {number} cost - Cost amount
 * @param {string} currency - Currency symbol (default: 'FCFA')
 * @returns {string} - Formatted cost string
 */
export const formatDeliveryCost = (cost, currency = 'FCFA') => {
  return `${cost.toLocaleString()} ${currency}`
}

/**
 * Validate cart items for delivery calculation
 * @param {Array} cartItems - Cart items to validate
 * @returns {Object} - Validation result
 */
export const validateCartItemsForDelivery = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) {
    return { valid: false, error: 'Cart items must be an array' }
  }

  if (cartItems.length === 0) {
    return { valid: false, error: 'Cart is empty' }
  }

  const invalidItems = cartItems.filter(item => 
    !item.product || 
    !item.product.seller || 
    !item.product.seller.id
  )

  if (invalidItems.length > 0) {
    return { 
      valid: false, 
      error: `${invalidItems.length} items missing seller information` 
    }
  }

  return { valid: true }
}

/**
 * Example usage scenarios for testing
 */
export const exampleScenarios = {
  // Scenario 1: Single seller, all standard delivery
  singleSellerStandard: [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 2
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    }
  ],

  // Scenario 2: Single seller, mixed delivery
  singleSellerMixed: [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 2
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: true,
      quantity: 1
    }
  ],

  // Scenario 3: Single seller, all express delivery
  singleSellerExpress: [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: true,
      quantity: 2
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: true,
      quantity: 1
    }
  ],

  // Scenario 4: Multiple sellers with different delivery types
  multiSeller: [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 2
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 2, name: 'Seller 2' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 2, name: 'Seller 2' } },
      express_delivery: true,
      quantity: 1
    }
  ]
}